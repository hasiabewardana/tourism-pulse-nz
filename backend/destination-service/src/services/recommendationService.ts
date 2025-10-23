import { query } from "./db";
import { extractRegion } from "../utils/regionParser";

/**
 * Recommendation Request Interface
 */
export interface RecommendationRequest {
  userId?: number;
  topN?: number;
  preferences?: {
    categories?: string[];
    regions?: string[];
    tags?: string[];
  };
  constraints?: {
    minRating?: number;
    maxPrice?: number;
    requiresAccessibility?: boolean;
    familyFriendly?: boolean;
    petFriendly?: boolean;
  };
  context?: {
    weatherCondition?: string;
    season?: string;
    currentTime?: Date;
  };
}

/**
 * Recommended Destination with score and reasons
 */
export interface RecommendedDestination {
  destination_id: number;
  name: string;
  score: number;
  reasons: string[];
  [key: string]: any;
}

/**
 * Rule-Based Recommendation Service
 * Provides intelligent recommendations using business rules and scoring algorithms
 */
export class RecommendationService {
  /**
   * Get personalized recommendations
   */
  async recommend(
    request: RecommendationRequest
  ): Promise<RecommendedDestination[]> {
    const topN = request.topN || 10;

    // Get all active destinations
    let destinations = await this.getAllDestinations();

    // Apply constraints (hard filters)
    destinations = this.applyConstraints(
      destinations,
      request.constraints || {}
    );

    // Apply contextual filters (weather, season)
    destinations = this.applyContextualFilters(
      destinations,
      request.context || {}
    );

    // Score each destination
    const scored = await Promise.all(
      destinations.map(async (dest) => {
        const score = await this.calculateScore(dest, request);
        const reasons = this.getRecommendationReasons(dest, request, score);
        return {
          ...dest,
          score,
          reasons,
        };
      })
    );

    // Return top N by score
    return scored.sort((a, b) => b.score - a.score).slice(0, topN);
  }

  /**
   * Get all active destinations
   */
  private async getAllDestinations(): Promise<any[]> {
    const sql = `
      SELECT 
        d.*,
        ST_AsText(d.location) AS location_text
      FROM dest.destinations d
      WHERE d.status IN ('active', 'Open')
    `;
    const destinations = await query(sql, []);

    // Parse photos field if it's a string
    return destinations.map((dest: any) => ({
      ...dest,
      photos:
        typeof dest.photos === "string"
          ? JSON.parse(dest.photos)
          : Array.isArray(dest.photos)
          ? dest.photos
          : [],
      tags:
        typeof dest.tags === "string"
          ? JSON.parse(dest.tags)
          : Array.isArray(dest.tags)
          ? dest.tags
          : [],
    }));
  }

  /**
   * Apply hard constraints (must-have filters)
   */
  private applyConstraints(destinations: any[], constraints: any): any[] {
    return destinations.filter((dest) => {
      if (constraints.minRating && (dest.rating || 0) < constraints.minRating) {
        return false;
      }
      if (
        constraints.maxPrice &&
        (dest.estimated_cost || 0) > constraints.maxPrice
      ) {
        return false;
      }
      if (constraints.requiresAccessibility && !dest.accessibility_features) {
        return false;
      }
      if (constraints.familyFriendly && !dest.family_friendly) {
        return false;
      }
      if (constraints.petFriendly && !dest.pet_friendly) {
        return false;
      }
      return true;
    });
  }

  /**
   * Apply contextual filters (weather, season, time)
   */
  private applyContextualFilters(destinations: any[], context: any): any[] {
    return destinations.filter((dest) => {
      // Weather-based filtering
      if (
        context.weatherCondition === "rainy" &&
        dest.is_outdoor &&
        !dest.is_indoor
      ) {
        return false;
      }
      if (
        context.weatherCondition === "sunny" &&
        dest.category === "Indoor Entertainment"
      ) {
        // Don't exclude, just deprioritize (handled in scoring)
      }

      // Season-based filtering (basic)
      if (
        context.season === "winter" &&
        dest.tags &&
        dest.tags.includes("summer-only")
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Calculate recommendation score for a destination
   */
  private async calculateScore(
    destination: any,
    request: RecommendationRequest
  ): Promise<number> {
    let score = 0;

    // Base rating score (0-75 points)
    score += (destination.rating || 0) * 15;

    // Category match (0-30 points)
    if (request.preferences?.categories?.includes(destination.category)) {
      score += 30;
    }

    // Region match (0-25 points)
    const destRegion =
      destination.region || extractRegion(destination.location_name || "");
    if (request.preferences?.regions?.includes(destRegion)) {
      score += 25;
    }

    // Tag match (0-20 points)
    if (request.preferences?.tags && destination.tags) {
      const matchingTags = request.preferences.tags.filter((tag) =>
        destination.tags.includes(tag)
      );
      score += matchingTags.length * 10;
    }

    // Popularity score (0-20 points)
    score += Math.min((destination.trending_score || 0) / 10, 20);

    // Review count (0-10 points)
    score += Math.min((destination.review_count || 0) / 10, 10);

    // Association score if user has history
    if (request.userId) {
      const assocScore = await this.getAssociationScore(
        destination.destination_id,
        request.userId
      );
      score += assocScore;
    }

    // Weather bonus
    if (
      request.context?.weatherCondition === "rainy" &&
      destination.is_indoor
    ) {
      score += 15;
    }

    return score;
  }

  /**
   * Get association score based on destination relationships
   */
  private async getAssociationScore(
    destinationId: number,
    userId: number
  ): Promise<number> {
    try {
      // Get user's visited destinations
      const userHistory = await query(
        `SELECT DISTINCT oi.destination_id 
         FROM dest.bookings b
         JOIN dest.offers o ON b.offer_id = o.offer_id
         JOIN dest.offer_items oi ON o.offer_id = oi.offer_id
         WHERE b.user_id = $1 AND b.status = 'confirmed'
         LIMIT 10`,
        [userId]
      );

      if (userHistory.length === 0) return 0;

      const visitedIds = userHistory.map((r: any) => r.destination_id);

      // Check if current destination is associated with visited ones
      const associations = await query(
        `SELECT association_strength 
         FROM dest.destination_associations 
         WHERE destination_id = $1 
         AND associated_destination_id = ANY($2)`,
        [destinationId, visitedIds]
      );

      if (associations.length > 0) {
        const avgStrength =
          associations.reduce(
            (sum: number, a: any) => sum + a.association_strength,
            0
          ) / associations.length;
        return avgStrength * 40; // Scale to 0-40 points
      }

      return 0;
    } catch (error) {
      console.error("Association score error:", error);
      return 0;
    }
  }

  /**
   * Generate human-readable recommendation reasons
   */
  private getRecommendationReasons(
    destination: any,
    request: RecommendationRequest,
    score: number
  ): string[] {
    const reasons: string[] = [];

    // Rating-based reasons
    if (destination.rating >= 4.5) {
      reasons.push("Highly rated by visitors");
    } else if (destination.rating >= 4.0) {
      reasons.push("Well-rated destination");
    } else if (destination.rating >= 3.5) {
      reasons.push("Popular among tourists");
    }

    // Category match
    if (request.preferences?.categories?.includes(destination.category)) {
      reasons.push(`Matches your interest in ${destination.category}`);
    } else if (destination.category) {
      reasons.push(`Great ${destination.category} experience`);
    }

    // Region match
    const destRegion =
      destination.region || extractRegion(destination.location_name || "");
    if (request.preferences?.regions?.includes(destRegion)) {
      reasons.push(`In your preferred region: ${destRegion}`);
    }

    // Trending
    if (destination.trending_score > 50) {
      reasons.push("Trending destination");
    }

    // Weather context
    if (
      request.context?.weatherCondition === "rainy" &&
      destination.is_indoor
    ) {
      reasons.push("Perfect for rainy weather");
    }

    // Price-related reasons
    if (
      destination.price_range === "free" ||
      destination.estimated_cost === 0
    ) {
      reasons.push("Free admission");
    } else if (destination.price_range === "budget") {
      reasons.push("Budget-friendly option");
    }

    // Review count
    if (destination.review_count > 100) {
      reasons.push("Extensively reviewed by visitors");
    }

    // Family/accessibility features
    if (destination.family_friendly) {
      reasons.push("Family-friendly");
    }
    if (destination.accessibility_features) {
      reasons.push("Accessible facilities");
    }

    // Ensure at least one reason
    if (reasons.length === 0) {
      reasons.push("Recommended based on your preferences");
      if (destination.description) {
        reasons.push("Unique experience worth exploring");
      }
    }

    // Return top 3-4 reasons
    return reasons.slice(0, 4);
  }

  /**
   * Get similar destinations (content-based)
   */
  async getSimilarDestinations(
    destinationId: number,
    limit: number = 5
  ): Promise<any[]> {
    const sql = `
      SELECT d2.*, 
             da.association_strength,
             da.association_type
      FROM dest.destination_associations da
      JOIN dest.destinations d2 ON da.associated_destination_id = d2.destination_id
      WHERE da.destination_id = $1 
        AND d2.status IN ('active', 'Open')
      ORDER BY da.association_strength DESC
      LIMIT $2
    `;

    const destinations = await query(sql, [destinationId, limit]);

    // Parse JSON fields
    return destinations.map((dest: any) => ({
      ...dest,
      photos:
        typeof dest.photos === "string"
          ? JSON.parse(dest.photos)
          : Array.isArray(dest.photos)
          ? dest.photos
          : [],
      tags:
        typeof dest.tags === "string"
          ? JSON.parse(dest.tags)
          : Array.isArray(dest.tags)
          ? dest.tags
          : [],
    }));
  }

  /**
   * Get trending destinations
   */
  async getTrendingDestinations(
    region?: string,
    limit: number = 10
  ): Promise<any[]> {
    let sql = `
      SELECT d.*
      FROM dest.destinations d
      WHERE d.status IN ('active', 'Open')
        AND d.trending_score > 0
    `;

    const params: any[] = [];

    if (region) {
      params.push(region);
      sql += ` AND d.region = $1`;
    }

    params.push(limit);
    sql += ` ORDER BY d.trending_score DESC, d.rating DESC LIMIT $${params.length}`;

    const destinations = await query(sql, params);

    // Parse JSON fields
    return destinations.map((dest: any) => ({
      ...dest,
      photos:
        typeof dest.photos === "string"
          ? JSON.parse(dest.photos)
          : Array.isArray(dest.photos)
          ? dest.photos
          : [],
      tags:
        typeof dest.tags === "string"
          ? JSON.parse(dest.tags)
          : Array.isArray(dest.tags)
          ? dest.tags
          : [],
    }));
  }
}
