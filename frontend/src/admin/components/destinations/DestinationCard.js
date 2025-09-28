import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Box,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import classes from "./DestinationCard.module.css";

function DestinationCard({ destination, onEdit, onDelete, selectedDate }) {
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
            }}
          />
        </div>

        <Typography variant="body2" className={classes.cardDescription}>
          {destination.description?.substring(0, 100) || "No description"}
          {destination.description?.length > 100 && "..."}
        </Typography>

        <Box className={classes.statsContainer}>
          <div className={classes.statItem}>
            <PeopleIcon className={classes.statIcon} />
            <div>
              <Typography variant="body2" className={classes.statLabel}>
                Occupancy
              </Typography>
              <Typography variant="body1" className={classes.statValue}>
                {destination.current_visitors || 0}/{destination.capacity} (
                {getOccupancyPercentage()}%)
              </Typography>
            </div>
          </div>

          <div className={classes.statItem}>
            <LocationOnIcon className={classes.statIcon} />
            <div>
              <Typography variant="body2" className={classes.statLabel}>
                Location
              </Typography>
              <Typography variant="body1" className={classes.statValue}>
                {destination.locationName || destination.location || "N/A"}
              </Typography>
            </div>
          </div>
        </Box>

        <div className={classes.actions}>
          <Button
            variant="outlined"
            onClick={() => onEdit(destination)}
            className={classes.editButton}
            size="small"
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => onDelete(destination.destination_id)}
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

export default DestinationCard;
