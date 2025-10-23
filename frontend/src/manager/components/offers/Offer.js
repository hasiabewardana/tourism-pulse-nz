import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import classes from "./OfferManagement.module.css";

function Offer({ offer, operatorName, onDelete, onEdit }) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#4caf50";
      case "inactive":
        return "#f44336";
      case "pending":
        return "#ff9800";
      default:
        return "#4caf50";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-NZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return "N/A";
    return `$${Number(price).toFixed(2)}`;
  };

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
        {offer.name?.charAt(0)?.toUpperCase() || "O"}
      </CardMedia>
      <CardContent className={classes.cardContent}>
        <div className={classes.cardHeader}>
          <Typography variant="h6" className={classes.cardTitle}>
            {offer.name || "Unnamed Offer"}
          </Typography>
          <Chip
            label={offer.status || "Active"}
            size="small"
            style={{
              backgroundColor: getStatusColor(offer.status || "Active"),
              color: "white",
              fontWeight: "bold",
            }}
          />
        </div>

        <Typography variant="body2" className={classes.cardDescription}>
          {offer.description || "Special offer from our tourism operator"}
        </Typography>

        <div className={classes.statsContainer}>
          <div className={classes.statItem}>
            <PersonIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Operator</span>
            <span className={classes.statValue}>{operatorName || "N/A"}</span>
          </div>
          <div className={classes.statItem}>
            <AttachMoneyIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Price</span>
            <span className={classes.statValue}>
              {formatPrice(offer.price)}
            </span>
          </div>
          <div className={classes.statItem}>
            <PeopleIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Max Slots</span>
            <span className={classes.statValue}>
              {offer.max_slots || "Unlimited"}
            </span>
          </div>
          <div className={classes.statItem}>
            <EventAvailableIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Available</span>
            <span className={classes.statValue}>
              {formatDate(offer.available_from)} -{" "}
              {formatDate(offer.available_to)}
            </span>
          </div>
          <div className={classes.statItem}>
            <LocationOnIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Destinations</span>
            <span className={classes.statValue}>
              {offer.destinationNames?.length > 0
                ? offer.destinationNames.slice(0, 2).join(", ") +
                  (offer.destinationNames.length > 2
                    ? ` +${offer.destinationNames.length - 2} more`
                    : "")
                : "None assigned"}
            </span>
          </div>
        </div>

        <div className={classes.actions}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => onEdit(offer)}
            className={classes.editButton}
            size="small"
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(offer.id)}
            className={classes.deleteButton}
            size="small"
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default Offer;
