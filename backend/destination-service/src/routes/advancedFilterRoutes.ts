import { Router } from "express";
import {
  filterDestinations,
  getFilterOptions,
} from "../controllers/advancedFilterController";

const router = Router();

/**
 * @route POST /api/destinations/filter
 * @desc Apply advanced filters to search destinations
 * @access Public
 */
router.get("/filter", filterDestinations);

/**
 * @route GET /api/destinations/filter-options
 * @desc Get available filter options for UI dropdowns
 * @access Public
 */
router.get("/filter-options", getFilterOptions);

export default router;
