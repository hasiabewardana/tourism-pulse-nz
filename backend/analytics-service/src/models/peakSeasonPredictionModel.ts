import mongoose, { Document, Schema } from "mongoose";

// Interface for peak season prediction document
export interface IPeakSeasonPrediction extends Document {
  region: string;
  year: number;
  peakSeasons: Array<{
    name: string;
    startDate: Date;
    endDate: Date;
    intensity: "low" | "medium" | "high" | "extreme";
    predictedVisitors: number;
    confidenceLevel: number;
    factors: string[];
  }>;
  seasonalPatterns: {
    summer: { months: number[]; intensity: number };
    winter: { months: number[]; intensity: number };
    spring: { months: number[]; intensity: number };
    autumn: { months: number[]; intensity: number };
  };
  specialEvents: Array<{
    name: string;
    date: Date;
    impact: number;
    category: string;
  }>;
  weatherFactors: {
    averageTemperature: number;
    rainfallPrediction: number;
    weatherQuality: number;
  };
  economicFactors: {
    exchangeRate: number;
    economicClimate: string;
    travelCostIndex: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schema definition
const peakSeasonPredictionSchema = new Schema<IPeakSeasonPrediction>({
  region: { type: String, required: true, index: true },
  year: { type: Number, required: true, index: true },
  peakSeasons: [
    {
      name: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      intensity: {
        type: String,
        enum: ["low", "medium", "high", "extreme"],
        required: true,
      },
      predictedVisitors: { type: Number, required: true, min: 0 },
      confidenceLevel: { type: Number, required: true, min: 0, max: 100 },
      factors: [String],
    },
  ],
  seasonalPatterns: {
    summer: {
      months: [{ type: Number, min: 1, max: 12 }],
      intensity: { type: Number, min: 0, max: 100 },
    },
    winter: {
      months: [{ type: Number, min: 1, max: 12 }],
      intensity: { type: Number, min: 0, max: 100 },
    },
    spring: {
      months: [{ type: Number, min: 1, max: 12 }],
      intensity: { type: Number, min: 0, max: 100 },
    },
    autumn: {
      months: [{ type: Number, min: 1, max: 12 }],
      intensity: { type: Number, min: 0, max: 100 },
    },
  },
  specialEvents: [
    {
      name: String,
      date: Date,
      impact: { type: Number, min: 0, max: 100 },
      category: String,
    },
  ],
  weatherFactors: {
    averageTemperature: Number,
    rainfallPrediction: Number,
    weatherQuality: { type: Number, min: 0, max: 100 },
  },
  economicFactors: {
    exchangeRate: Number,
    economicClimate: {
      type: String,
      enum: ["poor", "fair", "good", "excellent"],
      default: "fair",
    },
    travelCostIndex: Number,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for better query performance
peakSeasonPredictionSchema.index({ region: 1, year: 1 }, { unique: true });
peakSeasonPredictionSchema.index({ "peakSeasons.startDate": 1 });

// Update the updatedAt field before saving
peakSeasonPredictionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const PeakSeasonPrediction = mongoose.model<IPeakSeasonPrediction>(
  "PeakSeasonPrediction",
  peakSeasonPredictionSchema
);
