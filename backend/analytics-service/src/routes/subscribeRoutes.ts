import { Router } from "express";
import {
  toggleSubscription,
  checkSubscription,
} from "../controllers/subscribeController";

const router = Router();

router.post("/v1/subscriptions", toggleSubscription);
router.get("/v1/subscriptions/check", checkSubscription);

export default router;
