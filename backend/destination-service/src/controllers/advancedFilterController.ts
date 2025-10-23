import { Request, Response } from "express";
import {
  AdvancedFilterService,
  FilterCriteria,
} from "../services/advancedFilterService";

const filterService = new AdvancedFilterService();

/**
 * Apply advanced filters to destination search
 */
export const filterDestinations = async (req: Request, res: Response) => {
  try {
    const criteria: FilterCriteria = {
      // Text search
      searchQuery: req.query.searchQuery as string,

      // Category filters
      categories: req.query.categories
        ? Array.isArray(req.query.categories)
          ? (req.query.categories as string[])
          : [req.query.categories as string]
        : undefined,
      subcategory: req.query.subcategory as string,

      // Tag filters
      tags: req.query.tags
        ? Array.isArray(req.query.tags)
          ? (req.query.tags as string[])
          : [req.query.tags as string]
        : undefined,

      // Location filters
      regions: req.query.regions
        ? Array.isArray(req.query.regions)
          ? (req.query.regions as string[])
          : [req.query.regions as string]
        : undefined,

      // Price filters
      minPrice: req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined,
      maxPrice: req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined,
      priceRange: req.query.priceRange as
        | "free"
        | "budget"
        | "moderate"
        | "premium"
        | undefined,

      // Rating filters
      minRating: req.query.minRating
        ? parseFloat(req.query.minRating as string)
        : undefined,
      minReviews: req.query.minReviews
        ? parseInt(req.query.minReviews as string)
        : undefined,

      // Availability filters
      availableFrom: req.query.availableFrom
        ? new Date(req.query.availableFrom as string)
        : undefined,
      availableTo: req.query.availableTo
        ? new Date(req.query.availableTo as string)
        : undefined,

      // Environment filters
      isIndoor:
        req.query.isIndoor === "true"
          ? true
          : req.query.isIndoor === "false"
          ? false
          : undefined,
      isOutdoor:
        req.query.isOutdoor === "true"
          ? true
          : req.query.isOutdoor === "false"
          ? false
          : undefined,

      // Accessibility filters
      wheelchairAccessible: req.query.wheelchairAccessible === "true",
      parkingAvailable: req.query.parkingAvailable === "true",
      publicTransportNearby: req.query.publicTransportNearby === "true",
      familyFriendly: req.query.familyFriendly === "true",
      petFriendly: req.query.petFriendly === "true",

      // Capacity filter
      minCapacity: req.query.minCapacity
        ? parseInt(req.query.minCapacity as string)
        : undefined,

      // Trending filter
      trendingOnly: req.query.trendingOnly === "true",

      // Sorting
      sortBy: req.query.sortBy as
        | "rating"
        | "price"
        | "popularity"
        | "name"
        | undefined,
      sortOrder:
        (req.query.sortOrder as string)?.toUpperCase() === "DESC"
          ? "desc"
          : "asc",

      // Pagination
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const results = await filterService.filterDestinations(criteria);

    res.json({
      success: true,
      page: criteria.page,
      limit: criteria.limit,
      total: results.pagination.total,
      totalPages: results.pagination.totalPages,
      destinations: results.destinations,
    });
  } catch (error) {
    console.error("Filter destinations error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to filter destinations",
    });
  }
};

/**
 * Get available filter options for UI
 */
export const getFilterOptions = async (req: Request, res: Response) => {
  try {
    const options = await filterService.getFilterOptions();

    res.json({
      success: true,
      options: options,
    });
  } catch (error) {
    console.error("Get filter options error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get filter options",
    });
  }
};
