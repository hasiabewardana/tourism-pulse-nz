import { Router } from "express";
import {
  createPaymentIntentController,
  getPaymentStatus,
  getPaymentByBooking,
  getUserPayments,
  cancelPayment,
  refundPayment,
  getStripeConfig,
} from "../controllers/paymentController";
import { handleStripeWebhook } from "../controllers/webhookController";

const router = Router();

// Get Stripe configuration (publishable key)
router.get("/config", getStripeConfig);

// Create payment intent for a booking
router.post("/create-intent", createPaymentIntentController);

// Get payment status by payment intent ID
router.get("/:paymentIntentId/status", getPaymentStatus);

// Get payment by booking ID
router.get("/booking/:bookingId", getPaymentByBooking);

// Get all payments for a user
router.get("/user/:userId", getUserPayments);

// Cancel a payment
router.post("/:paymentIntentId/cancel", cancelPayment);

// Process refund
router.post("/refund", refundPayment);

// Stripe webhook endpoint (must use raw body)
router.post("/webhook", handleStripeWebhook);

export default router;
