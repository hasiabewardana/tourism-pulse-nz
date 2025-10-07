import { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import DestinationCard from "./DestinationCard";
import DestinationForm from "./DestinationForm";
import classes from "./DestinationList.module.css";
import { NZ_REGIONS } from "../../../util/regionParser";

function DestinationList() {
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
  );

  // Sort and search states
  const [sortBy, setSortBy] = useState("Name (A-Z)");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch destinations with filters
  const fetchDestinations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (selectedStatus !== "All") params.status = selectedStatus;
      if (selectedAvailability !== "All")
        params.availability = selectedAvailability;
      if (selectedRegion !== "All") params.region = selectedRegion;
      if (selectedDate) params.date = selectedDate;

      const config = {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.get(
        "http://localhost:3000/dest/api/v1/destinations",
        config
      );
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

  useEffect(() => {
    fetchDestinations();
  }, [selectedStatus, selectedAvailability, selectedRegion, selectedDate]);

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

  const handleSubmit = async (destData) => {
    const token = localStorage.getItem("token");
    const url = selectedDestination
      ? `http://localhost:3000/dest/api/v1/destinations/${selectedDestination.destination_id}`
      : "http://localhost:3000/dest/api/v1/destinations";

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      let response;
      if (selectedDestination) {
        response = await axios.put(url, destData, config);
      } else {
        response = await axios.post(url, destData, config);
      }

      fetchDestinations();
      setShowModal(false);
      setSelectedDestination(null);
    } catch (error) {
      console.error("Error saving destination:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to save destination";
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this destination?"))
      return;
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      await axios.delete(
        `http://localhost:3000/dest/api/v1/destinations/${id}`,
        config
      );
      fetchDestinations();
    } catch (error) {
      console.error("Error deleting destination:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to delete destination";
      setError(errorMessage);
    }
  };

  const handleEdit = (destination) => {
    setSelectedDestination(destination);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedDestination(null);
    setShowModal(true);
  };

  const handleResetFilters = () => {
    setSelectedStatus("All");
    setSelectedAvailability("All");
    setSelectedRegion("All");
    setSelectedDate(
      new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
    );
    setSearchTerm("");
    setSortBy("Name (A-Z)");
  };

  if (loading)
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress color="primary" />
      </div>
    );
  if (error)
    return (
      <Alert severity="error" className={classes.errorAlert}>
        {error}
      </Alert>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" className={classes.container}>
        <Typography variant="h3" className={classes.title}>
          Destination Management
        </Typography>

        {/* Filter Options Row */}
        <Grid container spacing={2} className={classes.filtersContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
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
            <Grid item xs={12} md={3}>
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
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreate}
                className={classes.createButton}
                fullWidth
              >
                Create New Destination
              </Button>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                value={selectedRegion}
                label="Region"
                onChange={(e) => setSelectedRegion(e.target.value)}
              >
                <MenuItem value="All">All Regions</MenuItem>
                {NZ_REGIONS.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Date"
              value={selectedDate ? new Date(selectedDate) : null}
              onChange={(newValue) => {
                if (newValue) {
                  const formattedDate = newValue.toLocaleDateString("en-CA", {
                    timeZone: "Pacific/Auckland",
                  });
                  setSelectedDate(formattedDate);
                }
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              className={classes.resetButton}
              fullWidth
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>

        {filteredDestinations.length === 0 ? (
          <div className={classes.noResultsContainer}>
            <Typography className={classes.noResults}>
              No destinations found matching your criteria.
            </Typography>
          </div>
        ) : (
          <div className={classes.destinationsGrid}>
            {filteredDestinations.map((destination) => (
              <DestinationCard
                key={destination.destination_id}
                destination={destination}
                selectedDate={selectedDate}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <Dialog
          open={showModal}
          onClose={() => setShowModal(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            className: classes.dialogPaper,
          }}
        >
          <DialogTitle className={classes.dialogTitle}>
            {selectedDestination
              ? "Edit Destination"
              : "Create New Destination"}
            <IconButton
              aria-label="close"
              onClick={() => setShowModal(false)}
              className={classes.closeButton}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className={classes.dialogContent}>
            <DestinationForm
              destination={selectedDestination}
              onSubmit={handleSubmit}
              onCancel={() => setShowModal(false)}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}

export default DestinationList;
