import axios from "axios";

const DEST_API_BASE_URL =
  process.env.REACT_APP_DEST_API_URL ||
  "http://localhost:3002/dest-service/api";

/**
 * Service for destination recommendations and filtering.
 * Provides personalized suggestions and similarity matching.
 */
class RecommendationService {
  constructor() {
    this.api = axios.create({
      baseURL: DEST_API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  /**
   * Get personalized destination recommendations based on preferences.
   * Supports filtering by categories, tags, ratings, price, and weather.
   */
  async getRecommendations(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.topN) queryParams.append("topN", params.topN);
      if (params.categories) {
        params.categories.forEach((cat) =>
          queryParams.append("categories", cat)
        );
      }
      if (params.tags) {
        params.tags.forEach((tag) => queryParams.append("tags", tag));
      }
      if (params.minRating) queryParams.append("minRating", params.minRating);
      if (params.maxPrice) queryParams.append("maxPrice", params.maxPrice);
      if (params.weatherCondition)
        queryParams.append("weatherCondition", params.weatherCondition);
      if (params.season) queryParams.append("season", params.season);
      if (params.preferredRegions) {
        params.preferredRegions.forEach((region) =>
          queryParams.append("preferredRegions", region)
        );
      }

      const response = await this.api.get(
        `/recommendations?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      throw error;
    }
  }

  /**
   * Get similar destinations
   */
  async getSimilarDestinations(destinationId, limit = 5) {
    try {
      const response = await this.api.get(
        `/recommendations/similar/${destinationId}?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching similar destinations:", error);
      throw error;
    }
  }

  /**
   * Get trending destinations
   */
  async getTrendingDestinations(region = null, limit = 10) {
    try {
      const params = new URLSearchParams();
      if (region) params.append("region", region);
      params.append("limit", limit);

      const response = await this.api.get(
        `/recommendations/trending?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching trending destinations:", error);
      throw error;
    }
  }

  /**
   * Apply advanced filters to destination search
   */
  async filterDestinations(filters) {
    try {
      const params = new URLSearchParams();

      // Text search
      if (filters.searchQuery)
        params.append("searchQuery", filters.searchQuery);

      // Categories and tags
      if (filters.categories) {
        filters.categories.forEach((cat) => params.append("categories", cat));
      }
      if (filters.tags) {
        filters.tags.forEach((tag) => params.append("tags", tag));
      }

      // Regions
      if (filters.regions) {
        filters.regions.forEach((region) => params.append("regions", region));
      }

      // Price filters
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.priceRange) params.append("priceRange", filters.priceRange);

      // Rating filters
      if (filters.minRating) params.append("minRating", filters.minRating);
      if (filters.minReviews) params.append("minReviews", filters.minReviews);

      // Availability
      if (filters.availableFrom)
        params.append("availableFrom", filters.availableFrom);
      if (filters.availableTo)
        params.append("availableTo", filters.availableTo);

      // Environment
      if (filters.isIndoor !== undefined)
        params.append("isIndoor", filters.isIndoor);
      if (filters.isOutdoor !== undefined)
        params.append("isOutdoor", filters.isOutdoor);

      // Accessibility
      if (filters.wheelchairAccessible)
        params.append("wheelchairAccessible", "true");
      if (filters.familyFriendly) params.append("familyFriendly", "true");
      if (filters.petFriendly) params.append("petFriendly", "true");
      if (filters.parkingAvailable) params.append("parkingAvailable", "true");
      if (filters.publicTransportNearby)
        params.append("publicTransportNearby", "true");

      // Capacity
      if (filters.minCapacity)
        params.append("minCapacity", filters.minCapacity);

      // Trending
      if (filters.trendingOnly) params.append("trendingOnly", "true");

      // Sorting
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      // Pagination
      params.append("page", filters.page || 1);
      params.append("limit", filters.limit || 20);

      const response = await this.api.get(
        `/destinations/filter?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error filtering destinations:", error);
      throw error;
    }
  }

  /**
   * Get available filter options (for UI dropdowns)
   */
  async getFilterOptions() {
    try {
      const response = await this.api.get("/destinations/filter-options");
      return response.data;
    } catch (error) {
      console.error("Error fetching filter options:", error);
      throw error;
    }
  }
}

export default new RecommendationService();
