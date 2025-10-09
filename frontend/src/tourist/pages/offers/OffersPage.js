// src/tourist/pages/offers/OffersPage.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Chip,
  Box,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAuth } from "../../../shared/context/AuthContext";
import axios from "axios"; // New import for API calls
import OfferCard from "../../components/offers/OfferCard";
import BookingForm from "../../components/bookings/BookingForm";
import classes from "./OffersPage.module.css";

function OffersPage() {
  const { destinationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedViewMode, setSelectedViewMode] = useState("Active");
  const [selectedDate, setSelectedDate] = useState(null);
  const [sortBy, setSortBy] = useState(
    destinationId ? "Price (Low to High)" : "Destination"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [destinationName, setDestinationName] = useState("");

  const token = isAuthenticated ? localStorage.getItem("token") : null;

  // Fetch destination name if destinationId is provided
  useEffect(() => {
    const fetchDestinationName = async () => {
      if (!destinationId) return;
      try {
        const url = isAuthenticated
          ? `http://localhost:3000/dest/api/v1/destinations/${destinationId}`
          : `http://localhost:3000/dest/api/v1/destinations/${destinationId}/public`;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(url, { headers });
        setDestinationName(res.data.name || "");
      } catch (err) {
        console.error("Failed to fetch destination name:", err);
      }
    };
    fetchDestinationName();
  }, [destinationId, token]);

  useEffect(() => {
    if (!token) {
      setError("Authentication required to view offers. Please log in.");
      setLoading(false);
      return;
    }
    fetchOffers();
  }, [destinationId, token]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [offers, selectedViewMode, selectedDate, sortBy, searchTerm]);

  const fetchOffers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      let url = "http://localhost:3000/dest/api/v1/offers";
      if (destinationId) {
        url += `?destination_id=${destinationId}`;
      }
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = res.data;
      // Map to include destinationNames for display
      const mappedData = data.map((offer) => ({
        ...offer,
        id: offer.offer_id,
        destinationNames:
          offer.destinations?.map((d) => d.name).filter(Boolean) || [],
      }));
      setOffers(mappedData);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch offers"
      );
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...offers];

    // View mode filter
    if (selectedViewMode !== "All") {
      filtered = filtered.filter(
        (offer) => offer.status === selectedViewMode.toLowerCase()
      );
    }

    // Date filter
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split("T")[0];
      filtered = filtered.filter((offer) => {
        const from = new Date(offer.available_from).toISOString().split("T")[0];
        const to = new Date(offer.available_to).toISOString().split("T")[0];
        return from <= dateStr && to >= dateStr;
      });
    }

    // Search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (offer) =>
          offer.name.toLowerCase().includes(lowerSearch) ||
          offer.description.toLowerCase().includes(lowerSearch) ||
          offer.destinationNames.some((name) =>
            name.toLowerCase().includes(lowerSearch)
          )
      );
    }

    // Sort
    let sorted = [...filtered];
    switch (sortBy) {
      case "Destination":
        // Single destination first, sorted by dest name; then multi by first dest
        const single = sorted
          .filter((o) => o.destinations.length === 1)
          .sort((a, b) =>
            a.destinations[0].name.localeCompare(b.destinations[0].name)
          );
        const multi = sorted
          .filter((o) => o.destinations.length > 1)
          .sort((a, b) =>
            a.destinations[0].name.localeCompare(b.destinations[0].name)
          );
        sorted = [...single, ...multi];
        break;
      case "Offer Name (A-Z)":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Offer Name (Z-A)":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Price (Low to High)":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "Price (High to Low)":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "Available From (Earliest)":
        sorted.sort(
          (a, b) => new Date(a.available_from) - new Date(b.available_from)
        );
        break;
      default:
        break;
    }
    setFilteredOffers(sorted);
  };

  const handleResetFilters = () => {
    setSelectedViewMode("Active");
    setSelectedDate(null);
    setSortBy(destinationId ? "Price (Low to High)" : "Destination");
    setSearchTerm("");
  };

  const handleOpenBookingModal = (offer) => {
    setSelectedOffer(offer);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:3000/dest/api/v1/bookings",
        {
          ...bookingData,
          userId: parseInt(localStorage.getItem("userId")),
          status: "pending",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setShowBookingModal(false);
      navigate("/tourist/bookings");
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to create booking"
      );
    }
  };

  if (loading) return <CircularProgress className={classes.loadingContainer} />;
  if (error)
    return (
      <Alert severity="error" className={classes.errorAlert}>
        {error}
      </Alert>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container className={classes.container}>
        <Typography variant="h4" className={classes.title}>
          {destinationId && destinationName
            ? `Offers for ${destinationName}`
            : destinationId
            ? "Offers for Selected Destination"
            : "All Offers"}
        </Typography>

        {destinationId && (
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={`Filtered by: ${destinationName || "Destination"}`}
              onDelete={() => navigate("/tourist/offers")}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        <Grid container spacing={2} className={classes.filtersContainer}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>View Mode</InputLabel>
              <Select
                value={selectedViewMode}
                label="View Mode"
                onChange={(e) => setSelectedViewMode(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Filter by Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
              clearable
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
                {destinationId ? (
                  <>
                    <MenuItem value="Price (Low to High)">
                      Price (Low to High)
                    </MenuItem>
                    <MenuItem value="Price (High to Low)">
                      Price (High to Low)
                    </MenuItem>
                    <MenuItem value="Offer Name (A-Z)">
                      Offer Name (A-Z)
                    </MenuItem>
                    <MenuItem value="Offer Name (Z-A)">
                      Offer Name (Z-A)
                    </MenuItem>
                    <MenuItem value="Available From (Earliest)">
                      Available From (Earliest)
                    </MenuItem>
                  </>
                ) : (
                  <>
                    <MenuItem value="Destination">
                      Destination (Singles First)
                    </MenuItem>
                    <MenuItem value="Offer Name (A-Z)">
                      Offer Name (A-Z)
                    </MenuItem>
                    <MenuItem value="Offer Name (Z-A)">
                      Offer Name (Z-A)
                    </MenuItem>
                    <MenuItem value="Price (Low to High)">
                      Price (Low to High)
                    </MenuItem>
                    <MenuItem value="Price (High to Low)">
                      Price (High to Low)
                    </MenuItem>
                    <MenuItem value="Available From (Earliest)">
                      Available From (Earliest)
                    </MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              className={classes.resetButton}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={2} className={classes.searchContainer}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by Offer Name, Description, or Destination"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchInput}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              className={classes.resetButton}
            >
              Reset Search
            </Button>
          </Grid>
        </Grid>

        {filteredOffers.length === 0 ? (
          <Typography
            className={classes.noResults}
            variant="h6"
            align="center"
            sx={{ mt: 4 }}
          >
            No offers found matching your criteria.
          </Typography>
        ) : (
          <Grid container spacing={3} className={classes.grid}>
            {filteredOffers.map((offer) => (
              <Grid item xs={12} sm={6} md={4} key={offer.id}>
                <OfferCard
                  offer={offer}
                  onBookNow={() => handleOpenBookingModal(offer)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {showBookingModal && selectedOffer && (
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <BookingForm
                offer={selectedOffer}
                onSubmit={handleBookingSubmit}
                onCancel={() => setShowBookingModal(false)}
              />
            </div>
          </div>
        )}
      </Container>
    </LocalizationProvider>
  );
}

export default OffersPage;
