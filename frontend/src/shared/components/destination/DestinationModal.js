// src/shared/pages/destinations/DestinationModal.js
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Grid,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import classes from "./DestinationModal.module.css";

function DestinationModal({
  open,
  onClose,
  destinationId,
  isAuthenticated: propIsAuthenticated,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [destination, setDestination] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const getPhotosArray = (dest) => {
    return dest.photos && Array.isArray(dest.photos) && dest.photos.length > 0
      ? dest.photos.map((photo) => `/images/destinations/${photo}`)
      : [`/images/destinations/default-photo.jpg`];
  };

  const photos = destination ? getPhotosArray(destination) : [];

  const fetchDestination = async () => {
    if (!destinationId) return;
    try {
      setLoading(true);
      setError(null);
      const token = isAuthenticated ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiUrl = isAuthenticated
        ? `http://localhost:3000/dest/api/v1/destinations/${destinationId}`
        : `http://localhost:3000/dest/api/v1/destinations/${destinationId}/public`;

      console.log("Fetching destination from:", apiUrl);
      const response = await axios.get(apiUrl, { headers });
      if (!response.data) {
        throw new Error(`Failed to fetch destination: No data returned`);
      }
      const data = response.data;
      console.log("Fetched destination data:", data);

      // Parse location to extract lon and lat
      const locationMatch = data.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (!locationMatch) {
        throw new Error("Invalid location format in destination data");
      }
      const [_, lon, lat] = locationMatch;
      const parsedLon = parseFloat(lon);
      const parsedLat = parseFloat(lat);

      // Fetch weather data using Axios
      try {
        const weatherResponse = await axios.get(
          `http://localhost:3000/integration/api/v1/weather?lat=${parsedLat}&lon=${parsedLon}&appid=13b12bc50a555c7b45931a520a06c013`
        );
        const weatherData = weatherResponse.data;
        setWeather({
          temp: weatherData.main?.temp || "N/A",
          description: weatherData.weather?.[0]?.description || "Not available",
        });
      } catch (weatherErr) {
        console.warn("Weather fetch failed:", weatherErr.message);
        setWeather({ temp: "N/A", description: "Not available" });
      }

      setDestination(data);
      setLoading(false);
    } catch (err) {
      console.error("Destination fetch error:", err);
      setError(err.message || "An error occurred while fetching data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && destinationId) {
      fetchDestination();
      setCurrentImageIndex(0);
      setIsZoomed(false);
    }
  }, [open, destinationId, isAuthenticated]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  const handleBookNow = () => {
    if (isAuthenticated) {
      navigate(`/booking/${destinationId}`);
    } else {
      navigate("/login");
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      classes={{ paper: classes.dialogPaper }}
      maxWidth={false}
    >
      <DialogTitle className={classes.dialogTitle}>
        <Typography variant="h6" className={classes.title}>
          {destination?.name || "Destination Details"}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className={classes.closeButton}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.dialogContent}>
        {loading ? (
          <Box className={classes.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" className={classes.errorAlert}>
            {error}
          </Alert>
        ) : destination ? (
          <>
            <Grid container direction="row" className={classes.modalGrid}>
              <Grid item xs={4} md={4} className={classes.detailsPanel}>
                <Typography variant="h4" className={classes.destTitle}>
                  {destination.name}
                </Typography>
                <Typography variant="body1" className={classes.description}>
                  {destination.description}
                </Typography>
                <Typography variant="body1" className={classes.info}>
                  Capacity: {destination.capacity}
                </Typography>
                <Typography variant="body1" className={classes.info}>
                  Current Visitors: {destination.current_visitors}
                </Typography>
                <Typography variant="body1" className={classes.status}>
                  Status: {destination.status}
                </Typography>
                <Typography variant="body1" className={classes.weatherInfo}>
                  Weather: {weather?.temp}°C, {weather?.description}
                </Typography>
              </Grid>
              <Grid item xs={8} md={8} className={classes.slideshowPanel}>
                <Typography variant="h5" className={classes.slideshowTitle}>
                  Gallery
                </Typography>
                <Box className={classes.imageWrapper}>
                  <img
                    src={photos[currentImageIndex]}
                    alt={`${destination.name} - Image ${currentImageIndex + 1}`}
                    className={`${classes.slideshowImage} ${
                      isZoomed ? classes.zoomed : ""
                    }`}
                    onClick={handleZoomToggle}
                  />
                  {photos.length > 1 && (
                    <>
                      <IconButton
                        onClick={handlePrevImage}
                        className={classes.navButton}
                        aria-label="Previous image"
                      >
                        <ArrowBackIosIcon />
                      </IconButton>
                      <IconButton
                        onClick={handleNextImage}
                        className={`${classes.navButton} ${classes.nextButton}`}
                        aria-label="Next image"
                      >
                        <ArrowForwardIosIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
                {photos.length > 1 && (
                  <Box className={classes.imageIndicators}>
                    {photos.map((_, index) => (
                      <span
                        key={index}
                        className={`${classes.indicator} ${
                          index === currentImageIndex
                            ? classes.activeIndicator
                            : ""
                        }`}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                  </Box>
                )}
                <Typography variant="caption" className={classes.imageCaption}>
                  Image {currentImageIndex + 1} of {photos.length}{" "}
                  {isZoomed ? "(Click to zoom out)" : "(Click to zoom in)"}
                </Typography>
              </Grid>
            </Grid>
            {propIsAuthenticated && (
              <Box className={classes.bookButtonContainer}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleBookNow}
                  className={classes.bookButton}
                >
                  Book Now
                </Button>
              </Box>
            )}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default DestinationModal;
