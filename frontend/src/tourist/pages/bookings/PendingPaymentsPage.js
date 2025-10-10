import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import {
  CalendarMonth,
  People,
  Payment,
  AttachMoney,
} from "@mui/icons-material";
import { useAuth } from "../../../shared/context/AuthContext";
import axios from "axios";
import classes from "./PendingPaymentsPage.module.css";

function PendingPaymentsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = isAuthenticated ? localStorage.getItem("token") : null;
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }
    fetchPendingBookings();
  }, [token]);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `http://localhost:3000/dest/api/v1/users/${userId}/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const now = new Date();
      const pending = res.data.filter(
        (b) =>
          b.status === "pending" &&
          (!b.payment_status || b.payment_status === "unpaid") &&
          new Date(b.booking_date) > now
      );

      setPendingBookings(pending);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (bookingId) => {
    if (!bookingId) {
      console.error("Invalid booking ID:", bookingId);
      setError("Invalid booking. Please refresh and try again.");
      return;
    }
    console.log("Navigating to checkout for booking:", bookingId);
    navigate(`/tourist/checkout/${bookingId}`);
  };

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container className={classes.container}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className={classes.container}>
      <Typography variant="h4" className={classes.title}>
        Pending Payments
      </Typography>

      {pendingBookings.length === 0 ? (
        <Box className={classes.emptyState}>
          <Payment className={classes.emptyIcon} />
          <Typography variant="h6" className={classes.emptyText}>
            No pending payments
          </Typography>
          <Typography variant="body2" className={classes.emptySubtext}>
            All your bookings are paid or you have no pending bookings.
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body1" className={classes.subtitle}>
            You have {pendingBookings.length} booking
            {pendingBookings.length > 1 ? "s" : ""} waiting for payment
          </Typography>

          <Grid container spacing={3} className={classes.grid}>
            {pendingBookings.map((booking) => (
              <Grid item xs={12} sm={6} md={4} key={booking.booking_id}>
                <Card className={classes.card}>
                  <Box className={classes.cardHeader}>
                    <Chip
                      label="Payment Required"
                      className={classes.statusChip}
                      color="warning"
                    />
                  </Box>
                  <CardContent>
                    <Typography variant="h6" className={classes.offerName}>
                      {booking.offer_name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      className={classes.description}
                    >
                      {booking.offer_description}
                    </Typography>

                    <Box className={classes.infoRow}>
                      <CalendarMonth className={classes.icon} />
                      <Typography variant="body2">
                        {new Date(booking.booking_date).toLocaleString()}
                      </Typography>
                    </Box>

                    <Box className={classes.infoRow}>
                      <People className={classes.icon} />
                      <Typography variant="body2">
                        {booking.visitor_count}{" "}
                        {booking.visitor_count === 1 ? "visitor" : "visitors"}
                      </Typography>
                    </Box>

                    {booking.total_price && (
                      <Box className={classes.infoRow}>
                        <AttachMoney className={classes.icon} />
                        <Typography variant="body2" className={classes.price}>
                          ${parseFloat(booking.total_price).toFixed(2)} NZD
                        </Typography>
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      className={classes.payButton}
                      onClick={() => handlePayNow(booking.booking_id)}
                      startIcon={<Payment />}
                    >
                      Pay Now
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Container>
  );
}

export default PendingPaymentsPage;
