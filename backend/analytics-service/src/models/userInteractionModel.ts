import mongoose from "mongoose";

/**
 * User Interaction Schema
 * Tracks all user interactions with destinations for analytics and recommendations
 * Uses time-series collection for efficient time-based queries
 */
const userInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    destinationId: {
      type: Number,
      required: true,
      index: true,
    },
    interactionType: {
      type: String,
      enum: ["view", "click", "bookmark", "share", "search", "filter"],
      required: true,
      index: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    metadata: {
      device: String,
      browser: String,
      referrer: String,
      searchQuery: String,
      filters: mongoose.Schema.Types.Mixed,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 15552000, // Auto-delete after 180 days
    },
  },
  {
    timeseries: {
      timeField: "createdAt",
      metaField: "metadata",
      granularity: "seconds",
    },
  }
);

// Compound indexes for common queries
userInteractionSchema.index({ userId: 1, createdAt: -1 });
userInteractionSchema.index({ destinationId: 1, createdAt: -1 });
userInteractionSchema.index({ interactionType: 1, createdAt: -1 });

export const UserInteraction = mongoose.model(
  "UserInteraction",
  userInteractionSchema
);
