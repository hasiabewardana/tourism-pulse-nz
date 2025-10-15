import { Router } from "express";
import { healthCheck } from "../controllers/healthController";

const router = Router();

router.get("/v1/health", healthCheck);

export default router;
