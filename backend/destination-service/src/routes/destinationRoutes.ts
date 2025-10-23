import { Router } from "express";
import {
  getDestinations,
  getDestinationById,
  addDestination,
  modifyDestination,
  removeDestination,
} from "../controllers/destinationController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Public access
router.get("/v1/destinations/public", getDestinations);
router.get("/v1/destinations/:id/public", getDestinationById);

// Protected routes
router.use(authenticate);

// Admin-only
router.get(
  "/v1/destinations",
  authorize(["public", "operator", "admin"]),
  getDestinations
);
router.get(
  "/v1/destinations/:id",
  authorize(["public", "operator", "admin"]),
  getDestinationById
);
router.post("/v1/destinations", authorize(["admin"]), addDestination);
router.put("/v1/destinations/:id", authorize(["admin"]), modifyDestination);
router.delete("/v1/destinations/:id", authorize(["admin"]), removeDestination);

export default router; // Export router for use in index.ts
