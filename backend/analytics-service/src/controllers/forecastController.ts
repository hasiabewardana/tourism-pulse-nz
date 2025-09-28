import { Request, Response } from "express";
import { DemandForecast } from "../models/demandForecastModel";
import { PeakSeasonPrediction } from "../models/peakSeasonPredictionModel";
import forecastingService from "../services/forecastingService";

export class ForecastController {
  // Generate demand forecast
  async generateDemandForecast(req: Request, res: Response): Promise<void> {
    try {
      const { region, startDate, endDate, forecastType } = req.body;

      // Validate input
      if (!region || !startDate || !endDate || !forecastType) {
        res.status(400).json({
          success: false,
          error:
            "Missing required fields: region, startDate, endDate, forecastType",
        });
        return;
      }

      console.log(
        `Generating demand forecast for ${region} from ${startDate} to ${endDate}`
      );

      // Generate forecast using ML model
      const forecastData = await forecastingService.predictDemand({
        region,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        forecastType,
      });

      // Save forecast to database
      const forecast = new DemandForecast({
        region,
        dateRange: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        forecastType,
        predictedDemand: {
          accommodation:
            forecastData.predictions.reduce(
              (sum: number, p: any) => sum + p.accommodation,
              0
            ) / forecastData.predictions.length,
          activities:
            forecastData.predictions.reduce(
              (sum: number, p: any) => sum + p.activities,
              0
            ) / forecastData.predictions.length,
          transportation:
            forecastData.predictions.reduce(
              (sum: number, p: any) => sum + p.transportation,
              0
            ) / forecastData.predictions.length,
          restaurants:
            forecastData.predictions.reduce(
              (sum: number, p: any) => sum + p.restaurants,
              0
            ) / forecastData.predictions.length,
        },
        confidenceInterval: forecastData.confidence,
        historicalData: [],
        trends: forecastData.trends,
      });

      await forecast.save();

      res.json({
        success: true,
        forecast: {
          id: forecast._id,
          region: forecast.region,
          dateRange: forecast.dateRange,
          forecastType: forecast.forecastType,
          predictedDemand: forecast.predictedDemand,
          confidenceInterval: forecast.confidenceInterval,
          trends: forecast.trends,
        },
        predictions: forecastData.predictions,
        seasonalPatterns: forecastData.seasonalPatterns,
      });
    } catch (error) {
      console.error("Error generating demand forecast:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // Get peak season predictions
  async getPeakSeasonForecast(req: Request, res: Response): Promise<void> {
    try {
      const { region, year } = req.params;

      if (!region || !year) {
        res.status(400).json({
          success: false,
          error: "Missing required parameters: region, year",
        });
        return;
      }

      console.log(`Getting peak season forecast for ${region} in ${year}`);

      // Check if we already have a prediction for this region and year
      let existingPrediction = await PeakSeasonPrediction.findOne({
        region,
        year: parseInt(year),
      });

      let peakSeasonData: any = null;

      if (!existingPrediction) {
        // Generate new peak season prediction
        peakSeasonData = await forecastingService.predictPeakSeasons(
          region,
          parseInt(year)
        );

        // Save to database
        existingPrediction = new PeakSeasonPrediction({
          region,
          year: parseInt(year),
          peakSeasons: peakSeasonData.peakSeasons,
          seasonalPatterns: {
            summer: { months: [11, 0, 1], intensity: 85 },
            autumn: { months: [2, 3, 4], intensity: 65 },
            winter: { months: [5, 6, 7], intensity: 45 },
            spring: { months: [8, 9, 10], intensity: 75 },
          },
          specialEvents: [
            {
              name: "Christmas/New Year",
              date: new Date(parseInt(year), 11, 25),
              impact: 90,
              category: "Holiday",
            },
            {
              name: "Easter",
              date: new Date(parseInt(year), 3, 15), // Approximate
              impact: 70,
              category: "Holiday",
            },
          ],
          weatherFactors: {
            averageTemperature: 15,
            rainfallPrediction: 1200,
            weatherQuality: 75,
          },
          economicFactors: {
            exchangeRate: 0.65,
            economicClimate: "good",
            travelCostIndex: 105,
          },
        });

        await existingPrediction.save();
      }

      // Generate recommendations based on peak seasons
      const recommendations = this.generateSeasonalRecommendations(
        existingPrediction.peakSeasons
      );

      res.json({
        success: true,
        peakSeasons: existingPrediction.peakSeasons,
        seasonalPatterns: existingPrediction.seasonalPatterns,
        specialEvents: existingPrediction.specialEvents,
        weatherFactors: existingPrediction.weatherFactors,
        economicFactors: existingPrediction.economicFactors,
        recommendations,
        confidence: peakSeasonData?.confidence || 85,
      });
    } catch (error) {
      console.error("Error getting peak season forecast:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // Get demand trends
  async getDemandTrends(req: Request, res: Response): Promise<void> {
    try {
      const { region, period, startDate, endDate } = req.query;

      if (!region) {
        res.status(400).json({
          success: false,
          error: "Missing required parameter: region",
        });
        return;
      }

      console.log(`Getting demand trends for ${region}`);

      // Build query
      const query: any = { region: region as string };

      if (startDate && endDate) {
        query["dateRange.startDate"] = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        };
      }

      // Get historical forecasts and calculate trends
      const trends = await DemandForecast.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: "$dateRange.startDate" },
              month: { $month: "$dateRange.startDate" },
            },
            avgAccommodation: { $avg: "$predictedDemand.accommodation" },
            avgActivities: { $avg: "$predictedDemand.activities" },
            avgTransportation: { $avg: "$predictedDemand.transportation" },
            avgRestaurants: { $avg: "$predictedDemand.restaurants" },
            totalForecasts: { $sum: 1 },
            avgConfidence: { $avg: "$confidenceInterval.accuracy" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 24 }, // Last 24 months
      ]);

      // Calculate trend direction and growth rate
      const trendAnalysis = this.analyzeTrendDirection(trends);

      res.json({
        success: true,
        trends,
        analysis: trendAnalysis,
        period: period || "monthly",
        region: region as string,
      });
    } catch (error) {
      console.error("Error getting demand trends:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // Get forecast accuracy metrics
  async getForecastAccuracy(req: Request, res: Response): Promise<void> {
    try {
      const { region, forecastType } = req.query;

      const query: any = {};
      if (region) query.region = region;
      if (forecastType) query.forecastType = forecastType;

      const accuracyData = await DemandForecast.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$forecastType",
            avgAccuracy: { $avg: "$confidenceInterval.accuracy" },
            minAccuracy: { $min: "$confidenceInterval.accuracy" },
            maxAccuracy: { $max: "$confidenceInterval.accuracy" },
            count: { $sum: 1 },
          },
        },
        { $sort: { avgAccuracy: -1 } },
      ]);

      res.json({
        success: true,
        accuracyMetrics: accuracyData,
        region: region || "all",
        forecastType: forecastType || "all",
      });
    } catch (error) {
      console.error("Error getting forecast accuracy:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // Generate seasonal recommendations
  private generateSeasonalRecommendations(peakSeasons: any[]): any[] {
    const recommendations: any[] = [];

    peakSeasons.forEach((season) => {
      switch (season.intensity) {
        case "extreme":
          recommendations.push({
            season: season.name,
            priority: "critical",
            actions: [
              "Increase staff by 50-70%",
              "Implement surge pricing",
              "Extend operating hours",
              "Activate emergency capacity plans",
            ],
            timeline: "2-3 months before peak",
            expectedROI: "25-40%",
          });
          break;
        case "high":
          recommendations.push({
            season: season.name,
            priority: "high",
            actions: [
              "Increase staff by 30-50%",
              "Optimize resource allocation",
              "Launch marketing campaigns",
              "Prepare additional inventory",
            ],
            timeline: "1-2 months before peak",
            expectedROI: "15-25%",
          });
          break;
        case "medium":
          recommendations.push({
            season: season.name,
            priority: "medium",
            actions: [
              "Increase staff by 15-30%",
              "Monitor demand closely",
              "Adjust pricing strategy",
              "Prepare contingency plans",
            ],
            timeline: "3-4 weeks before peak",
            expectedROI: "10-15%",
          });
          break;
        default:
          recommendations.push({
            season: season.name,
            priority: "low",
            actions: [
              "Maintain current staffing",
              "Focus on operational efficiency",
              "Consider maintenance activities",
            ],
            timeline: "Ongoing",
            expectedROI: "5-10%",
          });
      }
    });

    return recommendations;
  }

  // Analyze trend direction from aggregated data
  private analyzeTrendDirection(trends: any[]): any {
    if (trends.length < 2) {
      return {
        direction: "insufficient_data",
        growthRate: 0,
        confidence: "low",
      };
    }

    // Calculate average growth rate across all categories
    const firstPeriod = trends[0];
    const lastPeriod = trends[trends.length - 1];

    const accommodationGrowth =
      ((lastPeriod.avgAccommodation - firstPeriod.avgAccommodation) /
        firstPeriod.avgAccommodation) *
      100;
    const activitiesGrowth =
      ((lastPeriod.avgActivities - firstPeriod.avgActivities) /
        firstPeriod.avgActivities) *
      100;
    const transportationGrowth =
      ((lastPeriod.avgTransportation - firstPeriod.avgTransportation) /
        firstPeriod.avgTransportation) *
      100;
    const restaurantsGrowth =
      ((lastPeriod.avgRestaurants - firstPeriod.avgRestaurants) /
        firstPeriod.avgRestaurants) *
      100;

    const avgGrowthRate =
      (accommodationGrowth +
        activitiesGrowth +
        transportationGrowth +
        restaurantsGrowth) /
      4;

    let direction = "stable";
    if (avgGrowthRate > 5) direction = "increasing";
    else if (avgGrowthRate < -5) direction = "decreasing";

    let confidence = "medium";
    if (trends.length >= 12) confidence = "high";
    else if (trends.length < 6) confidence = "low";

    return {
      direction,
      growthRate: Math.round(avgGrowthRate * 100) / 100,
      confidence,
      categoryBreakdown: {
        accommodation: Math.round(accommodationGrowth * 100) / 100,
        activities: Math.round(activitiesGrowth * 100) / 100,
        transportation: Math.round(transportationGrowth * 100) / 100,
        restaurants: Math.round(restaurantsGrowth * 100) / 100,
      },
    };
  }
}

export default new ForecastController();
