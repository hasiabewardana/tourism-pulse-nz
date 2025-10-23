import { Request, Response } from "express";
import { z } from "zod";
import {
  createPaymentIntent,
  retrievePaymentIntent,
  cancelPaymentIntent,
  createRefund,
} from "../services/stripeService";
import {
  createPayment,
  getPaymentByBookingId,
  getPaymentByIntentId,
  updatePaymentStatus,
  updateBookingPaymentStatus,
  getBookingById,
  getPaymentsByUserId,
} from "../models/paymentModel";

// Validation schemas
const createPaymentIntentSchema = z.object({
  bookingId: z.number().min(1),
  amount: z.number().min(0.5), // Minimum $0.50
  currency: z.string().default("nzd"),
  metadata: z.record(z.string(), z.string()).optional(),
});

const refundSchema = z.object({
  paymentIntentId: z.string(),
  amount: z.number().min(0).optional(), // Optional for partial refunds
  reason: z.string().optional(),
});

/**
 * Map Stripe payment intent status to database status
 */
const mapStripeStatusToDb = (stripeStatus: string): string => {
  const statusMap: Record<string, string> = {
    requires_payment_method: "pending",
    requires_confirmation: "pending",
    requires_action: "processing",
    processing: "processing",
    requires_capture: "processing",
    canceled: "canceled",
    succeeded: "succeeded",
  };

  return statusMap[stripeStatus] || "pending";
};

/**
 * Create a payment intent for a booking
 * POST /api/payments/create-intent
 */
export const createPaymentIntentController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = createPaymentIntentSchema.parse(req.body);

    // Verify booking exists and get details
    const booking = await getBookingById(data.bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check if payment already exists for this booking
    const existingPayment = await getPaymentByBookingId(data.bookingId);
    if (existingPayment && existingPayment.status === "succeeded") {
      return res.status(400).json({
        error: "Payment already completed for this booking",
        payment: existingPayment,
      });
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(
      data.bookingId,
      data.amount,
      data.currency,
      {
        userId: booking.user_id?.toString(),
        destinationId: booking.destination_id?.toString(),
        ...data.metadata,
      }
    );

    // Save payment record in database with mapped status
    const dbStatus = mapStripeStatusToDb(paymentIntent.status);
    const payment = await createPayment(
      data.bookingId,
      paymentIntent.id,
      data.amount,
      data.currency.toUpperCase(),
      dbStatus
    );

    // Update booking with payment intent (use 'processing' as payment is being initiated)
    await updateBookingPaymentStatus(
      data.bookingId,
      paymentIntent.id,
      "processing",
      data.amount,
      data.currency.toUpperCase()
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      payment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error("Error creating payment intent:", error);
    console.error(
      "Error details:",
      error instanceof Error ? error.message : error
    );
    console.error("Stack trace:", error instanceof Error ? error.stack : "");
    res.status(500).json({
      error: "Failed to create payment intent",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get payment status
 * GET /api/payments/:paymentIntentId/status
 */
export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    // Get from Stripe
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);

    // Get from database
    const payment = await getPaymentByIntentId(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // Convert cents to dollars
      currency: paymentIntent.currency,
      payment_method: paymentIntent.payment_method,
      created: paymentIntent.created,
      payment,
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    res.status(500).json({ error: "Failed to retrieve payment status" });
  }
};

/**
 * Get payment by booking ID
 * GET /api/payments/booking/:bookingId
 */
export const getPaymentByBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.bookingId, 10);
    const payment = await getPaymentByBookingId(bookingId);

    if (!payment) {
      return res
        .status(404)
        .json({ error: "Payment not found for this booking" });
    }

    res.json(payment);
  } catch (error) {
    console.error("Error getting payment:", error);
    res.status(500).json({ error: "Failed to retrieve payment" });
  }
};

/**
 * Get all payments for a user
 * GET /api/payments/user/:userId
 */
export const getUserPayments = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const payments = await getPaymentsByUserId(userId);
    res.json(payments);
  } catch (error) {
    console.error("Error getting user payments:", error);
    res.status(500).json({ error: "Failed to retrieve payments" });
  }
};

/**
 * Cancel a payment intent
 * POST /api/payments/:paymentIntentId/cancel
 */
export const cancelPayment = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    // Cancel in Stripe
    const paymentIntent = await cancelPaymentIntent(paymentIntentId);

    // Update in database
    await updatePaymentStatus(paymentIntentId, "canceled");

    // Update booking status
    const payment = await getPaymentByIntentId(paymentIntentId);
    if (payment) {
      await updateBookingPaymentStatus(
        payment.booking_id,
        paymentIntentId,
        "failed"
      );
    }

    res.json({
      message: "Payment canceled successfully",
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error("Error canceling payment:", error);
    res.status(500).json({ error: "Failed to cancel payment" });
  }
};

/**
 * Create a refund
 * POST /api/payments/refund
 */
export const refundPayment = async (req: Request, res: Response) => {
  try {
    const data = refundSchema.parse(req.body);

    // Get payment from database
    const payment = await getPaymentByIntentId(data.paymentIntentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.status !== "succeeded") {
      return res.status(400).json({
        error: "Can only refund successful payments",
        currentStatus: payment.status,
      });
    }

    // Create refund in Stripe
    const refund = await createRefund(data.paymentIntentId, data.amount);

    // Update payment status
    await updatePaymentStatus(data.paymentIntentId, "refunded", undefined, {
      refundId: refund.id,
      refundReason: data.reason,
    });

    // Update booking
    await updateBookingPaymentStatus(
      payment.booking_id,
      data.paymentIntentId,
      "refunded"
    );

    res.json({
      message: "Refund processed successfully",
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        currency: refund.currency,
        status: refund.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error("Error processing refund:", error);
    res.status(500).json({ error: "Failed to process refund" });
  }
};

/**
 * Get Stripe publishable key (for frontend)
 * GET /api/payments/config
 */
export const getStripeConfig = async (req: Request, res: Response) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    currency: process.env.DEFAULT_CURRENCY || "nzd",
  });
};
