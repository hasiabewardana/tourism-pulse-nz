// src/admin-panel/components/destination-management/Destination.js
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from "@mui/material";
import classes from "./Destination.module.css";

function Destination({ destination, onEdit, onDelete, selectedDate }) {
  return (
    <Card className={classes.card}>
      <CardMedia
        component="img"
        height="200"
        image={`/images/destinations/${
          destination.photos?.[0] ||
          "/images/destinations/default-thumbnail.jpg"
        }`}
        alt={destination.name}
      />
      <CardContent className={classes.cardContent}>
        <Typography variant="h5" className={classes.cardTitle}>
          {destination.name}
        </Typography>
        <Typography variant="body2" className={classes.cardDescription}>
          {destination.description || "No description"}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Capacity: {destination.capacity}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Current Visitors (
          {selectedDate
            ? new Date(selectedDate).toLocaleDateString("en-NZ", {
                timeZone: "Pacific/Auckland",
              })
            : "Today"}
          ): {destination.current_visitors || 0}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Location: {destination.location || "N/A"}
        </Typography>
        <Typography variant="body1" className={classes.cardStatus}>
          Status: {destination.status}
        </Typography>
        <div className={classes.actions}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onEdit(destination)}
            className={classes.actionButton}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => onDelete(destination.destination_id)}
            className={classes.actionButton}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default Destination;
