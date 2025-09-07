// src/shared/pages/destinations/Destinations.js
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog, // Included for modal (though we'll use custom component)
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import classes from "./Destinations.module.css";
import DestinationModal from "../../components/destination/DestinationModal"; // New import

function Destinations() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Sort state
  const [sortBy, setSortBy] = useState("Name (A-Z)");

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);

      const today = format(selectedDate, "yyyy-MM-dd", {
        timeZone: "Pacific/Auckland",
      });
      const token = isAuthenticated ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = new URLSearchParams();
      if (selectedStatus !== "All") params.append("status", selectedStatus);
      if (selectedAvailability !== "All")
        params.append("availability", selectedAvailability);
      params.append("date", today);

      const apiUrl = isAuthenticated
        ? `http://localhost:3000/dest/api/v1/destinations?${params.toString()}`
        : `http://localhost:3000/dest/api/v1/destinations/public?${params.toString()}`;

      console.log("Fetching with params:", params.toString());
      const response = await fetch(apiUrl, { headers });
      if (!response.ok) {
        throw new Error(`Failed to fetch destinations: ${response.statusText}`);
      }
      const data = await response.json();
      setDestinations(data);
      applySearchAndSort(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [isAuthenticated, selectedStatus, selectedAvailability, selectedDate]);

  const applySearchAndSort = (data) => {
    let filtered = data.filter((dest) =>
      dest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Name (A-Z)":
          return a.name.localeCompare(b.name);
        case "Name (Z-A)":
          return b.name.localeCompare(a.name);
        case "Visitors (Low to High)":
          return (a.current_visitors || 0) - (b.current_visitors || 0);
        case "Visitors (High to Low)":
          return (b.current_visitors || 0) - (a.current_visitors || 0);
        case "Capacity (Low to High)":
          return a.capacity - b.capacity;
        case "Capacity (High to Low)":
          return b.capacity - a.capacity;
        default:
          return 0;
      }
    });

    setFilteredDestinations(filtered);
  };

  useEffect(() => {
    applySearchAndSort(destinations);
  }, [searchTerm, sortBy, destinations]);

  const handleBookNow = (destinationId) => {
    navigate(`/book/${destinationId}`);
  };

  const handleViewDetails = (destinationId) => {
    setSelectedDestinationId(destinationId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDestinationId(null);
  };

  const handleResetFilters = () => {
    setSelectedStatus("All");
    setSelectedAvailability("All");
    setSelectedDate(new Date());
    setSearchTerm("");
    setSortBy("Name (A-Z)");
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" className={classes.container}>
        <Typography variant="h3" className={classes.title}>
          Explore Destinations
        </Typography>

        <Grid container spacing={2} className={classes.filtersContainer}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select
                value={selectedAvailability}
                label="Availability"
                onChange={(e) => setSelectedAvailability(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Full">Full</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue || new Date())}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="Name (A-Z)">Name (A-Z)</MenuItem>
                <MenuItem value="Name (Z-A)">Name (Z-A)</MenuItem>
                <MenuItem value="Visitors (Low to High)">
                  Visitors (Low to High)
                </MenuItem>
                <MenuItem value="Visitors (High to Low)">
                  Visitors (High to Low)
                </MenuItem>
                <MenuItem value="Capacity (Low to High)">
                  Capacity (Low to High)
                </MenuItem>
                <MenuItem value="Capacity (High to Low)">
                  Capacity (High to Low)
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={2} className={classes.searchResetContainer}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by Destination Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchInput}
              aria-label="Search destinations"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              className={classes.resetButton}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>

        {filteredDestinations.length === 0 ? (
          <Typography className={classes.noResults}>
            No destinations found.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredDestinations.map((dest) => (
              <Grid item xs={12} sm={6} md={4} key={dest.destination_id}>
                <Card className={classes.card}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      "/images/destinations/" +
                      (dest.thumbnail ||
                        "/images/destinations/default-thumbnail.jpg")
                    }
                    alt={dest.name}
                    onClick={() => handleViewDetails(dest.destination_id)}
                    style={{ cursor: "pointer" }}
                  />
                  <CardContent className={classes.cardContent}>
                    <div
                      onClick={() => handleViewDetails(dest.destination_id)}
                      style={{ cursor: "pointer" }}
                    >
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
                        {dest.capacity}
                      </Typography>
                      <Typography
                        variant="body1"
                        className={classes.cardStatus}
                      >
                        Status: {dest.status}
                      </Typography>
                    </div>
                    {isAuthenticated && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(dest.destination_id);
                        }}
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

        <DestinationModal
          open={openModal}
          onClose={handleCloseModal}
          destinationId={selectedDestinationId}
          isAuthenticated={isAuthenticated}
        />
      </Container>
    </LocalizationProvider>
  );
}

export default Destinations;
