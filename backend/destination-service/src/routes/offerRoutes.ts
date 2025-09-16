import { Router } from "express";
import {
  createOffer,
  getAllOffers,
  getOffersByOperator,
  updateOffer,
  deleteOffer,
} from "../controllers/offerController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Protected routes
router.use(authenticate);

// Operator or Admin: Create a new offer
router.post("/v1/offers", authorize(["operator", "admin"]), createOffer);

// Public/Admin: List all offers (UPDATED: supports ?destination_id=<id> for optional filtering/ordering)
router.get("/v1/offers", authorize(["public", "admin"]), getAllOffers);

// Operator or Admin: List offers for a specific operator
router.get(
  "/v1/offers/operator/:operatorId",
  authorize(["operator", "admin"]),
  getOffersByOperator
);

// Operator or Admin: Update an offer
router.put("/v1/offers/:id", authorize(["operator", "admin"]), updateOffer);

// Operator or Admin: Delete an offer
router.delete("/v1/offers/:id", authorize(["operator", "admin"]), deleteOffer);

export default router;
