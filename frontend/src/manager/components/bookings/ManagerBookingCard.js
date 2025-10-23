// src/manager/components/bookings/ManagerBookingCard.js
import { useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import classes from "./ManagerBookingCard.module.css";
import ManagerBookingForm from "./ManagerBookingForm";

function ManagerBookingCard({ booking, onRefresh }) {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdateSubmit = async (updatedData) => {
    const token = localStorage.getItem("token");
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "#4caf50";
      case "cancelled":
        return "#f44336";
      case "pending":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-NZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPending = booking.status === "pending";
  const isConfirmed = booking.status === "confirmed";

  return (
    <Card className={classes.card}>
      <CardMedia
        component="div"
        height="120"
        style={{
          background: "linear-gradient(135deg, #48d9f3 0%, #0fa4af 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "2.5rem",
          fontWeight: "bold",
        }}
      >
        {booking.offerName?.charAt(0)?.toUpperCase() || "B"}
      </CardMedia>
      <CardContent className={classes.cardContent}>
        <div className={classes.cardHeader}>
          <Typography variant="h6" className={classes.cardTitle}>
            {booking.offerName || "Booking"}
          </Typography>
          <Chip
            label={booking.status?.toUpperCase() || "PENDING"}
            size="small"
            style={{
              backgroundColor: getStatusColor(booking.status),
              color: "white",
              fontWeight: "bold",
            }}
          />
        </div>

        <Typography variant="body2" className={classes.cardDescription}>
          {booking.offer?.description || "View details for more information"}
        </Typography>

        <div className={classes.statsContainer}>
          <div className={classes.statItem}>
            <PersonIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Tourist</span>
            <span className={classes.statValue}>
              {booking.touristName || "Anonymous"}
            </span>
          </div>
          <div className={classes.statItem}>
            <EmailIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Email</span>
            <span className={classes.statValue}>
              {booking.touristEmail || "N/A"}
            </span>
          </div>
          <div className={classes.statItem}>
            <EventIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Date</span>
            <span className={classes.statValue}>
              {formatDate(booking.bookingDate)}
            </span>
          </div>
          <div className={classes.statItem}>
            <PeopleIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Visitors</span>
            <span className={classes.statValue}>{booking.visitorCount}</span>
          </div>
        </div>

        <div className={classes.actions}>
          {isPending && (
            <>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<CheckCircleIcon />}
                onClick={handleConfirm}
                className={classes.confirmButton}
                size="small"
              >
                Confirm
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                className={classes.cancelButton}
                size="small"
              >
                Decline
              </Button>
            </>
          )}
          {isConfirmed && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              className={classes.cancelButton}
              size="small"
              fullWidth
            >
              Cancel Booking
            </Button>
          )}
          {!isPending && !isConfirmed && booking.status !== "cancelled" && (
            <Button
              variant="outlined"
              onClick={() => setShowEditModal(true)}
              className={classes.detailsButton}
              size="small"
              fullWidth
              startIcon={<VisibilityIcon />}
            >
              View Details
            </Button>
          )}
        </div>
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
