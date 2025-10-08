import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_ANALYTICS_API_URL ||
  "http://localhost:3003/analytics-service/api";

class AnalyticsService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Demand Forecasting APIs
  async generateDemandForecast(data) {
    try {
      const response = await this.api.post("/v1/forecast/demand", data);
      return response.data;
    } catch (error) {
      console.error("Error generating demand forecast:", error);
      throw this.handleError(error);
    }
  }

  async getPeakSeasonForecast(region, year) {
    try {
      const response = await this.api.get(
        `/v1/forecast/peaks/${region}/${year}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting peak season forecast:", error);
      throw this.handleError(error);
    }
  }

  async getDemandTrends(params = {}) {
    try {
      const response = await this.api.get("/v1/forecast/trends", { params });
      return response.data;
    } catch (error) {
      console.error("Error getting demand trends:", error);
      throw this.handleError(error);
    }
  }

  async getForecastAccuracy(params = {}) {
    try {
      const response = await this.api.get("/v1/forecast/accuracy", { params });
      return response.data;
    } catch (error) {
      console.error("Error getting forecast accuracy:", error);
      throw this.handleError(error);
    }
  }

  // Staffing Analytics APIs
  async generateStaffingRecommendations(data) {
    try {
      const response = await this.api.post(
        "/v1/staffing/recommendations",
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error generating staffing recommendations:", error);
      throw this.handleError(error);
    }
  }

  async getStaffingOptimization(businessId, timeframe = "monthly") {
    try {
      const response = await this.api.get(
        `/v1/staffing/optimization/${businessId}`,
        {
          params: { timeframe },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting staffing optimization:", error);
      throw this.handleError(error);
    }
  }

  async getStaffingHistory(businessId, params = {}) {
    try {
      const response = await this.api.get(
        `/v1/staffing/history/${businessId}`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting staffing history:", error);
      throw this.handleError(error);
    }
  }

  async compareStaffingScenarios(data) {
    try {
      const response = await this.api.post("/v1/staffing/compare", data);
      return response.data;
    } catch (error) {
      console.error("Error comparing staffing scenarios:", error);
      throw this.handleError(error);
    }
  }

  // Resource Planning APIs
  async getResourceUtilization(businessId, period = "monthly") {
    try {
      const response = await this.api.get(
        `/v1/resources/utilization/${businessId}`,
        {
          params: { period },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting resource utilization:", error);
      throw this.handleError(error);
    }
  }

  // Helper method to handle errors consistently
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.error || "Server error occurred",
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: "No response from server. Please check your connection.",
        status: 0,
      };
    } else {
      // Something else happened
      return {
        message: error.message || "An unexpected error occurred",
        status: -1,
      };
    }
  }

  // Utility methods
  formatDateForAPI(date) {
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    }
    return date;
  }

  // Sample data generators for development/testing
  async getSampleDemandForecast() {
    return {
      success: true,
      forecast: {
        region: "Auckland",
        predictedDemand: {
          accommodation: 750,
          activities: 600,
          transportation: 450,
          restaurants: 900,
        },
        confidenceInterval: {
          lower: 75,
          upper: 95,
          accuracy: 87,
        },
      },
      predictions: this.generateSamplePredictions(),
      seasonalPatterns: this.generateSampleSeasonalPatterns(),
    };
  }

  async getSampleStaffingRecommendations() {
    return {
      success: true,
      recommendations: {
        staffingRecommendations: {
          frontDesk: {
            currentStaff: 5,
            recommendedStaff: 6,
            peakHours: ["08:00-10:00", "17:00-19:00"],
          },
          housekeeping: {
            currentStaff: 10,
            recommendedStaff: 12,
            roomsPerHour: 2.5,
          },
          foodService: {
            currentStaff: 6,
            recommendedStaff: 7,
            expectedCovers: 90,
          },
          maintenance: {
            currentStaff: 4,
            recommendedStaff: 4,
          },
        },
        costAnalysis: {
          currentLaborCosts: 1250000,
          recommendedLaborCosts: 1375000,
          potentialSavings: 0,
          roi: 15.5,
        },
        efficiencyMetrics: {
          staffUtilization: 75,
          customerSatisfaction: 82,
          operationalEfficiency: 78,
          costPerGuest: 95,
        },
      },
      insights: [
        {
          type: "staffing_increase",
          severity: "medium",
          message: "Recommended to increase total staff by 3 positions",
          impact: "Improved service quality and customer satisfaction",
        },
      ],
    };
  }

  generateSamplePredictions() {
    const predictions = [];
    const startDate = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      predictions.push({
        date: date.toISOString().split("T")[0],
        accommodation: Math.floor(500 + Math.random() * 200),
        activities: Math.floor(400 + Math.random() * 150),
        transportation: Math.floor(300 + Math.random() * 100),
        restaurants: Math.floor(600 + Math.random() * 250),
      });
    }
    return predictions;
  }

  generateSampleSeasonalPatterns() {
    return {
      summer: { months: [11, 0, 1], intensity: 85 },
      autumn: { months: [2, 3, 4], intensity: 65 },
      winter: { months: [5, 6, 7], intensity: 45 },
      spring: { months: [8, 9, 10], intensity: 75 },
    };
  }

  // User Interaction Tracking
  async trackInteraction(data) {
    try {
      const response = await this.api.post("/analytics/interaction", {
        destinationId: data.destinationId,
        interactionType: data.interactionType, // 'view', 'click', 'bookmark', 'share'
        durationSeconds: data.durationSeconds || 0,
        rating: data.rating,
        metadata: data.metadata || {},
      });
      return response.data;
    } catch (error) {
      console.error("Error tracking interaction:", error);
      return null;
    }
  }

  // Track search query
  async trackSearch(searchQuery, filters, resultsCount) {
    try {
      const response = await this.api.post("/analytics/search", {
        searchQuery,
        filters,
        resultsCount,
        noResultsFound: resultsCount === 0,
      });
      return response.data;
    } catch (error) {
      console.error("Error tracking search:", error);
      return null;
    }
  }

  // Get destination insights (for admin/manager dashboard)
  async getDestinationInsights(destinationId, days = 7) {
    try {
      const response = await this.api.get(
        `/analytics/destinations/${destinationId}/insights?days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching destination insights:", error);
      throw error;
    }
  }

  // Get popular destinations
  async getPopularDestinations(region = null, limit = 10) {
    try {
      const params = new URLSearchParams();
      if (region) params.append("region", region);
      params.append("limit", limit);

      const response = await this.api.get(
        `/analytics/popular?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching popular destinations:", error);
      throw error;
    }
  }

  // Get trending searches
  async getTrendingSearches(limit = 10) {
    try {
      const response = await this.api.get(
        `/analytics/trending-searches?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching trending searches:", error);
      throw error;
    }
  }

  // Get user behavior summary
  async getUserBehavior(days = 30) {
    try {
      const response = await this.api.get(
        `/analytics/user/behavior?days=${days}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user behavior:", error);
      throw error;
    }
  }
}

export default new AnalyticsService();
