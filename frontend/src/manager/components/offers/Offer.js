// src/manager-dashboard/components/offer-management/Offer.js
import { Card, CardContent, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import classes from "./OfferManagement.module.css";

function Offer({ offer, operatorName, onDelete, onEdit }) {
  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h5" className={classes.cardTitle}>
          {offer.name}
        </Typography>
        <Typography variant="body2" className={classes.cardDescription}>
          Operator: {operatorName}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Price: $
          {offer.price !== undefined && offer.price !== null
            ? Number(offer.price).toFixed(2)
            : "N/A"}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Max Slots: {offer.max_slots}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Available From:{" "}
          {offer.available_from
            ? new Date(offer.available_from).toLocaleDateString()
            : "N/A"}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Available To:{" "}
          {offer.available_to
            ? new Date(offer.available_to).toLocaleDateString()
            : "N/A"}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Destinations: {offer.destinationNames?.join(", ") || "None"}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Status: {offer.status || "Active"}
        </Typography>
        <div className={classes.actions}>
          <IconButton
            onClick={() => onEdit(offer)}
            color="primary"
            aria-label="Edit offer"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => onDelete(offer.id)}
            color="error"
            aria-label="Delete offer"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  );
}

export default Offer;
