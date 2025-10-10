// src/tourist/components/offers/OfferCard.js
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import classes from "./OfferCard.module.css";

function OfferCard({ offer, onBookNow }) {
  const isActive = offer.status === "active";
  const statusLabel = isActive ? "Open" : "Closed";
  const statusClass = isActive ? classes.statusOpen : classes.statusClosed;

  console.log("OfferCard received offer:", offer);
  console.log("OfferCard destinationNames:", offer.destinationNames);

  const getDestinationDisplay = () => {
    if (offer.destinationNames && offer.destinationNames.length > 0) {
      return offer.destinationNames.join(", ");
    }

    if (
      offer.destinations &&
      Array.isArray(offer.destinations) &&
      offer.destinations.length > 0
    ) {
      const names = offer.destinations.map((d) => d.name || d).filter(Boolean);
      if (names.length > 0) {
        return names.join(", ");
      }
    }

    return "No destination assigned";
  };

  const truncateDescription = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className={classes.card} onClick={onBookNow}>
      <Box className={classes.imageContainer}>
        <Box className={classes.imagePlaceholder}>
          <Typography variant="h6" className={classes.placeholderText}>
            {offer.name}
          </Typography>
        </Box>
        <Chip
          label={statusLabel}
          className={`${classes.statusBadge} ${statusClass}`}
        />
      </Box>

      <CardContent className={classes.cardContent}>
        <Typography variant="h6" className={classes.cardTitle}>
          {offer.name}
        </Typography>
        <Typography variant="body2" className={classes.cardDescription}>
          {truncateDescription(offer.description)}
        </Typography>

        <Box className={classes.priceInfo}>
          <Typography variant="h6" className={classes.price}>
            ${Number(offer.price).toFixed(2)}
          </Typography>
          <Typography variant="caption" className={classes.priceLabel}>
            per person
          </Typography>
        </Box>

        <Box className={classes.dateInfo}>
          <Typography variant="caption" className={classes.dateText}>
            Available: {new Date(offer.available_from).toLocaleDateString()} -{" "}
            {new Date(offer.available_to).toLocaleDateString()}
          </Typography>
        </Box>
      </CardContent>

      <Box className={classes.footer}>
        <Box className={classes.footerItem}>
          <LocationOnIcon className={classes.icon} />
          <Typography variant="body2" className={classes.footerText}>
            {getDestinationDisplay()}
          </Typography>
        </Box>
        <Box className={classes.footerItem}>
          <ConfirmationNumberIcon className={classes.icon} />
          <Typography variant="body2" className={classes.footerText}>
            {offer.max_slots} slots
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}

export default OfferCard;
