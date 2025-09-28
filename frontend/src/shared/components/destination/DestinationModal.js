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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
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
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(null);

  const getPhotosArray = (dest) => {
    console.log("Processing photos for destination:", dest.name);
    console.log("Raw photos data:", dest.photos);
    console.log("Destination slug:", dest.slug);
    console.log("Thumbnail:", dest.thumbnail);

    // Handle array of photos
    if (dest.photos && Array.isArray(dest.photos) && dest.photos.length > 0) {
      const processedPhotos = dest.photos.map((photo) => {
        // If photo already includes path, use as is
        if (photo.startsWith("/") || photo.startsWith("http")) {
          return photo;
        }
        // Otherwise, construct the path
        return `/images/destinations/${photo}`;
      });
      console.log("Processed from photos array:", processedPhotos);
      return processedPhotos;
    }

    // Handle JSON string of photos
    if (typeof dest.photos === "string") {
      try {
        const parsedPhotos = JSON.parse(dest.photos);
        if (Array.isArray(parsedPhotos) && parsedPhotos.length > 0) {
          const processedPhotos = parsedPhotos.map((photo) =>
            photo.startsWith("/") || photo.startsWith("http")
              ? photo
              : `/images/destinations/${photo}`
          );
          console.log("Processed from JSON string:", processedPhotos);
          return processedPhotos;
        }
      } catch (e) {
        console.warn("Failed to parse photos JSON:", e);
      }
    }

    // Try to build from known folder structure based on slug or name
    const slugName =
      dest.slug ||
      dest.name
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    if (slugName) {
      const basePath = `/images/destinations/${slugName}`;
      const potentialPhotos = [];

      // Add numbered photos (1-5)
      for (let i = 1; i <= 5; i++) {
        potentialPhotos.push(`${basePath}/${slugName}-${i}.jpg`);
      }

      console.log("Generated from slug:", potentialPhotos);
      return potentialPhotos;
    }

    // Use thumbnail if available, otherwise default
    const fallbackPhoto = dest.thumbnail
      ? `/images/destinations/${dest.thumbnail}`
      : `/images/destinations/default-photo.jpg`;

    console.log("Using fallback:", [fallbackPhoto]);
    return [fallbackPhoto];
  };

  const photos = destination ? getPhotosArray(destination) : [];

  // DEBUG: Log photos array
  useEffect(() => {
    if (destination) {
      console.log("Processed photos array:", photos);
      console.log("Photos length:", photos.length);
    }
  }, [destination, photos]);

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
      console.log("Photos array:", data.photos);
      console.log("Destination slug:", data.slug);

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
      setIsAutoPlaying(false);
    }
  }, [open, destinationId, isAuthenticated]);

  // Auto-play slideshow effect
  useEffect(() => {
    if (isAutoPlaying && photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev < photos.length - 1 ? prev + 1 : 0
        );
      }, 3000); // Change image every 3 seconds
      setAutoPlayInterval(interval);
      return () => clearInterval(interval);
    } else if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
  }, [isAutoPlaying, photos.length]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (!open || photos.length <= 1) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          handlePrevImage();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNextImage();
          break;
        case " ":
        case "Spacebar":
          event.preventDefault();
          toggleAutoPlay();
          break;
        default:
          break;
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }
  }, [open, photos.length]);

  const handlePrevImage = () => {
    setIsAutoPlaying(false); // Stop auto-play when user manually navigates
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextImage = () => {
    setIsAutoPlaying(false); // Stop auto-play when user manually navigates
    setCurrentImageIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
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
          <Box className={classes.modalContainer}>
            {/* Hero Image Section */}
            <Box className={classes.heroSection}>
              <Box className={classes.imageContainer}>
                <img
                  src={photos[currentImageIndex]}
                  alt={`${destination.name} - Image ${currentImageIndex + 1}`}
                  className={`${classes.heroImage} ${
                    isZoomed ? classes.zoomed : ""
                  }`}
                  onClick={handleZoomToggle}
                />
                {photos.length > 1 && (
                  <>
                    <IconButton
                      onClick={handlePrevImage}
                      className={`${classes.navButton} ${classes.prevButton}`}
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
                <Box className={classes.imageOverlay}>
                  <Typography
                    variant="caption"
                    className={classes.imageCounter}
                  >
                    {currentImageIndex + 1} / {photos.length}
                  </Typography>
                  {photos.length > 1 && (
                    <IconButton
                      onClick={toggleAutoPlay}
                      className={classes.autoPlayButton}
                      aria-label={
                        isAutoPlaying ? "Pause slideshow" : "Start slideshow"
                      }
                      size="small"
                    >
                      {isAutoPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Image Thumbnails */}
              {photos.length > 1 && (
                <Box className={classes.thumbnailStrip}>
                  {photos.map((photo, index) => (
                    <Box
                      key={index}
                      className={`${classes.thumbnail} ${
                        index === currentImageIndex
                          ? classes.activeThumbnail
                          : ""
                      }`}
                      onClick={() => {
                        setIsAutoPlaying(false); // Stop auto-play when user clicks thumbnail
                        setCurrentImageIndex(index);
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className={classes.thumbnailImage}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Content Section */}
            <Box className={classes.contentSection}>
              <Box className={classes.contentLayout}>
                {/* Main Details */}
                <Box className={classes.mainContent}>
                  <Typography variant="h4" className={classes.destinationTitle}>
                    {destination.name}
                  </Typography>

                  <Typography variant="body1" className={classes.description}>
                    {destination.description}
                  </Typography>

                  {/* Status Badge */}
                  <Box className={classes.statusBadge}>
                    <Typography
                      variant="body2"
                      className={`${classes.statusText} ${
                        destination.status?.toLowerCase() === "open"
                          ? classes.statusOpen
                          : classes.statusClosed
                      }`}
                    >
                      {destination.status}
                    </Typography>
                  </Box>
                </Box>

                {/* Fixed Info Panel */}
                <Box className={classes.fixedInfoPanel}>
                  <Box className={classes.infoPanel}>
                    <Typography variant="h6" className={classes.infoPanelTitle}>
                      Visit Information
                    </Typography>

                    <Box className={classes.infoItem}>
                      <Typography variant="body2" className={classes.infoLabel}>
                        Capacity
                      </Typography>
                      <Typography variant="body1" className={classes.infoValue}>
                        {destination.capacity} visitors
                      </Typography>
                    </Box>

                    <Box className={classes.infoItem}>
                      <Typography variant="body2" className={classes.infoLabel}>
                        Current Visitors
                      </Typography>
                      <Typography variant="body1" className={classes.infoValue}>
                        {destination.current_visitors || 0}
                      </Typography>
                      <Box className={classes.occupancyBar}>
                        <Box
                          className={classes.occupancyFill}
                          style={{
                            width: `${Math.min(
                              ((destination.current_visitors || 0) /
                                destination.capacity) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </Box>
                    </Box>

                    {weather && (
                      <Box className={classes.infoItem}>
                        <Typography
                          variant="body2"
                          className={classes.infoLabel}
                        >
                          Current Weather
                        </Typography>
                        <Typography
                          variant="body1"
                          className={classes.infoValue}
                        >
                          {weather.temp}°C
                        </Typography>
                        <Typography
                          variant="body2"
                          className={classes.weatherDesc}
                        >
                          {weather.description}
                        </Typography>
                      </Box>
                    )}

                    {propIsAuthenticated && (
                      <Button
                        variant="contained"
                        onClick={handleBookNow}
                        className={classes.bookButton}
                        fullWidth
                        size="large"
                      >
                        Book Now
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default DestinationModal;
