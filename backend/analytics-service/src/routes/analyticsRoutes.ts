import { Router } from "express";
import { createAnalytics } from "../controllers/analyticsController";
import forecastController from "../controllers/forecastController";
import staffingController from "../controllers/staffingController";

const router = Router();

// Original analytics route
router.post("/v1/analytics", createAnalytics);

// Demand Forecasting Routes
router.post(
  "/v1/forecast/demand",
  forecastController.generateDemandForecast.bind(forecastController)
);
router.get(
  "/v1/forecast/peaks/:region/:year",
  forecastController.getPeakSeasonForecast.bind(forecastController)
);
router.get(
  "/v1/forecast/trends",
  forecastController.getDemandTrends.bind(forecastController)
);
router.get(
  "/v1/forecast/accuracy",
  forecastController.getForecastAccuracy.bind(forecastController)
);

// Staffing Analytics Routes
router.post(
  "/v1/staffing/recommendations",
  staffingController.generateStaffingRecommendations.bind(staffingController)
);
router.get(
  "/v1/staffing/optimization/:businessId",
  staffingController.getStaffingOptimization.bind(staffingController)
);
router.get(
  "/v1/staffing/history/:businessId",
  staffingController.getStaffingHistory.bind(staffingController)
);
router.post(
  "/v1/staffing/compare",
  staffingController.compareStaffingScenarios.bind(staffingController)
);

// Resource Planning Routes
router.get(
  "/v1/resources/utilization/:businessId",
  staffingController.getResourceUtilization.bind(staffingController)
);

export default router;
