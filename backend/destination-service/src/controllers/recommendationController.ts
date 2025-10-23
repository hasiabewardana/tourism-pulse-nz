import { Request, Response } from "express";
import { RecommendationService } from "../services/recommendationService";

const recommendationService = new RecommendationService();

/**
 * Generate personalized destination recommendations.
 * Takes into account user preferences, constraints (rating, price),
 * and contextual factors (weather, season).
 */
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
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

    const request: any = {
      topN: parseInt(topN as string),
      userId: userId ? parseInt(userId) : undefined,
      preferences: {},
      constraints: {},
      context: {},
    };

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

    if (minRating) {
      request.constraints.minRating = parseFloat(minRating as string);
    }
    if (maxPrice) {
      request.constraints.maxPrice = parseFloat(maxPrice as string);
    }

    if (weatherCondition) {
      request.context.weatherCondition = weatherCondition as string;
    }
    if (season) {
      request.context.season = season as string;
    }

    request.context.currentTime = new Date();

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
 * Find destinations similar to a given destination.
 * Uses content-based filtering to match destination attributes.
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
