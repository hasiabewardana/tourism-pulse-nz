import mongoose from "mongoose";
import { DemandForecast } from "../src/models/demandForecastModel";
import { StaffingAnalytics } from "../src/models/staffingAnalyticsModel";
import { PeakSeasonPrediction } from "../src/models/peakSeasonPredictionModel";
import { Analytics } from "../src/models/analyticsModel";

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/tourismpulsenz_analytics"
    );

    console.log("Connected to MongoDB");

    // Clear existing data
    await Promise.all([
      DemandForecast.deleteMany({}),
      StaffingAnalytics.deleteMany({}),
      PeakSeasonPrediction.deleteMany({}),
      Analytics.deleteMany({}),
    ]);

    console.log("Cleared existing data");

    // Create sample historical analytics data
    const historicalData: any[] = [];
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const baseVisitors = 500;
      const seasonalFactor =
        1 + 0.3 * Math.sin((date.getMonth() / 12) * 2 * Math.PI);
      const weekendFactor = [0, 6].includes(date.getDay()) ? 1.4 : 1.0;
      const randomFactor = 0.8 + Math.random() * 0.4;

      const visitors = Math.floor(
        baseVisitors * seasonalFactor * weekendFactor * randomFactor
      );

      historicalData.push({
        destination_id: 1,
        date: date,
        visitor_count: visitors,
        peak_time:
          date.getHours() >= 10 && date.getHours() <= 16 ? "midday" : "other",
      });
    }

    await Analytics.insertMany(historicalData);
    console.log(
      `Created ${historicalData.length} historical analytics records`
    );

    // Create sample demand forecasts
    const demandForecasts = [
      {
        region: "Auckland",
        dateRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-03-31"),
        },
        forecastType: "monthly",
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
        historicalData: [],
        trends: {
          direction: "increasing",
          rate: 5.2,
          seasonality: ["Peak in Dec", "Peak in Jan", "Low in Jun"],
        },
      },
      {
        region: "Wellington",
        dateRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-03-31"),
        },
        forecastType: "monthly",
        predictedDemand: {
          accommodation: 650,
          activities: 520,
          transportation: 380,
          restaurants: 780,
        },
        confidenceInterval: {
          lower: 70,
          upper: 92,
          accuracy: 82,
        },
        historicalData: [],
        trends: {
          direction: "stable",
          rate: 1.8,
          seasonality: ["Peak in Mar", "Peak in Nov", "Low in Jul"],
        },
      },
      {
        region: "Queenstown",
        dateRange: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-03-31"),
        },
        forecastType: "monthly",
        predictedDemand: {
          accommodation: 900,
          activities: 850,
          transportation: 600,
          restaurants: 1100,
        },
        confidenceInterval: {
          lower: 80,
          upper: 98,
          accuracy: 92,
        },
        historicalData: [],
        trends: {
          direction: "increasing",
          rate: 8.5,
          seasonality: ["Peak in Dec", "Peak in Jul", "Peak in Jan"],
        },
      },
    ];

    await DemandForecast.insertMany(demandForecasts);
    console.log(`Created ${demandForecasts.length} demand forecast records`);

    // Create sample peak season predictions
    const peakSeasonPredictions = [
      {
        region: "Auckland",
        year: 2024,
        peakSeasons: [
          {
            name: "Summer Peak",
            startDate: new Date("2024-12-01"),
            endDate: new Date("2025-02-28"),
            intensity: "high",
            predictedVisitors: 1100,
            confidenceLevel: 85,
            factors: [
              "School holidays",
              "Good weather",
              "Christmas/New Year",
              "Outdoor activities",
            ],
          },
          {
            name: "Easter/Autumn",
            startDate: new Date("2024-04-01"),
            endDate: new Date("2024-05-31"),
            intensity: "medium",
            predictedVisitors: 700,
            confidenceLevel: 78,
            factors: [
              "Easter holidays",
              "Mild weather",
              "Harvest season",
              "Lower accommodation costs",
            ],
          },
        ],
        seasonalPatterns: {
          summer: { months: [12, 1, 2], intensity: 85 },
          autumn: { months: [3, 4, 5], intensity: 65 },
          winter: { months: [6, 7, 8], intensity: 45 },
          spring: { months: [9, 10, 11], intensity: 75 },
        },
        specialEvents: [
          {
            name: "Christmas/New Year",
            date: new Date("2024-12-25"),
            impact: 90,
            category: "Holiday",
          },
          {
            name: "Easter",
            date: new Date("2024-04-15"),
            impact: 70,
            category: "Holiday",
          },
        ],
        weatherFactors: {
          averageTemperature: 16,
          rainfallPrediction: 1100,
          weatherQuality: 78,
        },
        economicFactors: {
          exchangeRate: 0.65,
          economicClimate: "good",
          travelCostIndex: 105,
        },
      },
      {
        region: "Queenstown",
        year: 2024,
        peakSeasons: [
          {
            name: "Summer Peak",
            startDate: new Date("2024-12-01"),
            endDate: new Date("2025-02-28"),
            intensity: "extreme",
            predictedVisitors: 1500,
            confidenceLevel: 92,
            factors: [
              "International visitors",
              "Adventure tourism",
              "Perfect weather",
              "Festival season",
            ],
          },
          {
            name: "Winter Sports",
            startDate: new Date("2024-06-01"),
            endDate: new Date("2024-09-30"),
            intensity: "high",
            predictedVisitors: 1200,
            confidenceLevel: 88,
            factors: [
              "Ski season",
              "Snow activities",
              "Winter festivals",
              "International visitors",
            ],
          },
        ],
        seasonalPatterns: {
          summer: { months: [12, 1, 2], intensity: 95 },
          autumn: { months: [3, 4, 5], intensity: 70 },
          winter: { months: [6, 7, 8], intensity: 88 },
          spring: { months: [9, 10, 11], intensity: 75 },
        },
        specialEvents: [
          {
            name: "Queenstown Winter Festival",
            date: new Date("2024-07-15"),
            impact: 85,
            category: "Festival",
          },
          {
            name: "Summer Festival",
            date: new Date("2024-01-15"),
            impact: 80,
            category: "Festival",
          },
        ],
        weatherFactors: {
          averageTemperature: 12,
          rainfallPrediction: 800,
          weatherQuality: 85,
        },
        economicFactors: {
          exchangeRate: 0.65,
          economicClimate: "excellent",
          travelCostIndex: 125,
        },
      },
    ];

    await PeakSeasonPrediction.insertMany(peakSeasonPredictions);
    console.log(
      `Created ${peakSeasonPredictions.length} peak season prediction records`
    );

    // Create sample staffing analytics
    const staffingAnalytics = [
      {
        businessId: "hotel_001",
        businessType: "hotel",
        forecastPeriod: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-03-31"),
        },
        currentMetrics: {
          averageOccupancy: 75,
          averageRevenue: 15000,
          staffCount: 25,
          operatingHours: 24,
        },
        staffingRecommendations: {
          frontDesk: {
            currentStaff: 5,
            recommendedStaff: 6,
            peakHours: [
              "08:00-10:00",
              "12:00-14:00",
              "17:00-19:00",
              "20:00-22:00",
            ],
            skillsRequired: [
              "Customer Service",
              "Multi-lingual",
              "Computer Skills",
              "Problem Solving",
            ],
          },
          housekeeping: {
            currentStaff: 10,
            recommendedStaff: 12,
            workload: 60,
            roomsPerHour: 2.5,
          },
          foodService: {
            currentStaff: 6,
            recommendedStaff: 7,
            expectedCovers: 90,
            shiftPattern: [
              "Breakfast (06:00-11:00)",
              "Lunch (11:00-15:00)",
              "Dinner (17:00-22:00)",
            ],
          },
          maintenance: {
            currentStaff: 4,
            recommendedStaff: 4,
            scheduledTasks: [
              "Daily safety checks",
              "Equipment maintenance",
              "Facility repairs",
              "Preventive maintenance",
              "Emergency response",
            ],
          },
        },
        resourcePlanning: {
          inventory: {
            linens: 87,
            amenities: 825,
            foodSupplies: 720,
            cleaningSupplies: 58,
          },
          equipment: {
            vehicles: 2,
            cleaningEquipment: 10,
            kitchenEquipment: 5,
            maintenanceTools: 5,
          },
          facilities: {
            rooms: 866,
            meetingSpaces: 83,
            recreationalAreas: 165,
          },
        },
        costAnalysis: {
          currentLaborCosts: 1300000,
          recommendedLaborCosts: 1430000,
          resourceCosts: 285000,
          potentialSavings: 0,
          roi: 15.2,
        },
        efficiencyMetrics: {
          staffUtilization: 75,
          customerSatisfaction: 82,
          operationalEfficiency: 78,
          costPerGuest: 95,
        },
      },
      {
        businessId: "restaurant_001",
        businessType: "restaurant",
        forecastPeriod: {
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-03-31"),
        },
        currentMetrics: {
          averageOccupancy: 65,
          averageRevenue: 8000,
          staffCount: 12,
          operatingHours: 16,
        },
        staffingRecommendations: {
          frontDesk: {
            currentStaff: 0,
            recommendedStaff: 0,
            peakHours: [],
            skillsRequired: [],
          },
          housekeeping: {
            currentStaff: 0,
            recommendedStaff: 0,
            workload: 0,
            roomsPerHour: 0,
          },
          foodService: {
            currentStaff: 10,
            recommendedStaff: 11,
            expectedCovers: 78,
            shiftPattern: [
              "Breakfast (06:00-11:00)",
              "Lunch (11:00-15:00)",
              "Dinner (17:00-22:00)",
            ],
          },
          maintenance: {
            currentStaff: 2,
            recommendedStaff: 2,
            scheduledTasks: [
              "Daily safety checks",
              "Equipment maintenance",
              "Kitchen maintenance",
            ],
          },
        },
        resourcePlanning: {
          inventory: {
            linens: 33,
            amenities: 0,
            foodSupplies: 624,
            cleaningSupplies: 26,
          },
          equipment: {
            vehicles: 1,
            cleaningEquipment: 9,
            kitchenEquipment: 7,
            maintenanceTools: 2,
          },
          facilities: {
            rooms: 0,
            meetingSpaces: 2,
            recreationalAreas: 1,
          },
        },
        costAnalysis: {
          currentLaborCosts: 520000,
          recommendedLaborCosts: 572000,
          resourceCosts: 95000,
          potentialSavings: 0,
          roi: 18.5,
        },
        efficiencyMetrics: {
          staffUtilization: 65,
          customerSatisfaction: 88,
          operationalEfficiency: 82,
          costPerGuest: 45,
        },
      },
    ];

    await StaffingAnalytics.insertMany(staffingAnalytics);
    console.log(
      `Created ${staffingAnalytics.length} staffing analytics records`
    );

    console.log("\n✅ Database seeded successfully!");
    console.log("\nSample data created:");
    console.log(`- ${historicalData.length} historical analytics records`);
    console.log(`- ${demandForecasts.length} demand forecasts`);
    console.log(`- ${peakSeasonPredictions.length} peak season predictions`);
    console.log(`- ${staffingAnalytics.length} staffing analytics records`);

    // Test API endpoints
    console.log("\n🧪 Testing API endpoints...");
    console.log("\nYou can now test the following API endpoints:");

    console.log("\n1. Demand Forecasting:");
    console.log(
      "curl -X POST http://localhost:3002/api/analytics/v1/forecast/demand \\"
    );
    console.log('  -H "Content-Type: application/json" \\');
    console.log(
      '  -d \'{"region":"Auckland","startDate":"2024-01-01","endDate":"2024-03-31","forecastType":"monthly"}\''
    );

    console.log("\n2. Peak Season Predictions:");
    console.log(
      "curl http://localhost:3002/api/analytics/v1/forecast/peaks/Auckland/2024"
    );

    console.log("\n3. Demand Trends:");
    console.log(
      'curl "http://localhost:3002/api/analytics/v1/forecast/trends?region=Auckland"'
    );

    console.log("\n4. Staffing Recommendations:");
    console.log(
      "curl -X POST http://localhost:3002/api/analytics/v1/staffing/recommendations \\"
    );
    console.log('  -H "Content-Type: application/json" \\');
    console.log(
      '  -d \'{"businessId":"hotel_002","businessType":"hotel","forecastPeriod":{"startDate":"2024-01-01","endDate":"2024-03-31"},"currentMetrics":{"averageOccupancy":75,"averageRevenue":15000,"staffCount":25,"operatingHours":24}}\''
    );

    console.log("\n5. Staffing Optimization:");
    console.log(
      "curl http://localhost:3002/api/analytics/v1/staffing/optimization/hotel_001"
    );

    console.log("\n6. Resource Utilization:");
    console.log(
      "curl http://localhost:3002/api/analytics/v1/resources/utilization/hotel_001"
    );
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  }
}

// Run the seed function
seedDatabase();
