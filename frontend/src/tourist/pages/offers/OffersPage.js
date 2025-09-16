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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAuth } from "../../../shared/context/AuthContext";
import OfferCard from "../../components/offers/OfferCard";
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

  const token = isAuthenticated ? localStorage.getItem("token") : null;

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
      const params = new URLSearchParams();
      if (destinationId) {
        params.append("destination_id", destinationId);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch offers: ${res.statusText}`);
      }
      const data = await res.json();
      // Map to include destinationNames for display
      const mappedData = data.map((offer) => ({
        ...offer,
        id: offer.offer_id,
        destinationNames:
          offer.destinations?.map((d) => d.name).filter(Boolean) || [],
      }));
      setOffers(mappedData);
    } catch (err) {
      setError(err.message);
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
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case "Price (High to Low)":
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case "Available From (Earliest)":
        sorted.sort(
          (a, b) => new Date(a.available_from) - new Date(b.available_from)
        );
        break;
      default:
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredOffers(sorted);
  };

  const handleResetFilters = () => {
    setSelectedViewMode("Active");
    setSelectedDate(null);
    setSortBy(destinationId ? "Price (Low to High)" : "Destination");
    setSearchTerm("");
  };

  const pageTitle = destinationId
    ? `Offers for ${offers[0]?.destinations?.[0]?.name || "Destination"}`
    : "All Offers";

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
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" className={classes.container}>
        <Typography variant="h3" className={classes.title}>
          {pageTitle}
        </Typography>

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
                  onBookNow={() => navigate(`/tourist/book/${offer.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </LocalizationProvider>
  );
}

export default OffersPage;
