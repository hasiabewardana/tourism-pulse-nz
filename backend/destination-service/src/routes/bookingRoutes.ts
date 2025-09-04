import { Router } from "express";
import {
  getBookings,
  getBookingById,
  addBooking,
  modifyBooking,
  removeBooking,
} from "../controllers/bookingController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

// Protected routes
router.use(authenticate);

// Admin-only
router.get("/v1/bookings", authorize(["operator", "admin"]), getBookings);
router.get("/v1/bookings/:id", authorize(["admin"]), getBookingById);
router.post("/v1/bookings", authorize(["admin"]), addBooking);
router.put("/v1/bookings/:id", authorize(["admin"]), modifyBooking);
router.delete("/v1/bookings/:id", authorize(["admin"]), removeBooking);

// Public/self-management
router.post("/v1/bookings/self", addBooking); // Requires userId from token

export default router; // Export router for use in index.ts
