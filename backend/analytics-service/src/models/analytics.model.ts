import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  destination_id: { type: Number, required: true },
  date: { type: Date, required: true },
  visitor_count: { type: Number, required: true },
  peak_time: String,
  created_at: { type: Date, default: Date.now },
});

export const Analytics = mongoose.model("visitor_analytics", analyticsSchema);
