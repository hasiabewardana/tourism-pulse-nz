import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Snackbar,
  Box,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import PaymentIcon from "@mui/icons-material/Payment";
import axios from "axios";
import classes from "./BookingCard.module.css";
import BookingForm from "./BookingForm";
import ReviewDialog from "./ReviewDialog";

function BookingCard({ booking, onRefresh }) {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [offerDetails, setOfferDetails] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleEditClick = () => {
    if (booking.status.toLowerCase() !== "pending") {
      setAlertMessage(
        `This booking cannot be edited because it is ${booking.status}. Only pending bookings can be modified.`
      );
      setShowAlert(true);
      return;
    }

    // Create offer object from booking data (all data is already available)
    const offerFromBooking = {
      offer_id: booking.offerId,
      id: booking.offerId,
      name: booking.offerName || booking.offer?.name || "Unknown Offer",
      description: booking.offer?.description || "No description",
      // Use reasonable defaults for fields needed by BookingForm
      // The form will use these for validation
      available_from: new Date().toISOString(), // Allow immediate booking
      available_to: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(), // 1 year from now
      max_slots: 100, // Reasonable default
      price: 0, // Not needed for editing existing bookings
    };

    setOfferDetails(offerFromBooking);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (updatedData) => {
    const token = localStorage.getItem("token");
    const payload = {
      booking_date: updatedData.bookingDate,
      visitor_count: updatedData.visitorCount,
      status: updatedData.status,
    };
    try {
      await axios.put(
        `http://localhost:3000/dest/api/v1/bookings/${booking.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setShowEditModal(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to update booking:", err);
      setAlertMessage("Failed to update booking. Please try again.");
      setShowAlert(true);
      setShowEditModal(false);
    }
  };

  const handleCancel = async () => {
    // Only allow cancellation if status is pending
    if (booking.status.toLowerCase() !== "pending") {
      setAlertMessage(
        `This booking cannot be cancelled because it is already ${booking.status}.`
      );
      setShowAlert(true);
      return;
    }

    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const token = localStorage.getItem("token");
      const payload = {
        booking_date: booking.bookingDate,
        visitor_count: booking.visitorCount,
        status: "cancelled",
      };
      try {
        await axios.put(
          `http://localhost:3000/dest/api/v1/bookings/${booking.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        onRefresh();
      } catch (err) {
        console.error("Failed to cancel booking:", err);
        setAlertMessage("Failed to cancel booking. Please try again.");
        setShowAlert(true);
      }
    }
  };

  const handleReviewSubmitted = () => {
    onRefresh();
  };

  const handlePayNow = async () => {
    setPaymentLoading(true);
    try {
      const token = localStorage.getItem("token");
      const bookingResponse = await axios.get(
        `http://localhost:3000/dest/api/v1/bookings/${booking.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (bookingResponse.data.payment_status === "paid") {
        setAlertMessage("This booking has already been paid.");
        setShowAlert(true);
        setPaymentLoading(false);
        return;
      }

      navigate(`/tourist/checkout/${booking.id}`);
    } catch (err) {
      console.error("Failed to initiate payment:", err);
      setAlertMessage("Failed to initiate payment. Please try again.");
      setShowAlert(true);
      setPaymentLoading(false);
    }
  };

  const bookingDate = new Date(booking.bookingDate);
  const isExpired = bookingDate <= new Date();
  const isPending = booking.status.toLowerCase() === "pending";
  const isConfirmed = booking.status.toLowerCase() === "confirmed";
  const isCancelled = booking.status.toLowerCase() === "cancelled";
  const canEdit = isPending && !isExpired;
  const canCancel = isPending && !isExpired;
  const canReview = isConfirmed && !booking.hasReview && !isExpired;
  const needsPayment =
    isPending &&
    !isExpired &&
    (!booking.paymentStatus || booking.paymentStatus === "unpaid");

  const statusLabel = isPending
    ? "Pending"
    : isConfirmed
    ? "Confirmed"
    : isCancelled
    ? "Cancelled"
    : booking.status;

  const statusClass = isConfirmed
    ? classes.statusOpen
    : isCancelled
    ? classes.statusClosed
    : classes.statusPending;

  const truncateDescription = (text, maxLength = 120) => {
    if (!text) return "No description available";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <>
      <Card className={classes.card}>
        <Box className={classes.imageContainer}>
          <Box className={classes.imagePlaceholder}>
            <Typography variant="h6" className={classes.placeholderText}>
              {booking.offerName}
            </Typography>
          </Box>
          <Chip
            label={statusLabel}
            className={`${classes.statusBadge} ${statusClass}`}
          />
        </Box>

        <CardContent className={classes.cardContent}>
          <Typography variant="h6" className={classes.cardTitle}>
            {booking.offerName}
          </Typography>
          <Typography variant="body2" className={classes.cardDescription}>
            {truncateDescription(booking.offer?.description)}
          </Typography>

          <Box className={classes.dateInfo}>
            <Typography variant="caption" className={classes.dateText}>
              Booking Date: {bookingDate.toLocaleDateString()} at{" "}
              {bookingDate.toLocaleTimeString()}
            </Typography>
          </Box>

          <Box className={classes.actionButtons}>
            {needsPayment && (
              <Button
                variant="contained"
                color="primary"
                onClick={handlePayNow}
                className={classes.payButton}
                disabled={paymentLoading}
                size="small"
                startIcon={<PaymentIcon />}
              >
                {paymentLoading ? "Loading..." : "Pay Now"}
              </Button>
            )}
            {canEdit && (
              <Button
                variant="contained"
                onClick={handleEditClick}
                className={classes.actionButton}
                disabled={loadingOffer}
                size="small"
              >
                {loadingOffer ? "Loading..." : "Edit"}
              </Button>
            )}
            {canCancel && (
              <Button
                variant="outlined"
                onClick={handleCancel}
                className={classes.cancelButton}
                size="small"
              >
                Cancel
              </Button>
            )}
            {canReview && (
              <Button
                variant="contained"
                onClick={() => setShowReviewDialog(true)}
                className={classes.reviewButton}
                size="small"
              >
                Review
              </Button>
            )}
          </Box>
        </CardContent>

        <Box className={classes.footer}>
          <Box className={classes.footerItem}>
            <EventIcon className={classes.icon} />
            <Typography variant="body2" className={classes.footerText}>
              {bookingDate.toLocaleDateString()}
            </Typography>
          </Box>
          <Box className={classes.footerItem}>
            <PeopleIcon className={classes.icon} />
            <Typography variant="body2" className={classes.footerText}>
              {booking.visitorCount}{" "}
              {booking.visitorCount === 1 ? "visitor" : "visitors"}
            </Typography>
          </Box>
        </Box>
      </Card>

      {showEditModal && offerDetails && (
        <div className={classes.modal}>
          <div className={classes.modalContent}>
            <BookingForm
              offer={offerDetails}
              booking={booking}
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}

      <ReviewDialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        booking={booking}
        onReviewSubmitted={handleReviewSubmitted}
      />

      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowAlert(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default BookingCard;
