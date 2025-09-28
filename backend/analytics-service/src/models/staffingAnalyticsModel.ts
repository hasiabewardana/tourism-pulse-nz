import mongoose, { Document, Schema } from "mongoose";

// Interface for staffing analytics document
export interface IStaffingAnalytics extends Document {
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
  staffingRecommendations: {
    frontDesk: {
      currentStaff: number;
      recommendedStaff: number;
      peakHours: string[];
      skillsRequired: string[];
    };
    housekeeping: {
      currentStaff: number;
      recommendedStaff: number;
      workload: number;
      roomsPerHour: number;
    };
    foodService: {
      currentStaff: number;
      recommendedStaff: number;
      expectedCovers: number;
      shiftPattern: string[];
    };
    maintenance: {
      currentStaff: number;
      recommendedStaff: number;
      scheduledTasks: string[];
    };
  };
  resourcePlanning: {
    inventory: {
      linens: number;
      amenities: number;
      foodSupplies: number;
      cleaningSupplies: number;
    };
    equipment: {
      vehicles: number;
      cleaningEquipment: number;
      kitchenEquipment: number;
      maintenanceTools: number;
    };
    facilities: {
      rooms: number;
      meetingSpaces: number;
      recreationalAreas: number;
    };
  };
  costAnalysis: {
    currentLaborCosts: number;
    recommendedLaborCosts: number;
    resourceCosts: number;
    potentialSavings: number;
    roi: number;
  };
  efficiencyMetrics: {
    staffUtilization: number;
    customerSatisfaction: number;
    operationalEfficiency: number;
    costPerGuest: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const staffingAnalyticsSchema = new Schema<IStaffingAnalytics>({
  businessId: { type: String, required: true, index: true },
  businessType: {
    type: String,
    enum: ["hotel", "restaurant", "activity_provider", "transport"],
    required: true,
  },
  forecastPeriod: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  currentMetrics: {
    averageOccupancy: { type: Number, required: true, min: 0, max: 100 },
    averageRevenue: { type: Number, required: true, min: 0 },
    staffCount: { type: Number, required: true, min: 0 },
    operatingHours: { type: Number, required: true, min: 0 },
  },
  staffingRecommendations: {
    frontDesk: {
      currentStaff: { type: Number, default: 0 },
      recommendedStaff: { type: Number, default: 0 },
      peakHours: [String],
      skillsRequired: [String],
    },
    housekeeping: {
      currentStaff: { type: Number, default: 0 },
      recommendedStaff: { type: Number, default: 0 },
      workload: { type: Number, default: 0 },
      roomsPerHour: { type: Number, default: 0 },
    },
    foodService: {
      currentStaff: { type: Number, default: 0 },
      recommendedStaff: { type: Number, default: 0 },
      expectedCovers: { type: Number, default: 0 },
      shiftPattern: [String],
    },
    maintenance: {
      currentStaff: { type: Number, default: 0 },
      recommendedStaff: { type: Number, default: 0 },
      scheduledTasks: [String],
    },
  },
  resourcePlanning: {
    inventory: {
      linens: { type: Number, default: 0 },
      amenities: { type: Number, default: 0 },
      foodSupplies: { type: Number, default: 0 },
      cleaningSupplies: { type: Number, default: 0 },
    },
    equipment: {
      vehicles: { type: Number, default: 0 },
      cleaningEquipment: { type: Number, default: 0 },
      kitchenEquipment: { type: Number, default: 0 },
      maintenanceTools: { type: Number, default: 0 },
    },
    facilities: {
      rooms: { type: Number, default: 0 },
      meetingSpaces: { type: Number, default: 0 },
      recreationalAreas: { type: Number, default: 0 },
    },
  },
  costAnalysis: {
    currentLaborCosts: { type: Number, required: true, min: 0 },
    recommendedLaborCosts: { type: Number, required: true, min: 0 },
    resourceCosts: { type: Number, required: true, min: 0 },
    potentialSavings: { type: Number, default: 0 },
    roi: { type: Number, default: 0 },
  },
  efficiencyMetrics: {
    staffUtilization: { type: Number, default: 0, min: 0, max: 100 },
    customerSatisfaction: { type: Number, default: 0, min: 0, max: 100 },
    operationalEfficiency: { type: Number, default: 0, min: 0, max: 100 },
    costPerGuest: { type: Number, default: 0, min: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for better query performance
staffingAnalyticsSchema.index({ businessId: 1, createdAt: -1 });
staffingAnalyticsSchema.index({
  businessType: 1,
  "forecastPeriod.startDate": 1,
});

// Update the updatedAt field before saving
staffingAnalyticsSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const StaffingAnalytics = mongoose.model<IStaffingAnalytics>(
  "StaffingAnalytics",
  staffingAnalyticsSchema
);
