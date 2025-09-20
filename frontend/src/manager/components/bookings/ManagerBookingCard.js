// src/manager/components/bookings/ManagerBookingCard.js
import { useState } from "react";
import { Card, CardContent, Typography, Button, Chip } from "@mui/material";
import classes from "../../../tourist/components/bookings/BookingCard.module.css"; // Reuse tourist's CSS
import ManagerBookingForm from "./ManagerBookingForm"; // New form for manager

function ManagerBookingCard({ booking, onRefresh }) {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdateSubmit = async (updatedData) => {
    const token = localStorage.getItem("token");
    // Map camel to snake for backend
    const payload = {
      status: updatedData.status,
    };
    try {
      const res = await fetch(
        `http://localhost:3000/dest/api/v1/bookings/${booking.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to update booking");
      setShowEditModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = async () => {
    if (window.confirm("Confirm this booking?")) {
      await handleUpdateSubmit({ status: "confirmed" });
    }
  };

  const handleCancel = async () => {
    if (window.confirm("Cancel this booking?")) {
      await handleUpdateSubmit({ status: "cancelled" });
    }
  };

  const isPending = booking.status === "pending";

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
          Tourist: {booking.touristName} ({booking.touristEmail})
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Status:{" "}
          <Chip
            label={booking.status.toUpperCase()}
            color={booking.status === "confirmed" ? "success" : "default"}
          />
        </Typography>
        {isPending && (
          <>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirm}
              className={classes.actionButton}
            >
              Confirm
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCancel}
              className={classes.actionButton}
            >
              Cancel
            </Button>
          </>
        )}
        {!isPending && booking.status !== "cancelled" && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCancel}
            className={classes.actionButton}
          >
            Cancel
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={() => setShowEditModal(true)}
          className={classes.actionButton}
        >
          View/Details
        </Button>
      </CardContent>

      {showEditModal && (
        <div className={classes.modal}>
          <div className={classes.modalContent}>
            <ManagerBookingForm
              offer={booking.offer || { name: booking.offerName, id: null }}
              booking={booking}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </Card>
  );
}

export default ManagerBookingCard;
