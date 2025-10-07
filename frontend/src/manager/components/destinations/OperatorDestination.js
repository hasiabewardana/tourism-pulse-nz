import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import PersonIcon from "@mui/icons-material/Person";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import classes from "./OperatorDestination.module.css";

function OperatorDestination({ assignment, userName, onDelete, onSubscribe }) {
  const [subscribed, setSubscribed] = React.useState(
    assignment.subscribed || false
  );
  const [notification, setNotification] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleSubscribe = async () => {
    const newSubscribed = !subscribed;
    const destinationName = assignment.destinationName || assignment.name;

    try {
      setSubscribed(newSubscribed);
      await onSubscribe(
        assignment.userId,
        assignment.destinationId,
        newSubscribed
      );

      // Show success notification
      setNotification({
        open: true,
        message: newSubscribed
          ? `✅ Alert notifications enabled for ${destinationName}`
          : `🔔 Alert notifications disabled for ${destinationName}`,
        severity: "success",
      });
    } catch (error) {
      // Revert the state on error
      setSubscribed(!newSubscribed);
      setNotification({
        open: true,
        message: `Failed to update alert settings for ${destinationName}`,
        severity: "error",
      });
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
      case "active":
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
    const current = assignment.current_visitors || 0;
    const capacity = assignment.capacity || 1;
    return Math.round((current / capacity) * 100);
  };

  return (
    <Card className={classes.card}>
      <CardMedia
        component="img"
        height="200"
        image={`/images/destinations/${
          assignment.thumbnail || "default-thumbnail.jpg"
        }`}
        alt={assignment.destinationName || assignment.name}
        style={{ cursor: "pointer" }}
      />
      <CardContent className={classes.cardContent}>
        <div className={classes.cardHeader}>
          <Typography variant="h6" className={classes.cardTitle}>
            {assignment.destinationName || assignment.name}
          </Typography>
          <Chip
            label={assignment.status || "Active"}
            size="small"
            style={{
              backgroundColor: getStatusColor(assignment.status || "Active"),
              color: "white",
              fontWeight: "bold",
            }}
          />
        </div>

        <Typography variant="body2" className={classes.cardDescription}>
          {assignment.description ||
            "Managed destination under your supervision"}
        </Typography>

        <div className={classes.statsContainer}>
          <div className={classes.statItem}>
            <PersonIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Operator</span>
            <span className={classes.statValue}>{userName}</span>
          </div>
          <div className={classes.statItem}>
            <LocationOnIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Region</span>
            <span className={classes.statValue}>
              {assignment.region || "Unknown"}
            </span>
          </div>
          <div className={classes.statItem}>
            <PeopleIcon className={classes.statIcon} />
            <span className={classes.statLabel}>Occupancy</span>
            <span className={classes.statValue}>
              {getOccupancyPercentage()}% ({assignment.current_visitors || 0}/
              {assignment.capacity})
            </span>
          </div>
        </div>

        <div className={classes.actions}>
          <FormControlLabel
            control={
              <Switch
                checked={subscribed}
                onChange={handleSubscribe}
                color="primary"
                size="small"
              />
            }
            label={
              <div className={classes.switchLabel}>
                <NotificationsIcon className={classes.switchIcon} />
                Alerts
              </div>
            }
            className={classes.alertToggle}
          />
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() =>
              onDelete(assignment.userId, assignment.destinationId)
            }
            className={classes.deleteButton}
            size="small"
          >
            Remove
          </Button>
        </div>
      </CardContent>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}

export default OperatorDestination;
