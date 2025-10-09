import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  TextField,
  Grid,
  Typography,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import DestinationCard from "./DestinationCard";
import DestinationModal from "./DestinationModal";
import classes from "./DestinationList.module.css";

function DestinationList() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
  );
  const [sortBy, setSortBy] = useState("Name (A-Z)");
  const [selectedRegion, setSelectedRegion] = useState("All");

  const [openModal, setOpenModal] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = isAuthenticated ? localStorage.getItem("token") : null;

      const params = {};
      if (selectedStatus !== "All") params.status = selectedStatus;
      if (selectedAvailability !== "All")
        params.availability = selectedAvailability;
      if (selectedDate) params.date = selectedDate;

      const apiUrl = isAuthenticated
        ? "http://localhost:3000/dest/api/v1/destinations"
        : "http://localhost:3000/dest/api/v1/destinations/public";

      const config = {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };

      const response = await axios.get(apiUrl, config);
      setDestinations(response.data);
      applySearchAndSort(response.data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch destinations";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const applySearchAndSort = (data) => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(lowerSearch) ||
          dest.description.toLowerCase().includes(lowerSearch) ||
          (dest.locationName &&
            dest.locationName.toLowerCase().includes(lowerSearch)) ||
          (dest.region && dest.region.toLowerCase().includes(lowerSearch))
      );
    }

    // Apply region filter for nearby locations
    if (selectedRegion !== "All") {
      filtered = filtered.filter((dest) => dest.region === selectedRegion);
    }

    // Apply sorting
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
      case "Distance (Nearest First)":
        // This would require user location - for now sort by name
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Popularity (Most Popular)":
        filtered.sort(
          (a, b) => (b.current_visitors || 0) - (a.current_visitors || 0)
        );
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredDestinations(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleAvailabilityChange = (e) => {
    setSelectedAvailability(e.target.value);
  };

  const handleDateChange = (newValue) => {
    if (newValue) {
      const formattedDate = newValue.toLocaleDateString("en-CA", {
        timeZone: "Pacific/Auckland",
      });
      setSelectedDate(formattedDate);
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
  };

  const handleResetFilters = () => {
    setSelectedStatus("All");
    setSelectedAvailability("All");
    setSelectedDate(
      new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
    );
    setSortBy("Name (A-Z)");
    setSelectedRegion("All");
    setSearchTerm("");
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
  }, [selectedStatus, selectedAvailability, selectedDate]);

  useEffect(() => {
    applySearchAndSort(destinations);
  }, [searchTerm, sortBy, selectedRegion, destinations]);

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
      </div>
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
      <div>
        <Grid container spacing={2} className={classes.filtersContainer}>
          {/* Primary Row */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search by Destination Name"
                value={searchTerm}
                onChange={handleSearchChange}
                className={classes.searchInput}
                aria-label="Search destinations"
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
                  <MenuItem value="Distance (Nearest First)">
                    Distance (Nearest First)
                  </MenuItem>
                  <MenuItem value="Popularity (Most Popular)">
                    Popularity (Most Popular)
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          {/* Secondary Row */}
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Availability</InputLabel>
              <Select
                value={selectedAvailability}
                label="Availability"
                onChange={handleAvailabilityChange}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Available">Available</MenuItem>
                <MenuItem value="Full">Full</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                value={selectedRegion}
                label="Region"
                onChange={handleRegionChange}
              >
                <MenuItem value="All">All Regions</MenuItem>
                <MenuItem value="Auckland">Auckland</MenuItem>
                <MenuItem value="Wellington">Wellington</MenuItem>
                <MenuItem value="Canterbury">Canterbury</MenuItem>
                <MenuItem value="Otago">Otago</MenuItem>
                <MenuItem value="Bay of Plenty">Bay of Plenty</MenuItem>
                <MenuItem value="Waikato">Waikato</MenuItem>
                <MenuItem value="Northland">Northland</MenuItem>
                <MenuItem value="Hawke's Bay">Hawke's Bay</MenuItem>
                <MenuItem value="West Coast">West Coast</MenuItem>
                <MenuItem value="Southland">Southland</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DatePicker
              label="Select Date"
              value={selectedDate ? new Date(selectedDate) : null}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              className={classes.resetButton}
              fullWidth
            >
              Reset
            </Button>
          </Grid>
        </Grid>

        {filteredDestinations.length === 0 ? (
          <div className={classes.noResultsContainer}>
            <Typography className={classes.noResults}>
              No destinations found.
            </Typography>
          </div>
        ) : (
          <div className={classes.destinationsGrid}>
            {filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.destination_id}
                destination={dest}
                onViewDetails={handleViewDetails}
                onBookNow={handleBookNow}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}

        <DestinationModal
          open={openModal}
          onClose={handleCloseModal}
          destinationId={selectedDestinationId}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </LocalizationProvider>
  );
}

export default DestinationList;
