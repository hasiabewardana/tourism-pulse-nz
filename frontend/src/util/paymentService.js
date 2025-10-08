// Stripe Payment Integration Utility
// This file provides functions to integrate Stripe payments in the frontend

import { loadStripe } from "@stripe/stripe-js";

let stripePromise = null;

/**
 * Initialize Stripe with publishable key
 * Call this once when your app loads
 */
export const initializeStripe = async () => {
  if (!stripePromise) {
    try {
      // Fetch the publishable key from your payment service
      const response = await fetch("http://localhost:3005/api/payments/config");
      const { publishableKey } = await response.json();

      if (!publishableKey) {
        throw new Error("Stripe publishable key not found");
      }

      stripePromise = loadStripe(publishableKey);
    } catch (error) {
      console.error("Failed to initialize Stripe:", error);
      throw error;
    }
  }
  return stripePromise;
};

/**
 * Get Stripe instance
 */
export const getStripe = () => stripePromise;

/**
 * Create a payment intent for a booking
 * @param {number} bookingId - The booking ID
 * @param {number} amount - Amount in dollars
 * @param {string} currency - Currency code (default: nzd)
 * @returns {Promise<{clientSecret: string, paymentIntentId: string}>}
 */
export const createPaymentIntent = async (
  bookingId,
  amount,
  currency = "nzd"
) => {
  try {
    const response = await fetch(
      "http://localhost:3005/api/payments/create-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          amount,
          currency,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create payment intent");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

/**
 * Get payment status by payment intent ID
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @returns {Promise<Object>} Payment status details
 */
export const getPaymentStatus = async (paymentIntentId) => {
  try {
    const response = await fetch(
      `http://localhost:3005/api/payments/${paymentIntentId}/status`
    );

    if (!response.ok) {
      throw new Error("Failed to get payment status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting payment status:", error);
    throw error;
  }
};

/**
 * Get payment for a booking
 * @param {number} bookingId - The booking ID
 * @returns {Promise<Object>} Payment details
 */
export const getBookingPayment = async (bookingId) => {
  try {
    const response = await fetch(
      `http://localhost:3005/api/payments/booking/${bookingId}`
    );

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 404) {
        return null; // No payment found
      }
      throw new Error(error.error || "Failed to get payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting booking payment:", error);
    throw error;
  }
};

/**
 * Cancel a payment
 * @param {string} paymentIntentId - Stripe Payment Intent ID
 * @returns {Promise<Object>} Cancellation result
 */
export const cancelPayment = async (paymentIntentId) => {
  try {
    const response = await fetch(
      `http://localhost:3005/api/payments/${paymentIntentId}/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to cancel payment");
    }

    return await response.json();
  } catch (error) {
    console.error("Error canceling payment:", error);
    throw error;
  }
};

/**
 * Test card numbers for development
 */
export const TEST_CARDS = {
  SUCCESS: {
    number: "4242424242424242",
    description: "Successful payment",
  },
  DECLINE: {
    number: "4000000000000002",
    description: "Card declined",
  },
  INSUFFICIENT_FUNDS: {
    number: "4000000000009995",
    description: "Insufficient funds",
  },
  EXPIRED: {
    number: "4000000000000069",
    description: "Expired card",
  },
  PROCESSING_ERROR: {
    number: "4000000000000119",
    description: "Processing error",
  },
  "3D_SECURE": {
    number: "4000002500003155",
    description: "3D Secure authentication required",
  },
};

// You can use any future date for expiry and any 3-digit CVC
export const TEST_CARD_DETAILS = {
  expiry: "12/34",
  cvc: "123",
  zip: "12345",
};
