import mongoose from "mongoose"; // Import Mongoose for MongoDB interaction

// Define the schema for visitor analytics data
const analyticsSchema = new mongoose.Schema({
  destination_id: { type: Number, required: true }, // Unique identifier for the destination
  date: { type: Date, required: true }, // Date of the analytics data
  visitor_count: { type: Number, required: true }, // Number of visitors recorded
  peak_time: String, // Optional field for peak visitor time
  created_at: { type: Date, default: Date.now }, // Automatically set creation timestamp
});

// Create and export the Mongoose model based on the schema
export const Analytics = mongoose.model("visitor_analytics", analyticsSchema);
