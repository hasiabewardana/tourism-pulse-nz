import { Request, Response } from "express";
import Stripe from "stripe";
import { constructWebhookEvent } from "../services/stripeService";
import {
  updatePaymentStatus,
  updateBookingPaymentStatus,
  getPaymentByIntentId,
} from "../models/paymentModel";

/**
 * Handle Stripe webhook events
 * POST /api/payments/webhook
 *
 * This endpoint receives real-time updates from Stripe about payment status changes
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  try {
    // Verify the webhook signature
    const event = constructWebhookEvent(
      req.body,
      signature as string,
      webhookSecret
    );

    console.log(`Webhook received: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.canceled":
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.processing":
        await handlePaymentProcessing(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({ error: "Webhook processing failed" });
  }
};

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentIntentId = paymentIntent.id;
    const paymentMethod = paymentIntent.payment_method as string | undefined;

    console.log(`Payment succeeded: ${paymentIntentId}`);

    // Update payment in database
    await updatePaymentStatus(paymentIntentId, "succeeded", paymentMethod, {
      stripeStatus: paymentIntent.status,
      receiptUrl: (paymentIntent as any).charges?.data?.[0]?.receipt_url,
    });

    // Get payment to find booking
    const payment = await getPaymentByIntentId(paymentIntentId);
    if (payment) {
      // Update booking status to confirmed and paid
      await updateBookingPaymentStatus(
        payment.booking_id,
        paymentIntentId,
        "paid",
        payment.amount,
        payment.currency,
        paymentMethod
      );

      // You could also trigger notifications here
      console.log(`Booking ${payment.booking_id} payment confirmed`);
    }
  } catch (error) {
    console.error("Error handling payment success:", error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentIntentId = paymentIntent.id;

    console.log(`Payment failed: ${paymentIntentId}`);

    // Update payment status
    await updatePaymentStatus(paymentIntentId, "failed", undefined, {
      failureReason: paymentIntent.last_payment_error?.message,
      failureCode: paymentIntent.last_payment_error?.code,
    });

    // Update booking
    const payment = await getPaymentByIntentId(paymentIntentId);
    if (payment) {
      await updateBookingPaymentStatus(
        payment.booking_id,
        paymentIntentId,
        "failed"
      );
    }
  } catch (error) {
    console.error("Error handling payment failure:", error);
    throw error;
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentIntentId = paymentIntent.id;

    console.log(`Payment canceled: ${paymentIntentId}`);

    await updatePaymentStatus(paymentIntentId, "canceled");

    const payment = await getPaymentByIntentId(paymentIntentId);
    if (payment) {
      await updateBookingPaymentStatus(
        payment.booking_id,
        paymentIntentId,
        "failed"
      );
    }
  } catch (error) {
    console.error("Error handling payment cancellation:", error);
    throw error;
  }
}

/**
 * Handle payment processing
 */
async function handlePaymentProcessing(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentIntentId = paymentIntent.id;

    console.log(`Payment processing: ${paymentIntentId}`);

    await updatePaymentStatus(paymentIntentId, "processing");

    const payment = await getPaymentByIntentId(paymentIntentId);
    if (payment) {
      await updateBookingPaymentStatus(
        payment.booking_id,
        paymentIntentId,
        "processing"
      );
    }
  } catch (error) {
    console.error("Error handling payment processing:", error);
    throw error;
  }
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    const paymentIntentId = charge.payment_intent as string;

    console.log(`Charge refunded for payment intent: ${paymentIntentId}`);

    if (paymentIntentId) {
      await updatePaymentStatus(paymentIntentId, "refunded", undefined, {
        refundAmount: charge.amount_refunded / 100,
        refunded: charge.refunded,
      });

      const payment = await getPaymentByIntentId(paymentIntentId);
      if (payment) {
        await updateBookingPaymentStatus(
          payment.booking_id,
          paymentIntentId,
          "refunded"
        );
      }
    }
  } catch (error) {
    console.error("Error handling refund:", error);
    throw error;
  }
}
