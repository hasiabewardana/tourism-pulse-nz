import { Request, Response } from "express";
import axios from "axios";

const INTEGRATION_SERVICE_URL =
  process.env.INTEGRATION_SERVICE_URL || "http://localhost:3004";

// Get enriched forecast with Stats NZ data
export const getEnrichedForecast = async (req: Request, res: Response) => {
  try {
    const { region } = req.params;

    console.log(`[Stats NZ] Fetching enriched forecast for region: ${region}`);
    console.log(
      `[Stats NZ] Integration service URL: ${INTEGRATION_SERVICE_URL}`
    );

    // Fetch Stats NZ data
    const statsNZResponse = await axios.get(
      `${INTEGRATION_SERVICE_URL}/integration-service/api/statsnz/tourism/arrivals/${region}`
    );

    const statsNZData = statsNZResponse.data as {
      success: boolean;
      data: any;
    };

    if (!statsNZData.success) {
      console.error(`[Stats NZ] Integration service returned success: false`);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch Stats NZ data",
      });
    }

    const statsData = statsNZData.data;

    // Calculate enriched forecast
    const forecast = {
      region: region,
      nationalMonthlyAverage: statsData.monthlyAverageArrivals,
      nationalGrowthRate: statsData.growthRate,
      topOriginMarkets: statsData.topOriginCountries,
      seasonalPeaks: statsData.seasonalPeaks,
      recommendation: generateRecommendation(statsData),
      lastUpdated: statsData.lastUpdated,
    };

    console.log(`✓ Enriched forecast generated for region: ${region}`);
    res.json({ success: true, data: forecast });
  } catch (error: any) {
    console.error(
      `✗ Enriched forecast error for region ${req.params.region}:`,
      error.message
    );
    if (error.code === "ECONNREFUSED") {
      console.error(
        `✗ Cannot connect to integration service at ${INTEGRATION_SERVICE_URL}`
      );
      console.error(`✗ Make sure integration-service is running on port 3004`);
    }
    res.status(500).json({
      success: false,
      error: "Failed to generate enriched forecast",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get regional comparison with Stats NZ benchmarks
export const getRegionalComparison = async (req: Request, res: Response) => {
  try {
    const { region } = req.params;

    // Fetch accommodation stats from Stats NZ
    const accommodationResponse = await axios.get(
      `${INTEGRATION_SERVICE_URL}/integration-service/api/statsnz/tourism/accommodation/${region}`
    );

    const accommodationData = accommodationResponse.data as {
      success: boolean;
      data: any;
    };

    if (!accommodationData.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch accommodation stats",
      });
    }

    const statsData = accommodationData.data;

    const comparison = {
      region: region,
      nationalAverageOccupancy: statsData.averageOccupancyRate,
      nationalAverageStay: statsData.averageStayDuration,
      totalEstablishments: statsData.totalAccommodationEstablishments,
      insights: generateInsights(statsData),
      lastUpdated: statsData.lastUpdated,
    };

    res.json({ success: true, data: comparison });
  } catch (error: any) {
    console.error("Regional comparison error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to generate regional comparison",
    });
  }
};

// Get tourism trends with Stats NZ data
export const getTourismTrends = async (req: Request, res: Response) => {
  try {
    const { region } = req.params;
    const months = parseInt(req.query.months as string) || 12;

    const trendsResponse = await axios.get(
      `${INTEGRATION_SERVICE_URL}/integration-service/api/statsnz/tourism/trends/${region}`,
      { params: { months } }
    );

    const trendsDataResponse = trendsResponse.data as {
      success: boolean;
      data: any;
    };

    if (!trendsDataResponse.success) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch tourism trends",
      });
    }

    const trendsData = trendsDataResponse.data;

    res.json({ success: true, data: trendsData });
  } catch (error: any) {
    console.error("Tourism trends error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tourism trends",
    });
  }
};

// Helper function to generate recommendations
function generateRecommendation(statsData: any): string {
  const growthRate = statsData.growthRate;

  if (growthRate > 10) {
    return "Strong growth expected. Consider increasing capacity and marketing efforts.";
  } else if (growthRate > 5) {
    return "Moderate growth projected. Maintain current operations with minor expansions.";
  } else if (growthRate > 0) {
    return "Stable growth anticipated. Focus on quality improvements and customer retention.";
  } else {
    return "Declining trend observed. Review pricing strategies and marketing campaigns.";
  }
}

// Helper function to generate insights
function generateInsights(statsData: any): string[] {
  const insights = [];
  const occupancy = statsData.averageOccupancyRate;

  if (occupancy > 75) {
    insights.push("High occupancy rates indicate strong demand in the region");
    insights.push("Consider premium pricing strategies");
  } else if (occupancy > 60) {
    insights.push("Occupancy rates are healthy");
    insights.push("Focus on guest experience to maintain competitiveness");
  } else {
    insights.push("Below-average occupancy suggests room for improvement");
    insights.push("Consider promotional offers and marketing campaigns");
  }

  insights.push(
    `Average stay duration of ${statsData.averageStayDuration} days suggests ${
      statsData.averageStayDuration > 3 ? "strong" : "moderate"
    } visitor engagement`
  );

  return insights;
}
