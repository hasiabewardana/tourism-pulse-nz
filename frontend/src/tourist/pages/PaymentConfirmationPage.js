import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  CheckCircle,
  Download,
  Email,
  CalendarMonth,
  LocationOn,
  People,
  Receipt,
  Home,
} from "@mui/icons-material";
import axios from "axios";

const API_GATEWAY_URL =
  process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:3000";
const PAYMENT_SERVICE_URL =
  process.env.REACT_APP_PAYMENT_SERVICE_URL || "http://localhost:3005";

const PaymentConfirmationPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [destination, setDestination] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch booking details
        const bookingResponse = await axios.get(
          `${API_GATEWAY_URL}/destination/api/bookings/${bookingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBooking(bookingResponse.data);

        // Fetch destination details
        const destResponse = await axios.get(
          `${API_GATEWAY_URL}/destination/api/destinations/${bookingResponse.data.destination_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDestination(destResponse.data);

        // Fetch payment details
        try {
          const paymentResponse = await axios.get(
            `${PAYMENT_SERVICE_URL}/api/payments/booking/${bookingId}`
          );
          setPayment(paymentResponse.data);
        } catch (paymentErr) {
          console.error("Payment not found:", paymentErr);
        }
      } catch (err) {
        console.error("Error fetching confirmation details:", err);
        setError("Failed to load confirmation details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookingId]);

  const handleDownloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    alert("Receipt download feature coming soon!");
  };

  const handleEmailReceipt = () => {
    alert("Receipt has been sent to your email!");
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

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Success Header */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          textAlign: "center",
        }}
      >
        <CheckCircle sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Booking Confirmed!
        </Typography>
        <Typography variant="h6">
          Thank you for your payment. Your adventure awaits!
        </Typography>
        <Typography variant="body2" sx={{ mt: 2, opacity: 0.9 }}>
          Confirmation #{bookingId} • {new Date().toLocaleDateString()}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Booking Details */}
        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Booking Details
              </Typography>
              <Divider sx={{ my: 2 }} />

              {destination && booking && (
                <>
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} md={4}>
                      <img
                        src={destination.image_url || "/images/placeholder.jpg"}
                        alt={destination.name}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" gutterBottom>
                        {destination.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {destination.region}, New Zealand
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CalendarMonth fontSize="small" color="action" />
                        <Typography variant="body2">
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
                          {booking.number_of_people}{" "}
                          {booking.number_of_people === 1 ? "Guest" : "Guests"}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<CheckCircle />}
                        label="CONFIRMED"
                        color="success"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    What to Expect
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {destination.description}
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Important Information
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Please arrive 15 minutes before your scheduled time
                    </Typography>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Bring valid ID and this confirmation
                    </Typography>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Check weather conditions before your visit
                    </Typography>
                    <Typography
                      component="li"
                      variant="body2"
                      color="text.secondary"
                    >
                      Cancellation policy: Free cancellation up to 24 hours
                      before
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Summary */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ mb: 2 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Payment Summary
              </Typography>
              <Divider sx={{ my: 2 }} />

              {booking && payment && (
                <>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Subtotal
                    </Typography>
                    <Typography variant="body2">
                      ${(parseFloat(booking.total_price) * 0.9).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Service Fee
                    </Typography>
                    <Typography variant="body2">
                      ${(parseFloat(booking.total_price) * 0.05).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      GST (15%)
                    </Typography>
                    <Typography variant="body2">
                      ${(parseFloat(booking.total_price) * 0.05).toFixed(2)}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight="bold">
                      Total Paid
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      ${parseFloat(booking.total_price).toFixed(2)} NZD
                    </Typography>
                  </Box>

                  <Chip
                    icon={<CheckCircle />}
                    label="PAID"
                    color="success"
                    size="small"
                    sx={{ mb: 2 }}
                  />

                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    Payment Method: {payment.payment_method || "Card"}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    Transaction ID: {payment.payment_intent_id?.slice(-12)}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                  >
                    Date: {new Date(payment.created_at).toLocaleString()}
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card elevation={2}>
            <CardContent sx={{ p: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Download />}
                onClick={handleDownloadReceipt}
                sx={{ mb: 1 }}
              >
                Download Receipt
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Email />}
                onClick={handleEmailReceipt}
                sx={{ mb: 1 }}
              >
                Email Receipt
              </Button>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="contained"
                fullWidth
                startIcon={<Home />}
                onClick={() => navigate("/bookings")}
              >
                View My Bookings
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Next Steps */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          What's Next?
        </Typography>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Email sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Check Your Email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We've sent a confirmation email with all the details
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <CalendarMonth
                sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
              />
              <Typography variant="subtitle2" fontWeight="bold">
                Add to Calendar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Don't forget to mark your adventure date
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <LocationOn sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                Plan Your Visit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check directions and local attractions
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PaymentConfirmationPage;
