import { Router } from "express";
import {
  getOperatorDashboard,
  getAdminDashboard,
} from "../controllers/dashboardController";

const router = Router();

router.get("/operator/:operatorId/dashboard", getOperatorDashboard);
router.get("/admin/dashboard", getAdminDashboard);

export default router;
