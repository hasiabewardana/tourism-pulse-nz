import { Router } from "express";
import {
  getEnrichedForecast,
  getRegionalComparison,
  getTourismTrends,
} from "../controllers/statsnzController";

const router = Router();

// Public Stats NZ tourism data routes (no authentication required for public data)
// Get enriched forecast with Stats NZ data
router.get("/enriched-forecast/:region", getEnrichedForecast);

// Get regional comparison with national benchmarks
router.get("/regional-comparison/:region", getRegionalComparison);

// Get tourism trends from Stats NZ
router.get("/tourism-trends/:region", getTourismTrends);

export default router;
