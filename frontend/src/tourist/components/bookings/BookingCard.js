// src/tourist/components/bookings/BookingCard.js
import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import classes from "./BookingCard.module.css";
import BookingForm from "./BookingForm";
import ReviewDialog from "./ReviewDialog";

function BookingCard({ booking, onRefresh }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [offerDetails, setOfferDetails] = useState(null);
  const [loadingOffer, setLoadingOffer] = useState(false);

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

  const bookingDate = new Date(booking.bookingDate);
  const isExpired = bookingDate <= new Date();
  const isPending = booking.status.toLowerCase() === "pending";
  const isConfirmed = booking.status.toLowerCase() === "confirmed";
  const canEdit = isPending && !isExpired;
  const canCancel = isPending && !isExpired;
  const canReview = isConfirmed && !booking.hasReview && !isExpired;

  return (
    <>
      <Card
        className={classes.card}
        sx={{
          opacity: isExpired ? 0.7 : 1,
          backgroundColor: isExpired ? "#f5f5f5" : "white",
        }}
      >
        <CardContent className={classes.cardContent}>
          {isExpired && (
            <Chip
              label="EXPIRED"
              color="default"
              size="small"
              sx={{ mb: 1, backgroundColor: "#9e9e9e", color: "white" }}
            />
          )}
          <Typography variant="h5" className={classes.cardTitle}>
            {booking.offerName}
          </Typography>
          <Typography variant="body2" className={classes.cardDescription}>
            {booking.offer?.description || "No description available"}
          </Typography>
          <Typography variant="body1" className={classes.cardInfo}>
            Booking Date: {new Date(booking.bookingDate).toLocaleString()}
          </Typography>
          <Typography variant="body1" className={classes.cardInfo}>
            Visitors: {booking.visitorCount}
          </Typography>
          <Typography variant="body1" className={classes.cardInfo}>
            Status:{" "}
            <Chip
              label={booking.status.toUpperCase()}
              color={
                isConfirmed
                  ? "success"
                  : isPending
                  ? "warning"
                  : booking.status.toLowerCase() === "cancelled"
                  ? "error"
                  : "default"
              }
              className={classes.statusChip}
            />
          </Typography>

          {!isExpired && (
            <>
              {canEdit && (
                <Button
                  variant="contained"
                  onClick={handleEditClick}
                  className={classes.actionButton}
                  sx={{ mr: 1 }}
                  disabled={loadingOffer}
                >
                  {loadingOffer ? "Loading..." : "Edit"}
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleCancel}
                  className={classes.actionButton}
                >
                  Cancel Booking
                </Button>
              )}
            </>
          )}

          {canReview && (
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setShowReviewDialog(true)}
              className={classes.actionButton}
              sx={{ mt: 1 }}
            >
              Write Review
            </Button>
          )}
        </CardContent>
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
