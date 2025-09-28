import { createContext, useContext, useState, useEffect } from "react";
import analyticsService from "../../util/analyticsService";

const AnalyticsContext = createContext();

export function AnalyticsProvider({ children }) {
  // State for different analytics data
  const [demandForecast, setDemandForecast] = useState(null);
  const [staffingRecommendations, setStaffingRecommendations] = useState(null);
  const [peakSeasons, setPeakSeasons] = useState(null);
  const [resourceUtilization, setResourceUtilization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Business data
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("Auckland");

  // Fetch demand forecast
  const fetchDemandForecast = async (
    region,
    startDate,
    endDate,
    forecastType
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.generateDemandForecast({
        region,
        startDate,
        endDate,
        forecastType,
      });
      setDemandForecast(data);
      return data;
    } catch (err) {
      setError(err);
      // Return sample data if API fails (for development)
      const sampleData = await analyticsService.getSampleDemandForecast();
      setDemandForecast(sampleData);
      return sampleData;
    } finally {
      setLoading(false);
    }
  };

  // Fetch staffing recommendations
  const fetchStaffingRecommendations = async (businessData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.generateStaffingRecommendations(
        businessData
      );
      setStaffingRecommendations(data);
      return data;
    } catch (err) {
      setError(err);
      // Return sample data if API fails (for development)
      const sampleData =
        await analyticsService.getSampleStaffingRecommendations();
      setStaffingRecommendations(sampleData);
      return sampleData;
    } finally {
      setLoading(false);
    }
  };

  // Fetch peak seasons
  const fetchPeakSeasons = async (region, year) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getPeakSeasonForecast(region, year);
      setPeakSeasons(data);
      return data;
    } catch (err) {
      setError(err);
      // Return sample data if API fails
      const sampleData = {
        success: true,
        peakSeasons: [
          {
            name: "Summer Peak",
            startDate: "2024-12-01",
            endDate: "2025-02-28",
            intensity: "high",
            predictedVisitors: 1100,
            confidenceLevel: 85,
            factors: ["School holidays", "Good weather", "Christmas/New Year"],
          },
          {
            name: "Easter/Autumn",
            startDate: "2024-04-01",
            endDate: "2024-05-31",
            intensity: "medium",
            predictedVisitors: 700,
            confidenceLevel: 78,
            factors: ["Easter holidays", "Mild weather", "Lower costs"],
          },
        ],
      };
      setPeakSeasons(sampleData);
      return sampleData;
    } finally {
      setLoading(false);
    }
  };

  // Fetch resource utilization
  const fetchResourceUtilization = async (businessId, period) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getResourceUtilization(
        businessId,
        period
      );
      setResourceUtilization(data);
      return data;
    } catch (err) {
      setError(err);
      // Return sample data if API fails
      const sampleData = {
        success: true,
        resourceUtilization: {
          staffUtilization: {
            current: 75,
            target: 85,
            status: "underutilized",
          },
          equipmentUtilization: {
            vehicles: 80,
            cleaningEquipment: 90,
            kitchenEquipment: 85,
          },
          facilityUtilization: {
            rooms: 75,
            meetingSpaces: 60,
            recreationalAreas: 45,
          },
        },
      };
      setResourceUtilization(sampleData);
      return sampleData;
    } finally {
      setLoading(false);
    }
  };

  // Clear all data
  const clearAnalyticsData = () => {
    setDemandForecast(null);
    setStaffingRecommendations(null);
    setPeakSeasons(null);
    setResourceUtilization(null);
    setError(null);
  };

  // Business management functions
  const updateCurrentBusiness = (businessData) => {
    setCurrentBusiness(businessData);
  };

  const updateSelectedRegion = (region) => {
    setSelectedRegion(region);
  };

  const value = {
    // State
    demandForecast,
    staffingRecommendations,
    peakSeasons,
    resourceUtilization,
    loading,
    error,
    currentBusiness,
    selectedRegion,

    // Actions
    fetchDemandForecast,
    fetchStaffingRecommendations,
    fetchPeakSeasons,
    fetchResourceUtilization,
    clearAnalyticsData,
    updateCurrentBusiness,
    updateSelectedRegion,

    // Utility functions
    setLoading,
    setError,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// Custom hook to use the AnalyticsContext
export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
}

export { AnalyticsContext };
export default AnalyticsContext;
