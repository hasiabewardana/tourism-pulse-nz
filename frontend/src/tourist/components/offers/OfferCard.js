// src/tourist/components/offers/OfferCard.js
import { Card, CardContent, Typography, Button, Chip } from "@mui/material";
import classes from "./OfferCard.module.css";

function OfferCard({ offer, onBookNow }) {
  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h5" className={classes.cardTitle}>
          {offer.name}
        </Typography>
        <Typography variant="body2" className={classes.cardDescription}>
          {offer.description}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Price: ${Number(offer.price).toFixed(2)}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Max Slots: {offer.max_slots}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Available From: {new Date(offer.available_from).toLocaleDateString()}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Available To: {new Date(offer.available_to).toLocaleDateString()}
        </Typography>
        <div className={classes.destinations}>
          <Typography variant="subtitle2" className={classes.destLabel}>
            Destinations:
          </Typography>
          {offer.destinationNames.map((name, index) => (
            <Chip
              key={index}
              label={name}
              className={classes.chip}
              size="small"
            />
          ))}
        </div>
        <Typography variant="body1" className={classes.cardInfo}>
          Status:{" "}
          <Chip
            label={offer.status.toUpperCase()}
            color={offer.status === "active" ? "success" : "default"}
            size="small"
            className={classes.statusChip}
          />
        </Typography>
        <Button
          variant="contained"
          onClick={onBookNow}
          fullWidth
          className={classes.bookButton}
          sx={{ mt: 2 }}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
}

export default OfferCard;
