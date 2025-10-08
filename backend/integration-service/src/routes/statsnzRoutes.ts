import { Router } from "express";
import { statsNZService } from "../services/statsnzService";

const router = Router();

// Initialize Stats NZ service
statsNZService.initialize();

// Get tourism arrival statistics
router.get("/tourism/arrivals/:region", async (req, res) => {
  try {
    const { region } = req.params;
    const data = await statsNZService.getTourismArrivals(region);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Stats NZ arrivals error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tourism arrivals",
    });
  }
});

// Get accommodation statistics
router.get("/tourism/accommodation/:region", async (req, res) => {
  try {
    const { region } = req.params;
    const data = await statsNZService.getAccommodationStats(region);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Stats NZ accommodation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch accommodation statistics",
    });
  }
});

// Get regional tourism trends
router.get("/tourism/trends/:region", async (req, res) => {
  try {
    const { region } = req.params;
    const months = parseInt(req.query.months as string) || 12;
    const data = await statsNZService.getRegionalTrends(region, months);
    res.json({ success: true, data });
  } catch (error: any) {
    console.error("Stats NZ trends error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch regional trends",
    });
  }
});

export default router;
