import React, { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Box,
  Button,
  CircularProgress,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Lock, CreditCard } from "@mui/icons-material";

const PaymentForm = ({ bookingId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!agreeToTerms) {
      setMessage("Please agree to the terms and conditions");
      return;
    }

    setIsProcessing(true);
    setMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings/${bookingId}/confirmation`,
        },
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message);
        onError(error.message);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setMessage("Payment successful!");
        onSuccess();
      } else if (paymentIntent) {
        setMessage(`Payment ${paymentIntent.status}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      setMessage("An unexpected error occurred");
      onError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box mb={3}>
        <PaymentElement
          options={{
            layout: {
              type: "tabs",
              defaultCollapsed: false,
            },
          }}
        />
      </Box>

      {message && (
        <Alert
          severity={message.includes("successful") ? "success" : "error"}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      <Box mb={3}>
        <FormControlLabel
          control={
            <Checkbox
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2" color="text.secondary">
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                terms and conditions
              </a>{" "}
              and{" "}
              <a href="/privacy" target="_blank" rel="noopener noreferrer">
                privacy policy
              </a>
            </Typography>
          }
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={!stripe || !elements || isProcessing || !agreeToTerms}
        startIcon={isProcessing ? <CircularProgress size={20} /> : <Lock />}
        sx={{
          py: 1.5,
          fontSize: "1.1rem",
          fontWeight: "bold",
          textTransform: "none",
        }}
      >
        {isProcessing ? "Processing..." : `Pay $${amount?.toFixed(2)} NZD`}
      </Button>

      <Box display="flex" alignItems="center" justifyContent="center" mt={2}>
        <Lock fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary">
          Secured by Stripe • Your payment information is encrypted
        </Typography>
      </Box>
    </form>
  );
};

export default PaymentForm;
