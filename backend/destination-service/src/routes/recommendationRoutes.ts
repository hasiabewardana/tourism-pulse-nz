import { Router } from "express";
import {
  getRecommendations,
  getSimilarDestinations,
  getTrendingDestinations,
} from "../controllers/recommendationController";

const router = Router();

/**
 * @route GET /api/recommendations
 * @desc Get personalized recommendations
 * @access Public (better with auth for personalization)
 */
router.get("/", getRecommendations);

/**
 * @route GET /api/recommendations/similar/:destinationId
 * @desc Get similar destinations
 * @access Public
 */
router.get("/similar/:destinationId", getSimilarDestinations);

/**
 * @route GET /api/recommendations/trending
 * @desc Get trending destinations
 * @access Public
 */
router.get("/trending", getTrendingDestinations);

export default router;
