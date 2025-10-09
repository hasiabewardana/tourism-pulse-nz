import express from "express";
import {
  getOperatorDashboard,
  getDestinationPerformance,
  getRevenueBreakdown,
  getAdminDashboard,
  getOperatorPerformance,
} from "../controllers/realAnalyticsController";

const router = express.Router();

router.get("/operator/:operatorId/dashboard", getOperatorDashboard);
router.get("/operator/:operatorId/destinations", getDestinationPerformance);
router.get("/operator/:operatorId/revenue", getRevenueBreakdown);

router.get("/admin/dashboard", getAdminDashboard);
router.get("/admin/operators", getOperatorPerformance);

export default router;
