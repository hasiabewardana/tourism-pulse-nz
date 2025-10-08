import mongoose from "mongoose";

/**
 * Search Analytics Schema
 * Tracks search queries for improving search functionality and recommendations
 */
const searchAnalyticsSchema = new mongoose.Schema(
  {
    userId: Number,
    searchQuery: {
      type: String,
      required: true,
      text: true,
    },
    filters: {
      regions: [String],
      categories: [String],
      priceRange: String,
      rating: Number,
      tags: [String],
      dateRange: {
        start: Date,
        end: Date,
      },
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    clickedResults: [
      {
        destinationId: Number,
        position: Number,
        timestamp: Date,
      },
    ],
    noResultsFound: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timeseries: {
      timeField: "timestamp",
      metaField: "userId",
      granularity: "seconds",
    },
  }
);

// Text index for search query analysis
searchAnalyticsSchema.index({ searchQuery: "text" });
searchAnalyticsSchema.index({ timestamp: -1 });
searchAnalyticsSchema.index({ noResultsFound: 1 });

export const SearchAnalytics = mongoose.model(
  "SearchAnalytics",
  searchAnalyticsSchema
);
