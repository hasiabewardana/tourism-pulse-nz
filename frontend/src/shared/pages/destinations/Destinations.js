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
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const applySearchAndSort = (data) => {
    let filtered = [...data];

    // Search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(lowerSearch) ||
          dest.description.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort
    switch (sortBy) {
      case "Name (A-Z)":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Name (Z-A)":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Capacity (Low to High)":
        filtered.sort((a, b) => a.capacity - b.capacity);
        break;
      case "Capacity (High to Low)":
        filtered.sort((a, b) => b.capacity - a.capacity);
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredDestinations(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    applySearchAndSort(destinations);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    fetchDestinations();
  };

  const handleAvailabilityChange = (e) => {
    setSelectedAvailability(e.target.value);
    fetchDestinations();
  };

  const handleDateChange = (newValue) => {
    setSelectedDate(newValue || new Date());
    fetchDestinations();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    applySearchAndSort(destinations);
  };

  const handleResetFilters = () => {
    setSelectedStatus("All");
    setSelectedAvailability("All");
    setSelectedDate(new Date());
    setSortBy("Name (A-Z)");
    setSearchTerm("");
    fetchDestinations();
  };

  const handleViewDetails = (destinationId) => {
    setSelectedDestinationId(destinationId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDestinationId(null);
  };

  const handleBookNow = (destinationId) => {
    navigate(`/tourist/offers/${destinationId}`);
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    applySearchAndSort(destinations);
  }, [searchTerm, sortBy]);

  if (loading) {
    return (
      <Container maxWidth="lg" className={classes.loadingContainer}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" className={classes.errorAlert}>
          {error}
        </Alert>
      </Container>
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
                onChange={handleStatusChange}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select
                value={selectedAvailability}
                label="Availability"
                onChange={handleAvailabilityChange}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="full">Full</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="Name (A-Z)">Name (A-Z)</MenuItem>
                <MenuItem value="Name (Z-A)">Name (Z-A)</MenuItem>
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
              label="Search Destinations"
              value={searchTerm}
              onChange={handleSearchChange}
              className={classes.searchInput}
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
                        See Offers
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
