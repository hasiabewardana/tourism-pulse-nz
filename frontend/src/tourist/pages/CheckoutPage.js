import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Button,
} from "@mui/material";
import {
  CalendarMonth,
  LocationOn,
  People,
  AttachMoney,
  CheckCircle,
  ArrowBack,
} from "@mui/icons-material";
import PaymentForm from "../components/PaymentForm";
import axios from "axios";

const API_GATEWAY_URL =
  process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:3000";
const PAYMENT_SERVICE_URL =
  process.env.REACT_APP_PAYMENT_SERVICE_URL || "http://localhost:3005";

// Initialize Stripe
let stripePromise = null;

const CheckoutPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [destination, setDestination] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");

  // Initialize Stripe publishable key
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const response = await axios.get(
          `${PAYMENT_SERVICE_URL}/api/payments/config`
        );
        const { publishableKey } = response.data;
        stripePromise = loadStripe(publishableKey);
      } catch (err) {
        console.error("Failed to load Stripe config:", err);
        setError("Failed to initialize payment system");
      }
    };
    initializeStripe();
  }, []);

  // Fetch booking details
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch booking
        const bookingResponse = await axios.get(
          `${API_GATEWAY_URL}/dest/api/v1/bookings/${bookingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log("Booking response:", bookingResponse.data);
        setBooking(bookingResponse.data);

        // Try to load destination details for display, but it's optional
        const destinationId = bookingResponse.data.destination_id;

        if (destinationId) {
          try {
            const destResponse = await axios.get(
              `${API_GATEWAY_URL}/dest/api/v1/destinations/${destinationId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            setDestination(destResponse.data);
          } catch (destErr) {
            console.warn(
              "Could not fetch destination details, proceeding with booking info only"
            );
          }
        }

        // Use booking's destination name as fallback if available
        if (!destination && bookingResponse.data.destination_name) {
          setDestination({
            name: bookingResponse.data.destination_name,
            region: "New Zealand",
            image_url: null,
          });
        }

        // Get price from either total_price or price field
        const bookingPrice =
          bookingResponse.data.total_price || bookingResponse.data.price;

        // Check if booking has a valid price
        if (!bookingPrice || parseFloat(bookingPrice) <= 0) {
          setError(
            "Booking does not have a valid price. Please contact support."
          );
          setLoading(false);
          return;
        }

        // Check if payment already exists
        if (bookingResponse.data.payment_status === "paid") {
          setPaymentStatus("completed");
          setError("This booking has already been paid.");
          setLoading(false);
          return;
        }

        // Create payment intent if not already created
        if (!bookingResponse.data.payment_intent_id) {
          const paymentResponse = await axios.post(
            `${PAYMENT_SERVICE_URL}/api/payments/create-intent`,
            {
              bookingId: parseInt(bookingId),
              amount: parseFloat(bookingPrice),
              currency: "nzd",
              metadata: {
                destinationName:
                  destination?.name ||
                  bookingResponse.data.destination_name ||
                  "Unknown Destination",
                bookingDate: bookingResponse.data.booking_date,
              },
            }
          );

          setClientSecret(paymentResponse.data.clientSecret);
          setPaymentIntentId(paymentResponse.data.paymentIntentId);
        } else {
          // Payment intent already exists, retrieve it
          try {
            const existingPayment = await axios.get(
              `${PAYMENT_SERVICE_URL}/api/payments/booking/${bookingId}`
            );

            if (existingPayment.data.status === "succeeded") {
              setPaymentStatus("completed");
            } else {
              // Need to create a new payment intent or retrieve the existing one
              const paymentResponse = await axios.post(
                `${PAYMENT_SERVICE_URL}/api/payments/create-intent`,
                {
                  bookingId: parseInt(bookingId),
                  amount: parseFloat(bookingPrice),
                  currency: "nzd",
                }
              );
              setClientSecret(paymentResponse.data.clientSecret);
              setPaymentIntentId(paymentResponse.data.paymentIntentId);
            }
          } catch (err) {
            // If payment not found, create new one
            const paymentResponse = await axios.post(
              `${PAYMENT_SERVICE_URL}/api/payments/create-intent`,
              {
                bookingId: parseInt(bookingId),
                amount: parseFloat(bookingPrice),
                currency: "nzd",
              }
            );
            setClientSecret(paymentResponse.data.clientSecret);
            setPaymentIntentId(paymentResponse.data.paymentIntentId);
          }
        }
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError(err.response?.data?.error || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handlePaymentSuccess = () => {
    setPaymentStatus("completed");
    setTimeout(() => {
      navigate(`/tourist/bookings/${bookingId}/confirmation`);
    }, 2000);
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setPaymentStatus("failed");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error && paymentStatus !== "completed") {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/tourist/bookings")}
          variant="outlined"
        >
          Back to Bookings
        </Button>
      </Container>
    );
  }

  if (paymentStatus === "completed") {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Payment Successful!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your booking has been confirmed and payment processed successfully.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/tourist/bookings")}
            sx={{ mt: 2 }}
          >
            View My Bookings
          </Button>
        </Paper>
      </Container>
    );
  }

  const appearance = {
    theme: "stripe",
    variables: {
      colorPrimary: "#1976d2",
      colorBackground: "#ffffff",
      colorText: "#30313d",
      colorDanger: "#df1b41",
      fontFamily: "Roboto, sans-serif",
      spacingUnit: "4px",
      borderRadius: "8px",
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/tourist/bookings`)}
          sx={{ mb: 2 }}
        >
          Back to Bookings
        </Button>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Complete Your Payment
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Secure checkout powered by Stripe
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Booking Summary */}
        <Grid item xs={12} md={5}>
          <Card elevation={2} sx={{ position: "sticky", top: 80 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Booking Summary
              </Typography>
              <Divider sx={{ my: 2 }} />

              {destination && (
                <>
                  <Box mb={2}>
                    <img
                      src={destination.image_url || "/images/placeholder.jpg"}
                      alt={destination.name}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {destination.name}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {destination.region}, New Zealand
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {!destination && booking?.offer_name && (
                <>
                  <Typography variant="h6" gutterBottom>
                    {booking.offer_name}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </>
              )}

              {booking && (
                <>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CalendarMonth fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Date:</strong>{" "}
                      {new Date(booking.booking_date).toLocaleDateString(
                        "en-NZ",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <People fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Guests:</strong>{" "}
                      {booking.visitor_count || booking.number_of_people}{" "}
                      {(booking.visitor_count || booking.number_of_people) === 1
                        ? "person"
                        : "people"}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Chip
                      label={booking.status.toUpperCase()}
                      size="small"
                      color={
                        booking.status === "confirmed" ? "success" : "warning"
                      }
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Price Breakdown */}
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Base Price (
                        {booking.visitor_count || booking.number_of_people}{" "}
                        guests)
                      </Typography>
                      <Typography variant="body2">
                        $
                        {((booking.total_price || booking.price) * 0.9).toFixed(
                          2
                        )}{" "}
                        NZD
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Service Fee
                      </Typography>
                      <Typography variant="body2">
                        $
                        {(
                          (booking.total_price || booking.price) * 0.05
                        ).toFixed(2)}{" "}
                        NZD
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                      <Typography variant="body2" color="text.secondary">
                        GST (15%)
                      </Typography>
                      <Typography variant="body2">
                        $
                        {(
                          (booking.total_price || booking.price) * 0.05
                        ).toFixed(2)}{" "}
                        NZD
                      </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6" fontWeight="bold">
                        Total Amount
                      </Typography>
                      <Box textAlign="right">
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color="primary"
                        >
                          $
                          {parseFloat(
                            booking.total_price || booking.price
                          ).toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          NZD
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="caption">
                  Your payment is secured with 256-bit SSL encryption
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Form */}
        <Grid item xs={12} md={7}>
          <Paper elevation={2} sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Payment Details
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Enter your card details to complete the payment
            </Typography>

            <Divider sx={{ my: 3 }} />

            {clientSecret && stripePromise ? (
              <Elements stripe={stripePromise} options={options}>
                <PaymentForm
                  bookingId={bookingId}
                  amount={parseFloat(booking?.total_price || booking?.price)}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            ) : (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Test Card Info */}
            <Alert severity="info" icon={false}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Test Card for Demo
              </Typography>
              <Typography variant="caption" display="block">
                Card Number: 4242 4242 4242 4242
              </Typography>
              <Typography variant="caption" display="block">
                Expiry: Any future date
              </Typography>
              <Typography variant="caption" display="block">
                CVC: Any 3 digits
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CheckoutPage;
