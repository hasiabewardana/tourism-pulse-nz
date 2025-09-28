// src/tourist/components/bookings/BookingCard.js
import { useState } from "react";
import { Card, CardContent, Typography, Button, Chip } from "@mui/material";
import axios from "axios"; // New import for API calls
import classes from "./BookingCard.module.css";
import BookingForm from "./BookingForm";

function BookingCard({ booking, onRefresh }) {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditSubmit = async (updatedData) => {
    const token = localStorage.getItem("token");
    // Map camel to snake for backend
    const payload = {
      booking_date: updatedData.bookingDate,
      visitor_count: updatedData.visitorCount,
      status: updatedData.status,
    };
    try {
      const res = await axios.put(
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
      console.error(err);
    }
  };

  const handleCancel = async () => {
    if (window.confirm("Cancel this booking?")) {
      await handleEditSubmit({ status: "cancelled" });
    }
  };

  const isEditable = booking.status !== "confirmed";

  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
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
            color={booking.status === "confirmed" ? "success" : "default"}
            className={classes.statusChip}
          />
        </Typography>
        {isEditable && (
          <>
            <Button
              variant="contained"
              onClick={() => setShowEditModal(true)}
              className={classes.actionButton}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              onClick={handleCancel}
              className={classes.actionButton}
            >
              Cancel
            </Button>
          </>
        )}
      </CardContent>

      {showEditModal && (
        <div className={classes.modal}>
          <div className={classes.modalContent}>
            <BookingForm
              offer={booking.offer || { name: booking.offerName, id: null }} // Fallback offer
              booking={booking}
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

export default BookingCard;
