import { Router } from "express";
import {
  assignOperator,
  getOperatorDestinations,
  getDestinationOperators,
  removeOperator,
} from "../controllers/operatorDestinationController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Protected routes
router.use(authenticate);

// Operator and Admin routes
router.post(
  "/v1/operator-destinations",
  authorize(["operator", "admin"]),
  assignOperator
);
router.get(
  "/v1/operator-destinations/operator/:userId",
  authorize(["operator", "admin"]),
  getOperatorDestinations
);
router.get(
  "/v1/operator-destinations/destination/:destinationId",
  authorize(["operator", "admin"]),
  getDestinationOperators
);
router.delete(
  "/v1/operator-destinations",
  authorize(["operator", "admin"]),
  removeOperator
);

export default router;
