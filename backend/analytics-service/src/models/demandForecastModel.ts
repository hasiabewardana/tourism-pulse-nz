import mongoose, { Document, Schema } from "mongoose";

// Interface for demand forecast document
export interface IDemandForecast extends Document {
  region: string;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  forecastType: "daily" | "weekly" | "monthly" | "seasonal";
  predictedDemand: {
    accommodation: number;
    activities: number;
    transportation: number;
    restaurants: number;
  };
  confidenceInterval: {
    lower: number;
    upper: number;
    accuracy: number;
  };
  historicalData: Array<{
    date: Date;
    actualVisitors: number;
    bookings: number;
    revenue: number;
  }>;
  trends: {
    direction: "increasing" | "decreasing" | "stable";
    rate: number;
    seasonality: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const demandForecastSchema = new Schema<IDemandForecast>({
  region: { type: String, required: true, index: true },
  dateRange: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  forecastType: {
    type: String,
    enum: ["daily", "weekly", "monthly", "seasonal"],
    required: true,
  },
  predictedDemand: {
    accommodation: { type: Number, required: true, min: 0 },
    activities: { type: Number, required: true, min: 0 },
    transportation: { type: Number, required: true, min: 0 },
    restaurants: { type: Number, required: true, min: 0 },
  },
  confidenceInterval: {
    lower: { type: Number, required: true, min: 0, max: 100 },
    upper: { type: Number, required: true, min: 0, max: 100 },
    accuracy: { type: Number, required: true, min: 0, max: 100 },
  },
  historicalData: [
    {
      date: Date,
      actualVisitors: Number,
      bookings: Number,
      revenue: Number,
    },
  ],
  trends: {
    direction: {
      type: String,
      enum: ["increasing", "decreasing", "stable"],
      default: "stable",
    },
    rate: { type: Number, default: 0 },
    seasonality: [String],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for better query performance
demandForecastSchema.index({ region: 1, "dateRange.startDate": 1 });
demandForecastSchema.index({ forecastType: 1, createdAt: -1 });

// Update the updatedAt field before saving
demandForecastSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const DemandForecast = mongoose.model<IDemandForecast>(
  "DemandForecast",
  demandForecastSchema
);
