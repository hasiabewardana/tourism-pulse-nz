import {
  StaffingAnalytics,
  IStaffingAnalytics,
} from "../models/staffingAnalyticsModel";
import { DemandForecast } from "../models/demandForecastModel";
import { addDays, differenceInDays } from "date-fns";

interface StaffingRequest {
  businessId: string;
  businessType: "hotel" | "restaurant" | "activity_provider" | "transport";
  forecastPeriod: {
    startDate: Date;
    endDate: Date;
  };
  currentMetrics: {
    averageOccupancy: number;
    averageRevenue: number;
    staffCount: number;
    operatingHours: number;
  };
  demandForecast?: any;
}

interface OptimizationRequest {
  businessId: string;
  timeframe: "daily" | "weekly" | "monthly";
}

interface StaffingRecommendation {
  staffingRecommendations: any;
  resourcePlanning: any;
  costAnalysis: any;
  efficiencyMetrics: any;
}

export class StaffingService {
  // Calculate staffing needs based on demand forecast
  async calculateStaffingNeeds(request: StaffingRequest): Promise<any> {
    try {
      console.log(
        `Calculating staffing needs for business ${request.businessId}`
      );

      const demandForecast =
        request.demandForecast ||
        (await this.getDemandForecastForBusiness(request.businessId));
      const businessConfig = this.getBusinessConfiguration(
        request.businessType
      );

      // Calculate base staffing requirements
      const baseStaffing = this.calculateBaseStaffing(
        request.currentMetrics,
        businessConfig
      );

      // Adjust for predicted demand
      const adjustedStaffing = this.adjustStaffingForDemand(
        baseStaffing,
        demandForecast,
        request.businessType
      );

      // Optimize for efficiency
      const optimizedStaffing = this.optimizeStaffingLevels(
        adjustedStaffing,
        request.currentMetrics
      );

      return optimizedStaffing;
    } catch (error) {
      console.error("Error calculating staffing needs:", error);
      throw new Error(
        `Failed to calculate staffing needs: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Calculate resource planning needs
  async calculateResourceNeeds(
    staffingRecommendations: any,
    demandForecast: any,
    businessType: string
  ): Promise<any> {
    try {
      const businessConfig = this.getBusinessConfiguration(businessType);

      return {
        inventory: this.calculateInventoryNeeds(
          staffingRecommendations,
          demandForecast,
          businessConfig
        ),
        equipment: this.calculateEquipmentNeeds(
          staffingRecommendations,
          businessConfig
        ),
        facilities: this.calculateFacilityNeeds(demandForecast, businessConfig),
      };
    } catch (error) {
      console.error("Error calculating resource needs:", error);
      throw new Error(
        `Failed to calculate resource needs: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Calculate cost analysis
  async calculateCosts(
    staffingRecommendations: any,
    resourcePlanning: any,
    businessType: string
  ): Promise<any> {
    try {
      const costConfig = this.getCostConfiguration(businessType);

      const currentLaborCosts = this.calculateCurrentLaborCosts(
        staffingRecommendations,
        costConfig
      );
      const recommendedLaborCosts = this.calculateRecommendedLaborCosts(
        staffingRecommendations,
        costConfig
      );
      const resourceCosts = this.calculateResourceCosts(
        resourcePlanning,
        costConfig
      );

      const potentialSavings = Math.max(
        0,
        currentLaborCosts - recommendedLaborCosts
      );
      const totalInvestment = recommendedLaborCosts + resourceCosts;
      const roi =
        totalInvestment > 0 ? (potentialSavings / totalInvestment) * 100 : 0;

      return {
        currentLaborCosts,
        recommendedLaborCosts,
        resourceCosts,
        potentialSavings,
        roi: Math.round(roi * 100) / 100,
      };
    } catch (error) {
      console.error("Error calculating costs:", error);
      throw new Error(
        `Failed to calculate costs: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Get optimization suggestions
  async getOptimizationSuggestions(request: OptimizationRequest): Promise<any> {
    try {
      const recentAnalytics = await this.getRecentStaffingAnalytics(
        request.businessId
      );

      if (!recentAnalytics) {
        throw new Error("No recent staffing analytics found");
      }

      const suggestions = this.generateOptimizationSuggestions(
        recentAnalytics,
        request.timeframe
      );
      const costSavings = this.calculateOptimizationSavings(
        suggestions,
        recentAnalytics
      );
      const efficiencyMetrics = this.calculateEfficiencyGains(
        suggestions,
        recentAnalytics
      );

      return {
        suggestions,
        costSavings,
        efficiencyMetrics,
        implementationSteps: this.generateImplementationSteps(suggestions),
      };
    } catch (error) {
      console.error("Error generating optimization suggestions:", error);
      throw new Error(
        `Failed to generate optimization suggestions: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Get demand forecast for a specific business
  private async getDemandForecastForBusiness(businessId: string): Promise<any> {
    try {
      // In a real implementation, you would map businessId to region
      // For now, use a default region
      const forecast = await DemandForecast.findOne({
        region: "default",
        "dateRange.startDate": {
          $lte: new Date(),
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      }).sort({ createdAt: -1 });

      if (forecast) {
        return forecast.predictedDemand;
      }

      // Return default forecast if none found
      return {
        accommodation: 500,
        activities: 400,
        transportation: 300,
        restaurants: 600,
      };
    } catch (error) {
      console.error("Error fetching demand forecast:", error);
      return {
        accommodation: 500,
        activities: 400,
        transportation: 300,
        restaurants: 600,
      };
    }
  }

  // Get business configuration based on type
  private getBusinessConfiguration(businessType: string) {
    const configs: { [key: string]: any } = {
      hotel: {
        staffPerRoom: 0.3,
        peakHourMultiplier: 1.5,
        seasonalMultiplier: 1.2,
        departments: ["frontDesk", "housekeeping", "maintenance"],
        operatingHours: 24,
      },
      restaurant: {
        staffPerCover: 0.15,
        peakHourMultiplier: 2.0,
        seasonalMultiplier: 1.1,
        departments: ["foodService", "maintenance"],
        operatingHours: 16,
      },
      activity_provider: {
        staffPerGuest: 0.1,
        peakHourMultiplier: 1.8,
        seasonalMultiplier: 1.4,
        departments: ["frontDesk", "maintenance"],
        operatingHours: 10,
      },
      transport: {
        staffPerVehicle: 1.2,
        peakHourMultiplier: 1.6,
        seasonalMultiplier: 1.3,
        departments: ["maintenance"],
        operatingHours: 16,
      },
    };

    return configs[businessType] || configs.hotel;
  }

  // Calculate base staffing requirements
  private calculateBaseStaffing(currentMetrics: any, businessConfig: any) {
    const baseStaff = Math.ceil(currentMetrics.staffCount);
    const utilizationFactor = currentMetrics.averageOccupancy / 100;

    return {
      frontDesk: {
        currentStaff: Math.ceil(baseStaff * 0.2),
        baseRequirement: Math.ceil(baseStaff * 0.2 * utilizationFactor),
        peakHours: this.calculatePeakHours(businessConfig),
        skillsRequired: this.getRequiredSkills("frontDesk"),
      },
      housekeeping: {
        currentStaff: Math.ceil(baseStaff * 0.4),
        baseRequirement: Math.ceil(baseStaff * 0.4 * utilizationFactor),
        workload: Math.ceil(currentMetrics.averageOccupancy * 0.8),
        roomsPerHour: 2.5,
      },
      foodService: {
        currentStaff: Math.ceil(baseStaff * 0.25),
        baseRequirement: Math.ceil(baseStaff * 0.25 * utilizationFactor),
        expectedCovers: Math.ceil(currentMetrics.averageOccupancy * 1.2),
        shiftPattern: this.getShiftPatterns("foodService"),
      },
      maintenance: {
        currentStaff: Math.ceil(baseStaff * 0.15),
        baseRequirement: Math.ceil(baseStaff * 0.15),
        scheduledTasks: this.getMaintenanceTasks(),
      },
    };
  }

  // Adjust staffing based on demand forecast
  private adjustStaffingForDemand(
    baseStaffing: any,
    demandForecast: any,
    businessType: string
  ) {
    const demandMultiplier = this.calculateDemandMultiplier(
      demandForecast,
      businessType
    );

    return {
      frontDesk: {
        ...baseStaffing.frontDesk,
        recommendedStaff: Math.ceil(
          baseStaffing.frontDesk.baseRequirement * demandMultiplier
        ),
      },
      housekeeping: {
        ...baseStaffing.housekeeping,
        recommendedStaff: Math.ceil(
          baseStaffing.housekeeping.baseRequirement * demandMultiplier
        ),
      },
      foodService: {
        ...baseStaffing.foodService,
        recommendedStaff: Math.ceil(
          baseStaffing.foodService.baseRequirement * demandMultiplier
        ),
      },
      maintenance: {
        ...baseStaffing.maintenance,
        recommendedStaff: Math.ceil(
          baseStaffing.maintenance.baseRequirement *
            Math.min(demandMultiplier, 1.2)
        ),
      },
    };
  }

  // Optimize staffing levels for efficiency
  private optimizeStaffingLevels(adjustedStaffing: any, currentMetrics: any) {
    // Apply efficiency optimizations
    const efficiencyFactor = this.calculateEfficiencyFactor(currentMetrics);

    Object.keys(adjustedStaffing).forEach((department) => {
      const current = adjustedStaffing[department].recommendedStaff;
      adjustedStaffing[department].recommendedStaff = Math.max(
        1,
        Math.ceil(current * efficiencyFactor)
      );
    });

    return adjustedStaffing;
  }

  // Calculate demand multiplier based on forecast
  private calculateDemandMultiplier(
    demandForecast: any,
    businessType: string
  ): number {
    let multiplier = 1.0;

    switch (businessType) {
      case "hotel":
        multiplier = (demandForecast.accommodation || 500) / 500;
        break;
      case "restaurant":
        multiplier = (demandForecast.restaurants || 600) / 600;
        break;
      case "activity_provider":
        multiplier = (demandForecast.activities || 400) / 400;
        break;
      case "transport":
        multiplier = (demandForecast.transportation || 300) / 300;
        break;
    }

    return Math.max(0.5, Math.min(2.0, multiplier));
  }

  // Calculate efficiency factor based on current metrics
  private calculateEfficiencyFactor(currentMetrics: any): number {
    const occupancyFactor = currentMetrics.averageOccupancy / 100;
    const revenueFactor = Math.min(1.2, currentMetrics.averageRevenue / 10000);

    return Math.max(0.8, Math.min(1.1, (occupancyFactor + revenueFactor) / 2));
  }

  // Calculate peak hours
  private calculatePeakHours(businessConfig: any): string[] {
    return ["08:00-10:00", "12:00-14:00", "17:00-19:00", "20:00-22:00"];
  }

  // Get required skills for department
  private getRequiredSkills(department: string): string[] {
    const skills: { [key: string]: string[] } = {
      frontDesk: [
        "Customer Service",
        "Multi-lingual",
        "Computer Skills",
        "Problem Solving",
      ],
      housekeeping: [
        "Attention to Detail",
        "Physical Fitness",
        "Time Management",
        "Cleaning Protocols",
      ],
      foodService: [
        "Food Safety",
        "Customer Service",
        "Multitasking",
        "POS Systems",
      ],
      maintenance: [
        "Technical Skills",
        "Problem Solving",
        "Safety Protocols",
        "Equipment Operation",
      ],
    };

    return skills[department] || ["General Skills"];
  }

  // Get shift patterns
  private getShiftPatterns(department: string): string[] {
    const patterns: { [key: string]: string[] } = {
      frontDesk: [
        "Early (06:00-14:00)",
        "Day (14:00-22:00)",
        "Night (22:00-06:00)",
      ],
      foodService: [
        "Breakfast (06:00-11:00)",
        "Lunch (11:00-15:00)",
        "Dinner (17:00-22:00)",
      ],
      housekeeping: ["Morning (08:00-16:00)", "Afternoon (12:00-20:00)"],
      maintenance: ["Day (08:00-17:00)", "On-call (24/7)"],
    };

    return patterns[department] || ["Standard (09:00-17:00)"];
  }

  // Get maintenance tasks
  private getMaintenanceTasks(): string[] {
    return [
      "Daily safety checks",
      "Equipment maintenance",
      "Facility repairs",
      "Preventive maintenance",
      "Emergency response",
    ];
  }

  // Calculate inventory needs
  private calculateInventoryNeeds(
    staffingRecommendations: any,
    demandForecast: any,
    businessConfig: any
  ) {
    const totalStaff = Object.values(staffingRecommendations).reduce(
      (sum: number, dept: any) => sum + (dept.recommendedStaff || 0),
      0
    );

    return {
      linens: Math.ceil(totalStaff * 3), // 3 sets per staff member
      amenities: Math.ceil(demandForecast.accommodation * 1.1),
      foodSupplies: Math.ceil(demandForecast.restaurants * 0.8),
      cleaningSupplies: Math.ceil(totalStaff * 2),
    };
  }

  // Calculate equipment needs
  private calculateEquipmentNeeds(
    staffingRecommendations: any,
    businessConfig: any
  ) {
    return {
      vehicles: Math.ceil(
        staffingRecommendations.maintenance?.recommendedStaff * 0.5 || 1
      ),
      cleaningEquipment: Math.ceil(
        staffingRecommendations.housekeeping?.recommendedStaff * 0.8 || 1
      ),
      kitchenEquipment: Math.ceil(
        staffingRecommendations.foodService?.recommendedStaff * 0.6 || 1
      ),
      maintenanceTools: Math.ceil(
        staffingRecommendations.maintenance?.recommendedStaff * 1.2 || 1
      ),
    };
  }

  // Calculate facility needs
  private calculateFacilityNeeds(demandForecast: any, businessConfig: any) {
    return {
      rooms: Math.ceil(demandForecast.accommodation * 1.05),
      meetingSpaces: Math.ceil(demandForecast.accommodation * 0.1),
      recreationalAreas: Math.ceil(demandForecast.activities * 0.2),
    };
  }

  // Get cost configuration
  private getCostConfiguration(businessType: string) {
    return {
      hourlyWage: {
        frontDesk: 25,
        housekeeping: 22,
        foodService: 23,
        maintenance: 30,
      },
      hoursPerWeek: 40,
      benefits: 0.3, // 30% of wage for benefits
      equipment: {
        vehicles: 50000,
        cleaningEquipment: 2000,
        kitchenEquipment: 15000,
        maintenanceTools: 5000,
      },
      inventory: {
        linens: 50,
        amenities: 10,
        foodSupplies: 15,
        cleaningSupplies: 25,
      },
    };
  }

  // Calculate current labor costs
  private calculateCurrentLaborCosts(
    staffingRecommendations: any,
    costConfig: any
  ): number {
    let totalCost = 0;

    Object.keys(staffingRecommendations).forEach((department) => {
      const staff = staffingRecommendations[department];
      const hourlyWage = costConfig.hourlyWage[department] || 25;
      const annualCost =
        staff.currentStaff *
        hourlyWage *
        costConfig.hoursPerWeek *
        52 *
        (1 + costConfig.benefits);
      totalCost += annualCost;
    });

    return Math.round(totalCost);
  }

  // Calculate recommended labor costs
  private calculateRecommendedLaborCosts(
    staffingRecommendations: any,
    costConfig: any
  ): number {
    let totalCost = 0;

    Object.keys(staffingRecommendations).forEach((department) => {
      const staff = staffingRecommendations[department];
      const hourlyWage = costConfig.hourlyWage[department] || 25;
      const annualCost =
        staff.recommendedStaff *
        hourlyWage *
        costConfig.hoursPerWeek *
        52 *
        (1 + costConfig.benefits);
      totalCost += annualCost;
    });

    return Math.round(totalCost);
  }

  // Calculate resource costs
  private calculateResourceCosts(
    resourcePlanning: any,
    costConfig: any
  ): number {
    let totalCost = 0;

    // Equipment costs
    Object.keys(resourcePlanning.equipment).forEach((equipment) => {
      const quantity = resourcePlanning.equipment[equipment];
      const unitCost = costConfig.equipment[equipment] || 1000;
      totalCost += quantity * unitCost;
    });

    // Annual inventory costs
    Object.keys(resourcePlanning.inventory).forEach((item) => {
      const quantity = resourcePlanning.inventory[item];
      const unitCost = costConfig.inventory[item] || 10;
      totalCost += quantity * unitCost * 12; // Annual cost
    });

    return Math.round(totalCost);
  }

  // Get recent staffing analytics
  private async getRecentStaffingAnalytics(
    businessId: string
  ): Promise<IStaffingAnalytics | null> {
    try {
      return await StaffingAnalytics.findOne({ businessId })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error("Error fetching recent staffing analytics:", error);
      return null;
    }
  }

  // Generate optimization suggestions
  private generateOptimizationSuggestions(
    analytics: IStaffingAnalytics,
    timeframe: string
  ) {
    const suggestions = [];

    // Analyze staffing efficiency
    if (analytics.efficiencyMetrics.staffUtilization < 70) {
      suggestions.push({
        type: "staffing",
        priority: "high",
        suggestion: "Reduce staff during low-utilization periods",
        impact: "Cost reduction of 15-20%",
      });
    }

    // Analyze cost per guest
    if (analytics.efficiencyMetrics.costPerGuest > 100) {
      suggestions.push({
        type: "cost",
        priority: "medium",
        suggestion: "Optimize resource allocation to reduce cost per guest",
        impact: "Cost reduction of 10-15%",
      });
    }

    // Analyze customer satisfaction
    if (analytics.efficiencyMetrics.customerSatisfaction < 85) {
      suggestions.push({
        type: "service",
        priority: "high",
        suggestion: "Increase staff training and peak-hour coverage",
        impact: "Customer satisfaction improvement of 10-15%",
      });
    }

    return suggestions;
  }

  // Calculate optimization savings
  private calculateOptimizationSavings(
    suggestions: any[],
    analytics: IStaffingAnalytics
  ) {
    let totalSavings = 0;

    suggestions.forEach((suggestion) => {
      switch (suggestion.type) {
        case "staffing":
          totalSavings += analytics.costAnalysis.currentLaborCosts * 0.175; // 17.5% average
          break;
        case "cost":
          totalSavings += analytics.costAnalysis.resourceCosts * 0.125; // 12.5% average
          break;
        case "service":
          // Service improvements may increase costs but improve revenue
          totalSavings -= analytics.costAnalysis.currentLaborCosts * 0.05; // 5% cost increase
          break;
      }
    });

    return Math.round(Math.max(0, totalSavings));
  }

  // Calculate efficiency gains
  private calculateEfficiencyGains(
    suggestions: any[],
    analytics: IStaffingAnalytics
  ) {
    return {
      staffUtilization: Math.min(
        100,
        analytics.efficiencyMetrics.staffUtilization + suggestions.length * 5
      ),
      operationalEfficiency: Math.min(
        100,
        analytics.efficiencyMetrics.operationalEfficiency +
          suggestions.length * 3
      ),
      customerSatisfaction: Math.min(
        100,
        analytics.efficiencyMetrics.customerSatisfaction +
          suggestions.length * 4
      ),
    };
  }

  // Generate implementation steps
  private generateImplementationSteps(suggestions: any[]) {
    const steps: any[] = [];

    suggestions.forEach((suggestion, index) => {
      steps.push({
        step: index + 1,
        action: suggestion.suggestion,
        timeframe: "2-4 weeks",
        resources: "Management team",
        metrics: "Monitor staff utilization and customer feedback",
      });
    });

    return steps;
  }
}

export default new StaffingService();
