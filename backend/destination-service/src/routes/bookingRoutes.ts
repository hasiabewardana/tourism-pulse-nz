import { Router } from "express";
import {
  getBookings,
  getUserBookings,
  getOperatorBookings,
  getBookingById,
  addBooking,
  modifyBooking,
  removeBooking,
} from "../controllers/bookingController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET all bookings - admin only
router.get("/v1/bookings", authorize(["admin"]), getBookings);

// GET bookings by user ID - user only (their own)
router.get("/v1/users/:userId/bookings", authorize(["user"]), getUserBookings);

// GET bookings by operator ID - operator only (their own)
router.get(
  "/v1/operators/:operatorId/bookings",
  authorize(["operator"]),
  getOperatorBookings
);

// GET booking by ID - user/operator/admin with ownership check (in controller)
router.get("/v1/bookings/:id", getBookingById);

// POST new booking - user/operator
router.post("/v1/bookings", authorize(["user", "operator"]), addBooking);

// PUT update booking by ID - user/operator with ownership
router.put("/v1/bookings/:id", modifyBooking);

// DELETE booking by ID - user/operator with ownership
router.delete("/v1/bookings/:id", removeBooking);

export default router;
