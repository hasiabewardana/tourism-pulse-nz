import { Request, Response } from "express"; // Import Express types
import { Analytics } from "../models/analyticsModel"; // Import Analytics model

// Handle creation of new analytics data
export const createAnalytics = async (req: Request, res: Response) => {
  try {
    const { destination_id, date, visitor_count, peak_time } = req.body; // Extract data from request body
    const analytic = new Analytics({
      // Create new analytics instance
      destination_id,
      date,
      visitor_count,
      peak_time,
    });
    await analytic.save(); // Save to MongoDB
    res.status(201).json(analytic); // Return created analytic with 201 status
  } catch (err) {
    res.status(500).json({ error: "Internal server error" }); // Handle any errors with 500 status
  }
};
