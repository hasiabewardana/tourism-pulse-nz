import { UserInteraction } from "../models/userInteractionModel";
import { DestinationAnalytics } from "../models/destinationAnalyticsModel";
import { SearchAnalytics } from "../models/searchAnalyticsModel";
import { Pool } from "pg";

/**
 * Analytics Service
 * Handles user interaction tracking and performance analytics
 * Uses MongoDB for high-write analytics data and PostgreSQL for transactional data
 */
export class AnalyticsService {
  private pgPool: Pool;

  constructor() {
    // PostgreSQL connection for transactional queries
    this.pgPool = new Pool({
      host: process.env.PG_HOST || "localhost",
      port: parseInt(process.env.PG_PORT || "5432"),
      database: process.env.PG_DATABASE || "dest_db",
      user: process.env.PG_USER || "postgres",
      password: process.env.PG_PASSWORD || "postgres",
    });
  }

  /**
   * Track user interaction (MongoDB - high-write volume)
   */
  async trackInteraction(data: {
    userId?: number;
    destinationId: number;
    interactionType:
      | "view"
      | "click"
      | "bookmark"
      | "share"
      | "search"
      | "filter";
    durationSeconds?: number;
    rating?: number;
    metadata?: any;
  }) {
    try {
      const interaction = new UserInteraction({
        userId: data.userId,
        destinationId: data.destinationId,
        interactionType: data.interactionType,
        durationSeconds: data.durationSeconds || 0,
        rating: data.rating,
        metadata: data.metadata || {},
      });

      await interaction.save();

      // Asynchronously update aggregated metrics
      setImmediate(() => this.updateDestinationMetrics(data.destinationId));

      return { success: true, interactionId: interaction._id };
    } catch (error) {
      console.error("Track interaction error:", error);
      throw error;
    }
  }

  /**
   * Track search query (MongoDB)
   */
  async trackSearch(data: {
    userId?: number;
    searchQuery: string;
    filters?: any;
    resultsCount: number;
    noResultsFound?: boolean;
  }) {
    try {
      const searchRecord = new SearchAnalytics({
        userId: data.userId,
        searchQuery: data.searchQuery,
        filters: data.filters,
        resultsCount: data.resultsCount,
        noResultsFound: data.noResultsFound || false,
        timestamp: new Date(),
      });

      await searchRecord.save();

      return { success: true, searchId: searchRecord._id };
    } catch (error) {
      console.error("Track search error:", error);
      throw error;
    }
  }

  /**
   * Update aggregated destination metrics (MongoDB)
   */
  async updateDestinationMetrics(destinationId: number) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Aggregate today's interactions
      const metrics = await UserInteraction.aggregate([
        {
          $match: {
            destinationId: destinationId,
            createdAt: { $gte: today },
          },
        },
        {
          $group: {
            _id: "$interactionType",
            count: { $sum: 1 },
            avgDuration: { $avg: "$durationSeconds" },
          },
        },
      ]);

      // Calculate metrics
      const metricsObject: any = {
        views: 0,
        clicks: 0,
        bookings: 0,
        shares: 0,
        bookmarks: 0,
        averageViewDuration: 0,
      };

      metrics.forEach((m) => {
        if (m._id === "view") {
          metricsObject.views = m.count;
          metricsObject.averageViewDuration = m.avgDuration;
        } else if (m._id === "click") {
          metricsObject.clicks = m.count;
        } else if (m._id === "bookmark") {
          metricsObject.bookmarks = m.count;
        } else if (m._id === "share") {
          metricsObject.shares = m.count;
        }
      });

      // Calculate conversion rate
      if (metricsObject.views > 0) {
        metricsObject.conversionRate =
          (metricsObject.clicks / metricsObject.views) * 100;
      }

      // Update or create analytics record
      await DestinationAnalytics.findOneAndUpdate(
        { destinationId, date: today },
        {
          $set: {
            metrics: metricsObject,
            updatedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );

      // Also update trending score in PostgreSQL
      await this.updateTrendingScore(destinationId);
    } catch (error) {
      console.error("Update metrics error:", error);
    }
  }

  /**
   * Update trending score in PostgreSQL
   */
  async updateTrendingScore(destinationId: number) {
    try {
      // Count interactions in last 7 days from MongoDB
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const interactionCount = await UserInteraction.countDocuments({
        destinationId: destinationId,
        createdAt: { $gte: sevenDaysAgo },
      });

      // Update PostgreSQL
      await this.pgPool.query(
        "UPDATE dest.destinations SET trending_score = $1 WHERE destination_id = $2",
        [interactionCount, destinationId]
      );
    } catch (error) {
      console.error("Update trending score error:", error);
    }
  }

  /**
   * Get destination insights (MongoDB aggregation)
   */
  async getDestinationInsights(destinationId: number, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    try {
      const insights = await UserInteraction.aggregate([
        {
          $match: {
            destinationId: destinationId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              type: "$interactionType",
            },
            count: { $sum: 1 },
            avgDuration: { $avg: "$durationSeconds" },
          },
        },
        {
          $sort: { "_id.date": -1 },
        },
      ]);

      return insights;
    } catch (error) {
      console.error("Get insights error:", error);
      throw error;
    }
  }

  /**
   * Get popular destinations (PostgreSQL + MongoDB hybrid)
   */
  async getPopularDestinations(region?: string, limit: number = 10) {
    try {
      // Use materialized view for performance
      let sql = `
        SELECT * FROM dest.popular_destinations
      `;

      const params: any[] = [];

      if (region) {
        params.push(region);
        sql += ` WHERE region = $1`;
      }

      params.push(limit);
      sql += ` ORDER BY recent_bookings DESC, rating DESC LIMIT $${params.length}`;

      const result = await this.pgPool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error("Get popular destinations error:", error);
      throw error;
    }
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(limit: number = 10) {
    try {
      const trending = await SearchAnalytics.aggregate([
        {
          $match: {
            timestamp: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: "$searchQuery",
            count: { $sum: 1 },
            avgResults: { $avg: "$resultsCount" },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: limit,
        },
      ]);

      return trending;
    } catch (error) {
      console.error("Get trending searches error:", error);
      throw error;
    }
  }

  /**
   * Get user behavior summary
   */
  async getUserBehaviorSummary(userId: number, days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const summary = await UserInteraction.aggregate([
        {
          $match: {
            userId: userId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalInteractions: { $sum: 1 },
            uniqueDestinations: { $addToSet: "$destinationId" },
            interactionTypes: {
              $push: {
                type: "$interactionType",
                destinationId: "$destinationId",
              },
            },
          },
        },
        {
          $project: {
            totalInteractions: 1,
            uniqueDestinationsCount: { $size: "$uniqueDestinations" },
            uniqueDestinations: 1,
            interactionTypes: 1,
          },
        },
      ]);

      if (summary.length === 0) {
        return null;
      }

      // Get favorite categories from PostgreSQL
      const categoryQuery = `
        SELECT d.category, COUNT(*) as count
        FROM dest.destinations d
        WHERE d.destination_id = ANY($1)
        GROUP BY d.category
        ORDER BY count DESC
        LIMIT 3
      `;

      const categoryResult = await this.pgPool.query(categoryQuery, [
        summary[0].uniqueDestinations,
      ]);

      return {
        ...summary[0],
        favoriteCategories: categoryResult.rows,
      };
    } catch (error) {
      console.error("Get user behavior error:", error);
      throw error;
    }
  }

  /**
   * Batch update trending scores (scheduled job)
   */
  async batchUpdateTrendingScores() {
    try {
      console.log("Starting batch trending score update...");

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Aggregate all destination interactions
      const trendingData = await UserInteraction.aggregate([
        {
          $match: {
            createdAt: { $gte: sevenDaysAgo },
          },
        },
        {
          $group: {
            _id: "$destinationId",
            score: { $sum: 1 },
          },
        },
        {
          $sort: { score: -1 },
        },
      ]);

      // Batch update PostgreSQL
      for (const item of trendingData) {
        await this.pgPool.query(
          "UPDATE dest.destinations SET trending_score = $1 WHERE destination_id = $2",
          [item.score, item._id]
        );
      }

      console.log(
        `Updated trending scores for ${trendingData.length} destinations`
      );

      return { updated: trendingData.length };
    } catch (error) {
      console.error("Batch update error:", error);
      throw error;
    }
  }

  /**
   * Refresh materialized view (scheduled job)
   */
  async refreshPopularDestinationsView() {
    try {
      await this.pgPool.query("SELECT dest.refresh_popular_destinations()");
      console.log("Refreshed popular destinations view");
    } catch (error) {
      console.error("Refresh view error:", error);
      throw error;
    }
  }
}
