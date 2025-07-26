import express from "express";
import { Analytics } from "../models/analytics.model";

const router = express.Router();

router.post("/analytics", async (req, res) => {
  try {
    const { destination_id, date, visitor_count, peak_time } = req.body;
    const analytic = new Analytics({
      destination_id,
      date,
      visitor_count,
      peak_time,
    });
    await analytic.save();
    res.status(201).json(analytic);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
