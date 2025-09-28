import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import classes from "./DestinationCard.module.css";

function DestinationCard({
  destination,
  onViewDetails,
  onBookNow,
  isAuthenticated,
}) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "#4caf50";
      case "closed":
        return "#f44336";
      case "maintenance":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
  };

  const getOccupancyPercentage = () => {
    const current = destination.current_visitors || 0;
    const capacity = destination.capacity || 1;
    return Math.round((current / capacity) * 100);
  };

  return (
    <Card className={classes.card}>
      <CardMedia
        component="img"
        height="180"
        image={`/images/destinations/${
          destination.thumbnail || "default-thumbnail.jpg"
        }`}
        alt={destination.name}
        onClick={() => onViewDetails(destination.destination_id)}
        style={{ cursor: "pointer" }}
      />
      <CardContent className={classes.cardContent}>
        <div className={classes.cardHeader}>
          <Typography variant="h6" className={classes.cardTitle}>
            {destination.name}
          </Typography>
          <Chip
            label={destination.status}
            size="small"
            style={{
              backgroundColor: getStatusColor(destination.status),
              color: "white",
              fontWeight: "bold",
            }}
          />
        </div>

        <Typography variant="body2" className={classes.cardDescription}>
          {destination.description}
        </Typography>

        <div className={classes.statsContainer}>
          <div className={classes.statItem}>
            <LocationOnIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Location</span>
            <span className={classes.statValue}>
              {destination.locationName || "N/A"}
            </span>
          </div>
          <div className={classes.statItem}>
            <PeopleIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Occupancy</span>
            <span className={classes.statValue}>
              {getOccupancyPercentage()}% ({destination.current_visitors || 0}/
              {destination.capacity})
            </span>
          </div>
        </div>

        <div className={classes.actions}>
          <Button
            variant="outlined"
            onClick={() => onViewDetails(destination.destination_id)}
            className={classes.viewButton}
          >
            View Details
          </Button>
          {isAuthenticated && (
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onBookNow(destination.destination_id);
              }}
              className={classes.bookButton}
            >
              See Offers
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default DestinationCard;
