import { Request, Response } from "express";
import { StaffingAnalytics } from "../models/staffingAnalyticsModel";
import staffingService from "../services/staffingService";

export class StaffingController {
  // Generate staffing recommendations
  async generateStaffingRecommendations(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { businessId, businessType, forecastPeriod, currentMetrics } =
        req.body;

      // Validate input
      if (!businessId || !businessType || !forecastPeriod || !currentMetrics) {
        res.status(400).json({
          success: false,
          error:
            "Missing required fields: businessId, businessType, forecastPeriod, currentMetrics",
        });
        return;
      }

      console.log(
        `Generating staffing recommendations for business ${businessId}`
      );

      // Calculate staffing requirements
      const staffingRecommendations =
        await staffingService.calculateStaffingNeeds({
          businessId,
          businessType,
          forecastPeriod: {
            startDate: new Date(forecastPeriod.startDate),
            endDate: new Date(forecastPeriod.endDate),
          },
          currentMetrics,
        });

      // Generate resource planning
      const resourcePlanning = await staffingService.calculateResourceNeeds(
        staffingRecommendations,
        null, // demandForecast will be fetched internally
        businessType
      );

      // Calculate cost analysis
      const costAnalysis = await staffingService.calculateCosts(
        staffingRecommendations,
        resourcePlanning,
        businessType
      );

      // Calculate efficiency metrics
      const efficiencyMetrics = this.calculateEfficiencyMetrics(
        staffingRecommendations,
        currentMetrics,
        costAnalysis
      );

      // Save to database
      const analytics = new StaffingAnalytics({
        businessId,
        businessType,
        forecastPeriod: {
          startDate: new Date(forecastPeriod.startDate),
          endDate: new Date(forecastPeriod.endDate),
        },
        currentMetrics,
        staffingRecommendations,
        resourcePlanning,
        costAnalysis,
        efficiencyMetrics,
      });

      await analytics.save();

      // Generate insights and action items
      const insights = this.generateStaffingInsights(analytics);
      const actionItems = this.generateActionItems(
        staffingRecommendations,
        currentMetrics
      );

      res.json({
        success: true,
        recommendations: {
          id: analytics._id,
          businessId: analytics.businessId,
          businessType: analytics.businessType,
          forecastPeriod: analytics.forecastPeriod,
          staffingRecommendations: analytics.staffingRecommendations,
          resourcePlanning: analytics.resourcePlanning,
          costAnalysis: analytics.costAnalysis,
          efficiencyMetrics: analytics.efficiencyMetrics,
        },
        insights,
        actionItems,
        summary: this.generateRecommendationSummary(analytics),
      });
    } catch (error) {
      console.error("Error generating staffing recommendations:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // Get staffing optimization suggestions
  async getStaffingOptimization(req: Request, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { timeframe = "monthly" } = req.query;

      if (!businessId) {
        res.status(400).json({
          success: false,
          error: "Missing required parameter: businessId",
        });
        return;
      }

      console.log(`Getting staffing optimization for business ${businessId}`);

      const optimizations = await staffingService.getOptimizationSuggestions({
        businessId,
        timeframe: timeframe as "daily" | "weekly" | "monthly",
      });

      res.json({
        success: true,
        businessId,
        timeframe,
        optimizations: optimizations.suggestions,
        potentialSavings: optimizations.costSavings,
        efficiencyGains: optimizations.efficiencyMetrics,
        implementationPlan: optimizations.implementationSteps,
        priority: this.categorizePriority(optimizations.suggestions),
      });
    } catch (error) {
      console.error("Error getting staffing optimization:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // Get staffing analytics history
  async getStaffingHistory(req: Request, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { limit = "10", startDate, endDate } = req.query;

      if (!businessId) {
        res.status(400).json({
          success: false,
          error: "Missing required parameter: businessId",
        });
        return;
      }

      const query: any = { businessId };

      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        };
      }

      const history = await StaffingAnalytics.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit as string))
        .select(
          "createdAt forecastPeriod staffingRecommendations costAnalysis efficiencyMetrics"
        );

      // Calculate trends
      const trends = this.calculateStaffingTrends(history);

      res.json({
        success: true,
        businessId,
        history,
        trends,
        totalRecords: history.length,
      });
    } catch (error) {
      console.error("Error getting staffing history:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // Compare staffing scenarios
  async compareStaffingScenarios(req: Request, res: Response): Promise<void> {
    try {
      const { businessId, scenarios } = req.body;

      if (!businessId || !scenarios || !Array.isArray(scenarios)) {
        res.status(400).json({
          success: false,
          error: "Missing required fields: businessId, scenarios (array)",
        });
        return;
      }

      const comparisons = [];

      for (const scenario of scenarios) {
        const staffingRecommendations =
          await staffingService.calculateStaffingNeeds({
            businessId,
            businessType: scenario.businessType,
            forecastPeriod: scenario.forecastPeriod,
            currentMetrics: scenario.currentMetrics,
          });

        const resourcePlanning = await staffingService.calculateResourceNeeds(
          staffingRecommendations,
          null,
          scenario.businessType
        );

        const costAnalysis = await staffingService.calculateCosts(
          staffingRecommendations,
          resourcePlanning,
          scenario.businessType
        );

        comparisons.push({
          scenarioName: scenario.name || `Scenario ${comparisons.length + 1}`,
          staffingRecommendations,
          costAnalysis,
          roi: costAnalysis.roi,
          potentialSavings: costAnalysis.potentialSavings,
        });
      }

      // Rank scenarios by ROI
      const rankedScenarios = comparisons.sort((a, b) => b.roi - a.roi);

      res.json({
        success: true,
        businessId,
        scenarioComparisons: rankedScenarios,
        bestScenario: rankedScenarios[0],
        totalScenariosCompared: scenarios.length,
      });
    } catch (error) {
      console.error("Error comparing staffing scenarios:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // Get resource utilization metrics
  async getResourceUtilization(req: Request, res: Response): Promise<void> {
    try {
      const { businessId } = req.params;
      const { period = "monthly" } = req.query;

      if (!businessId) {
        res.status(400).json({
          success: false,
          error: "Missing required parameter: businessId",
        });
        return;
      }

      const recentAnalytics = await StaffingAnalytics.findOne({
        businessId,
      }).sort({ createdAt: -1 });

      if (!recentAnalytics) {
        res.status(404).json({
          success: false,
          error: "No staffing analytics found for this business",
        });
        return;
      }

      const utilization = this.calculateResourceUtilization(recentAnalytics);

      res.json({
        success: true,
        businessId,
        period,
        resourceUtilization: utilization,
        recommendations: this.generateUtilizationRecommendations(utilization),
      });
    } catch (error) {
      console.error("Error getting resource utilization:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  // Private helper methods

  private calculateEfficiencyMetrics(
    staffingRecommendations: any,
    currentMetrics: any,
    costAnalysis: any
  ) {
    const totalCurrentStaff = Object.values(staffingRecommendations).reduce(
      (sum: number, dept: any) => sum + (dept.currentStaff || 0),
      0
    );
    const totalRecommendedStaff = Object.values(staffingRecommendations).reduce(
      (sum: number, dept: any) => sum + (dept.recommendedStaff || 0),
      0
    );

    const staffUtilization = Math.min(
      100,
      (currentMetrics.averageOccupancy / 100) * 100
    );
    const costPerGuest =
      costAnalysis.recommendedLaborCosts /
      Math.max(1, currentMetrics.averageOccupancy * 30); // Assume 30 days
    const operationalEfficiency = Math.min(
      100,
      (totalRecommendedStaff / Math.max(1, totalCurrentStaff)) * 100
    );

    return {
      staffUtilization: Math.round(staffUtilization),
      customerSatisfaction: Math.min(100, 70 + staffUtilization * 0.3), // Estimated based on utilization
      operationalEfficiency: Math.round(operationalEfficiency),
      costPerGuest: Math.round(costPerGuest),
    };
  }

  private generateStaffingInsights(analytics: any) {
    const insights = [];

    // Staff level insights
    const totalCurrent = Object.values(
      analytics.staffingRecommendations
    ).reduce((sum: number, dept: any) => sum + (dept.currentStaff || 0), 0);
    const totalRecommended = Object.values(
      analytics.staffingRecommendations
    ).reduce((sum: number, dept: any) => sum + (dept.recommendedStaff || 0), 0);

    if (totalRecommended > totalCurrent) {
      insights.push({
        type: "staffing_increase",
        severity: "medium",
        message: `Recommended to increase total staff by ${
          totalRecommended - totalCurrent
        } positions`,
        impact: "Improved service quality and customer satisfaction",
      });
    } else if (totalRecommended < totalCurrent) {
      insights.push({
        type: "staffing_decrease",
        severity: "low",
        message: `Opportunity to reduce staff by ${
          totalCurrent - totalRecommended
        } positions`,
        impact: `Potential savings of $${analytics.costAnalysis.potentialSavings.toLocaleString()}`,
      });
    }

    // Cost insights
    if (analytics.costAnalysis.roi > 20) {
      insights.push({
        type: "high_roi",
        severity: "positive",
        message: `High ROI of ${analytics.costAnalysis.roi}% expected from optimization`,
        impact: "Strong business case for implementation",
      });
    }

    // Efficiency insights
    if (analytics.efficiencyMetrics.staffUtilization < 70) {
      insights.push({
        type: "low_utilization",
        severity: "medium",
        message: "Staff utilization is below optimal levels",
        impact: "Consider cross-training or schedule optimization",
      });
    }

    return insights;
  }

  private generateActionItems(
    staffingRecommendations: any,
    currentMetrics: any
  ) {
    const actionItems: any[] = [];

    Object.keys(staffingRecommendations).forEach((department) => {
      const dept = staffingRecommendations[department];
      const staffDiff = dept.recommendedStaff - dept.currentStaff;

      if (staffDiff > 0) {
        actionItems.push({
          department,
          priority: staffDiff > 2 ? "high" : "medium",
          action: `Hire ${staffDiff} additional staff`,
          timeline: staffDiff > 2 ? "2-4 weeks" : "1-2 weeks",
          cost: staffDiff * 50000, // Estimated annual cost per employee
        });
      } else if (staffDiff < 0) {
        actionItems.push({
          department,
          priority: "low",
          action: `Consider reducing staff by ${Math.abs(staffDiff)} positions`,
          timeline: "1-3 months",
          savings: Math.abs(staffDiff) * 50000,
        });
      }
    });

    return actionItems;
  }

  private generateRecommendationSummary(analytics: any) {
    const totalCurrentCost = analytics.costAnalysis.currentLaborCosts;
    const totalRecommendedCost = analytics.costAnalysis.recommendedLaborCosts;
    const savings = analytics.costAnalysis.potentialSavings;

    return {
      currentAnnualCost: totalCurrentCost,
      recommendedAnnualCost: totalRecommendedCost,
      potentialAnnualSavings: savings,
      roi: analytics.costAnalysis.roi,
      paybackPeriod:
        savings > 0 ? Math.ceil((totalRecommendedCost / savings) * 12) : null, // Months
      riskLevel: this.assessRiskLevel(analytics),
      implementationComplexity: this.assessImplementationComplexity(analytics),
    };
  }

  private categorizePriority(suggestions: any[]): string {
    const highPriority = suggestions.filter(
      (s) => s.priority === "high"
    ).length;
    const totalSuggestions = suggestions.length;

    if (highPriority / totalSuggestions > 0.5) return "critical";
    if (highPriority > 0) return "high";
    return "medium";
  }

  private calculateStaffingTrends(history: any[]) {
    if (history.length < 2) {
      return {
        staffingTrend: "insufficient_data",
        costTrend: "insufficient_data",
        efficiencyTrend: "insufficient_data",
      };
    }

    const latest = history[0];
    const previous = history[1];

    // Calculate trends
    const staffingChange =
      ((latest.efficiencyMetrics.staffUtilization -
        previous.efficiencyMetrics.staffUtilization) /
        previous.efficiencyMetrics.staffUtilization) *
      100;
    const costChange =
      ((latest.costAnalysis.recommendedLaborCosts -
        previous.costAnalysis.recommendedLaborCosts) /
        previous.costAnalysis.recommendedLaborCosts) *
      100;
    const efficiencyChange =
      ((latest.efficiencyMetrics.operationalEfficiency -
        previous.efficiencyMetrics.operationalEfficiency) /
        previous.efficiencyMetrics.operationalEfficiency) *
      100;

    return {
      staffingTrend:
        staffingChange > 5
          ? "increasing"
          : staffingChange < -5
          ? "decreasing"
          : "stable",
      costTrend:
        costChange > 5
          ? "increasing"
          : costChange < -5
          ? "decreasing"
          : "stable",
      efficiencyTrend:
        efficiencyChange > 5
          ? "improving"
          : efficiencyChange < -5
          ? "declining"
          : "stable",
      staffingChangePercent: Math.round(staffingChange * 100) / 100,
      costChangePercent: Math.round(costChange * 100) / 100,
      efficiencyChangePercent: Math.round(efficiencyChange * 100) / 100,
    };
  }

  private calculateResourceUtilization(analytics: any) {
    return {
      staffUtilization: {
        current: analytics.efficiencyMetrics.staffUtilization,
        target: 85,
        status:
          analytics.efficiencyMetrics.staffUtilization >= 85
            ? "optimal"
            : "underutilized",
      },
      equipmentUtilization: {
        vehicles: Math.min(
          100,
          (analytics.resourcePlanning.equipment.vehicles /
            Math.max(
              1,
              analytics.staffingRecommendations.maintenance?.recommendedStaff ||
                1
            )) *
            100
        ),
        cleaningEquipment: Math.min(
          100,
          (analytics.resourcePlanning.equipment.cleaningEquipment /
            Math.max(
              1,
              analytics.staffingRecommendations.housekeeping
                ?.recommendedStaff || 1
            )) *
            100
        ),
        kitchenEquipment: Math.min(
          100,
          (analytics.resourcePlanning.equipment.kitchenEquipment /
            Math.max(
              1,
              analytics.staffingRecommendations.foodService?.recommendedStaff ||
                1
            )) *
            100
        ),
      },
      facilityUtilization: {
        rooms: analytics.currentMetrics.averageOccupancy,
        meetingSpaces: Math.min(
          100,
          analytics.currentMetrics.averageOccupancy * 0.8
        ),
        recreationalAreas: Math.min(
          100,
          analytics.currentMetrics.averageOccupancy * 0.6
        ),
      },
    };
  }

  private generateUtilizationRecommendations(utilization: any) {
    const recommendations = [];

    if (utilization.staffUtilization.current < 70) {
      recommendations.push({
        category: "Staff",
        recommendation:
          "Consider cross-training staff or adjusting schedules to improve utilization",
        priority: "medium",
        expectedImprovement: "10-15% efficiency gain",
      });
    }

    if (utilization.equipmentUtilization.vehicles < 80) {
      recommendations.push({
        category: "Equipment",
        recommendation:
          "Optimize vehicle scheduling or consider reducing fleet size",
        priority: "low",
        expectedImprovement: "5-10% cost reduction",
      });
    }

    if (utilization.facilityUtilization.rooms < 60) {
      recommendations.push({
        category: "Facilities",
        recommendation: "Implement marketing strategies to increase occupancy",
        priority: "high",
        expectedImprovement: "15-25% revenue increase",
      });
    }

    return recommendations;
  }

  private assessRiskLevel(analytics: any): string {
    let riskScore = 0;

    // High cost changes increase risk
    const costChangePercent =
      Math.abs(
        (analytics.costAnalysis.recommendedLaborCosts -
          analytics.costAnalysis.currentLaborCosts) /
          analytics.costAnalysis.currentLaborCosts
      ) * 100;
    if (costChangePercent > 20) riskScore += 2;
    else if (costChangePercent > 10) riskScore += 1;

    // Low ROI increases risk
    if (analytics.costAnalysis.roi < 10) riskScore += 2;
    else if (analytics.costAnalysis.roi < 20) riskScore += 1;

    // Current efficiency affects risk
    if (analytics.efficiencyMetrics.staffUtilization < 60) riskScore += 1;

    if (riskScore >= 4) return "high";
    if (riskScore >= 2) return "medium";
    return "low";
  }

  private assessImplementationComplexity(analytics: any): string {
    const totalStaffChange = Object.values(
      analytics.staffingRecommendations
    ).reduce(
      (sum: number, dept: any) =>
        sum + Math.abs((dept.recommendedStaff || 0) - (dept.currentStaff || 0)),
      0
    );

    if (totalStaffChange > 10) return "high";
    if (totalStaffChange > 5) return "medium";
    return "low";
  }
}

export default new StaffingController();
