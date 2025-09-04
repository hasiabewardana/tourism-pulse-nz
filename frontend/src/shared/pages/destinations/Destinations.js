// src/shared/pages/common/Destinations.js
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // For auth check
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import classes from "./Destinations.module.css";

function Destinations() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch destinations based on authentication status
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const token = isAuthenticated ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const apiUrl = isAuthenticated
          ? "http://localhost:3000/dest/api/v1/destinations"
          : "http://localhost:3000/dest/api/v1/destinations/public";

        const response = await fetch(apiUrl, {
          headers,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch destinations");
        }
        const data = await response.json();
        setDestinations(data);
        setFilteredDestinations(data); // Initial filter set to all
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [isAuthenticated]);

  // Handle search filtering
  useEffect(() => {
    const filtered = destinations.filter((dest) =>
      dest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDestinations(filtered);
  }, [searchTerm, destinations]);

  const handleBookNow = (destinationId) => {
    // Navigate to booking page or modal (assuming /book/:id route)
    navigate(`/book/${destinationId}`);
  };

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className={classes.errorAlert}>
        {error}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Typography variant="h2" className={classes.title}>
        Explore Destinations
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        label="Search by Destination Name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={classes.searchInput}
        aria-label="Search destinations"
      />
      {filteredDestinations.length === 0 ? (
        <Typography className={classes.noResults}>
          No destinations found.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredDestinations.map((dest) => (
            <Grid item xs={12} sm={6} md={4} key={dest.id}>
              <Card className={classes.card}>
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    "/images/destinations/" + dest.thumbnail ||
                    "/images/destinations/default-thumbnail.jpg"
                  } // Fallback image
                  alt={dest.name}
                />
                <CardContent className={classes.cardContent}>
                  <Typography variant="h5" className={classes.cardTitle}>
                    {dest.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    className={classes.cardDescription}
                  >
                    {dest.description}
                  </Typography>
                  <Typography variant="body1" className={classes.cardInfo}>
                    Current Visitors: {dest.current_visitors} /{" "}
                    {dest.maxCapacity}
                  </Typography>
                  <Typography variant="body1" className={classes.cardStatus}>
                    Status: {dest.status}
                  </Typography>
                  {isAuthenticated && (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleBookNow(dest.id)}
                      className={classes.bookButton}
                    >
                      Book Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Destinations;
