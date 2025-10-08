import React, { useState, useEffect } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { initializeStripe, createPaymentIntent } from "../util/paymentService";

/**
 * Payment Form Component
 * This component handles the payment UI using Stripe Elements
 */
const CheckoutForm = ({ bookingId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required", // Handle payment in-page
      });

      if (error) {
        setErrorMessage(error.message);
        if (onError) onError(error);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        console.log("Payment succeeded:", paymentIntent.id);
        if (onSuccess) onSuccess(paymentIntent);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMessage("An unexpected error occurred");
      if (onError) onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-details">
        <h3>Payment Details</h3>
        <p className="amount">Amount: ${amount.toFixed(2)} NZD</p>
      </div>

      <div className="payment-element-container">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div
          className="error-message"
          style={{ color: "red", marginTop: "10px" }}
        >
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="pay-button"
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          backgroundColor: isProcessing ? "#ccc" : "#5469d4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontSize: "16px",
          cursor: isProcessing ? "not-allowed" : "pointer",
          width: "100%",
        }}
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)} NZD`}
      </button>

      <div
        className="test-card-info"
        style={{ marginTop: "20px", fontSize: "12px", color: "#666" }}
      >
        <p>
          <strong>Test Mode - Use test card:</strong>
        </p>
        <p>Card: 4242 4242 4242 4242</p>
        <p>Expiry: Any future date | CVC: Any 3 digits</p>
      </div>
    </form>
  );
};

/**
 * Payment Page Component
 * This is the main component that wraps the payment form with Stripe Elements
 */
const PaymentPage = ({
  bookingId,
  amount,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Initialize Stripe and create payment intent
    const initialize = async () => {
      try {
        // Initialize Stripe
        const stripe = await initializeStripe();
        setStripePromise(stripe);

        // Create payment intent
        const { clientSecret: secret } = await createPaymentIntent(
          bookingId,
          amount
        );
        setClientSecret(secret);
        setLoading(false);
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to initialize payment. Please try again.");
        setLoading(false);
      }
    };

    initialize();
  }, [bookingId, amount]);

  const handleSuccess = (paymentIntent) => {
    console.log("Payment successful!", paymentIntent);
    if (onPaymentSuccess) {
      onPaymentSuccess(paymentIntent);
    }
  };

  const handleError = (error) => {
    console.error("Payment failed:", error);
    if (onPaymentError) {
      onPaymentError(error);
    }
  };

  if (loading) {
    return (
      <div className="payment-loading">
        <p>Loading payment form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-error">
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#0570de",
      colorBackground: "#ffffff",
      colorText: "#30313d",
      colorDanger: "#df1b41",
      fontFamily: "system-ui, sans-serif",
      spacingUnit: "4px",
      borderRadius: "4px",
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div
      className="payment-page"
      style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}
    >
      <h2>Complete Your Booking Payment</h2>

      {stripePromise && clientSecret && (
        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm
            bookingId={bookingId}
            amount={amount}
            onSuccess={handleSuccess}
            onError={handleError}
          />
        </Elements>
      )}
    </div>
  );
};

export default PaymentPage;
