import { Request, Response } from "express";
import { RecommendationService } from "../services/recommendationService";

const recommendationService = new RecommendationService();

/**
 * Get personalized recommendations based on user preferences and context
 */
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id; // From auth middleware
    const {
      topN = 10,
      categories,
      tags,
      minRating,
      maxPrice,
      weatherCondition,
      season,
      excludeVisited = true,
      preferredRegions,
    } = req.query;

    // Build recommendation request
    const request: any = {
      topN: parseInt(topN as string),
      userId: userId ? parseInt(userId) : undefined,
      preferences: {},
      constraints: {},
      context: {},
    };

    // Add preferences if provided
    if (categories) {
      request.preferences.categories = Array.isArray(categories)
        ? categories
        : [categories];
    }
    if (tags) {
      request.preferences.tags = Array.isArray(tags) ? tags : [tags];
    }
    if (preferredRegions) {
      request.preferences.regions = Array.isArray(preferredRegions)
        ? preferredRegions
        : [preferredRegions];
    }

    // Add constraints if provided
    if (minRating) {
      request.constraints.minRating = parseFloat(minRating as string);
    }
    if (maxPrice) {
      request.constraints.maxPrice = parseFloat(maxPrice as string);
    }

    // Add context
    if (weatherCondition) {
      request.context.weatherCondition = weatherCondition as string;
    }
    if (season) {
      request.context.season = season as string;
    }

    request.context.currentTime = new Date();

    // Get recommendations
    const recommendations = await recommendationService.recommend(request);

    res.json({
      success: true,
      count: recommendations.length,
      recommendations: recommendations,
    });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
    });
  }
};

/**
 * Get similar destinations to a specific destination
 */
export const getSimilarDestinations = async (req: Request, res: Response) => {
  try {
    const { destinationId } = req.params;
    const { limit = 5 } = req.query;

    const similar = await recommendationService.getSimilarDestinations(
      parseInt(destinationId),
      parseInt(limit as string)
    );

    res.json({
      success: true,
      destinationId: parseInt(destinationId),
      count: similar.length,
      similar: similar,
    });
  } catch (error) {
    console.error("Get similar destinations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get similar destinations",
    });
  }
};

/**
 * Get trending destinations
 */
export const getTrendingDestinations = async (req: Request, res: Response) => {
  try {
    const { region, limit = 10 } = req.query;

    const trending = await recommendationService.getTrendingDestinations(
      region as string,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      region: region || "all",
      count: trending.length,
      trending: trending,
    });
  } catch (error) {
    console.error("Get trending destinations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trending destinations",
    });
  }
};
