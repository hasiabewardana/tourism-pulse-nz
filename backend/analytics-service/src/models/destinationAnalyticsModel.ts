import mongoose from "mongoose";

/**
 * Destination Analytics Schema
 * Stores aggregated daily metrics for each destination
 * Used for reporting, trending, and performance monitoring
 */
const destinationAnalyticsSchema = new mongoose.Schema(
  {
    destinationId: {
      type: Number,
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    metrics: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      bookings: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      bookmarks: { type: Number, default: 0 },
      averageViewDuration: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      bounceRate: { type: Number, default: 0 },
    },
    demographics: {
      byRegion: mongoose.Schema.Types.Mixed,
      byDevice: mongoose.Schema.Types.Mixed,
    },
    hourlyDistribution: [
      {
        hour: Number,
        count: Number,
      },
    ],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timeseries: {
      timeField: "date",
      metaField: "destinationId",
      granularity: "hours",
    },
  }
);

// Unique index to prevent duplicate daily records
destinationAnalyticsSchema.index(
  { destinationId: 1, date: -1 },
  { unique: true }
);

export const DestinationAnalytics = mongoose.model(
  "DestinationAnalytics",
  destinationAnalyticsSchema
);
