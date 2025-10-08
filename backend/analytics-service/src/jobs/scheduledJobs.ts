import cron from "node-cron";
import { AnalyticsService } from "../services/analyticsService";

const analyticsService = new AnalyticsService();

/**
 * Scheduled Jobs for Analytics and Optimization
 * Runs background tasks to keep data fresh and optimized
 */

/**
 * Update trending scores every hour
 * Aggregates interaction data from MongoDB and syncs to PostgreSQL
 */
export const startTrendingScoreUpdateJob = () => {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    console.log("Running trending score update job...");
    try {
      const result = await analyticsService.batchUpdateTrendingScores();
      console.log(`Updated trending scores for ${result.updated} destinations`);
    } catch (error) {
      console.error("Trending score update job failed:", error);
    }
  });

  console.log("Trending score update job scheduled (hourly)");
};

/**
 * Refresh popular destinations materialized view every 6 hours
 * Improves query performance for popular destination lookups
 */
export const startPopularDestinationsRefreshJob = () => {
  // Run every 6 hours
  cron.schedule("0 */6 * * *", async () => {
    console.log("Running popular destinations refresh job...");
    try {
      await analyticsService.refreshPopularDestinationsView();
      console.log("Popular destinations view refreshed");
    } catch (error) {
      console.error("Popular destinations refresh failed:", error);
    }
  });

  console.log("Popular destinations refresh job scheduled (every 6 hours)");
};

/**
 * Initialize all scheduled jobs
 */
export const initializeScheduledJobs = () => {
  console.log("Initializing scheduled jobs...");
  startTrendingScoreUpdateJob();
  startPopularDestinationsRefreshJob();
  console.log("All scheduled jobs initialized");
};
