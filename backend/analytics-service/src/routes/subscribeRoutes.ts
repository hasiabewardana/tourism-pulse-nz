import { Router } from "express";
import {
  toggleSubscription,
  checkSubscription,
} from "../controllers/subscribeController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();
router.use(authenticate);

// Subscription routes for operators
router.post(
  "/v1/subscriptions",
  authorize(["operator", "admin"]),
  toggleSubscription
);
router.get(
  "/v1/subscriptions/check",
  authorize(["operator", "admin"]),
  checkSubscription
);

export default router;
