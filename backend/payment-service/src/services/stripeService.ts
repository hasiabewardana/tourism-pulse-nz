import Stripe from "stripe";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
  typescript: true,
});

/**
 * Create a Payment Intent for a booking
 * @param bookingId - The ID of the booking
 * @param amount - Amount in dollars (will be converted to cents)
 * @param currency - Currency code (default: nzd)
 * @param metadata - Additional metadata to attach
 */
export const createPaymentIntent = async (
  bookingId: number,
  amount: number,
  currency: string = "nzd",
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert dollars to cents
      currency: currency.toLowerCase(),
      metadata: {
        bookingId: bookingId.toString(),
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log(
      `Payment Intent created: ${paymentIntent.id} for booking ${bookingId}`
    );
    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

/**
 * Retrieve a Payment Intent by ID
 * @param paymentIntentId - The Stripe Payment Intent ID
 */
export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error("Error retrieving payment intent:", error);
    throw error;
  }
};

/**
 * Cancel a Payment Intent
 * @param paymentIntentId - The Stripe Payment Intent ID
 */
export const cancelPaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  try {
    return await stripe.paymentIntents.cancel(paymentIntentId);
  } catch (error) {
    console.error("Error canceling payment intent:", error);
    throw error;
  }
};

/**
 * Create a refund for a payment
 * @param paymentIntentId - The Stripe Payment Intent ID
 * @param amount - Amount to refund in dollars (optional, full refund if not specified)
 */
export const createRefund = async (
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.Refund> => {
  try {
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundParams);
    console.log(
      `Refund created: ${refund.id} for payment intent ${paymentIntentId}`
    );
    return refund;
  } catch (error) {
    console.error("Error creating refund:", error);
    throw error;
  }
};

/**
 * Verify Stripe webhook signature
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 * @param secret - Webhook secret
 */
export const constructWebhookEvent = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    throw error;
  }
};

/**
 * Create a Stripe Customer (optional, for repeat customers)
 * @param email - Customer email
 * @param name - Customer name
 * @param metadata - Additional metadata
 */
export const createCustomer = async (
  email: string,
  name?: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> => {
  try {
    return await stripe.customers.create({
      email,
      name,
      metadata,
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
};

export default stripe;
