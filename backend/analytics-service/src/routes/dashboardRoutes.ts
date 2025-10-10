import { Router } from "express";
import {
  getOperatorDashboard,
  getAdminDashboard,
  triggerDataSync,
} from "../controllers/dashboardController";

const router = Router();

router.post("/sync", triggerDataSync);
router.get("/operator/:operatorId/dashboard", getOperatorDashboard);
router.get("/admin/dashboard", getAdminDashboard);

export default router;
