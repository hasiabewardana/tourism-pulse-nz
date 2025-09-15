import { useState, useEffect } from "react";
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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import OfferForm from "./OfferForm";
import classes from "./OfferManagement.module.css";
import Offer from "./Offer";

function OfferList() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [userName, setUserName] = useState("");
  const [operatorDestinations, setOperatorDestinations] = useState([]);

  // Filter states
  const [selectedViewMode, setSelectedViewMode] = useState("All");
  const [selectedDate, setSelectedDate] = useState(null); // Initialize to null for no date filter

  // Sort and search states
  const [sortBy, setSortBy] = useState("Offer Name (A-Z)");
  const [searchTerm, setSearchTerm] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchUserName = async () => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3000/dest/api/v1/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUserName(data.name || "Operator");
    } catch (err) {
      console.error("Error fetching user:", err);
      setUserName("Operator");
    }
  };

  const fetchOperatorDestinations = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      setError("No authentication token or user ID found. Please log in.");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3000/dest/api/v1/operator-destinations/operator/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch operator destinations");
      const data = await res.json();
      setOperatorDestinations(data);
    } catch (err) {
      console.error("Error fetching operator destinations:", err);
      setError("Failed to fetch operator destinations.");
    }
  };

  // Fetch offers with filters
  const fetchOffers = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      setError("No authentication token or user ID found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build the API URL, omitting date if selectedDate is null
      const baseUrl = `http://localhost:3000/dest/api/v1/offers/operator/${userId}`;
      const url = selectedDate ? `${baseUrl}?date=${selectedDate}` : baseUrl;

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("fetchOffers response:", JSON.stringify(data, null, 2));
      // Map the response to include userName and extract destinationNames
      const mappedData = data.map((offer) => ({
        ...offer,
        id: offer.offer_id, // Ensure id is set for Offer component
        operatorName: userName,
        destinationNames:
          offer.destinations?.map((d) => d.name).filter(Boolean) || [],
        destination_ids:
          offer.destinations?.map((d) => d.id).filter(Boolean) || [],
      }));
      setOffers(mappedData);
      applySearchAndSort(mappedData);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError("Failed to fetch offers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserName();
    fetchOperatorDestinations();
  }, []);

  useEffect(() => {
    if (userName) {
      fetchOffers();
    }
  }, [selectedDate, userName]);

  const applySearchAndSort = (data) => {
    let filtered = data.filter(
      (offer) =>
        (selectedViewMode === "All" ||
          offer.status === selectedViewMode.toLowerCase()) &&
        (offer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.operatorName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          offer.destinationNames?.some((name) =>
            name?.toLowerCase().includes(searchTerm.toLowerCase())
          ))
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Offer Name (A-Z)":
          return a.name.localeCompare(b.name);
        case "Offer Name (Z-A)":
          return b.name.localeCompare(a.name);
        case "Price (Low to High)":
          return a.price - b.price;
        case "Price (High to Low)":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    setFilteredOffers(filtered);
  };

  useEffect(() => {
    applySearchAndSort(offers);
  }, [searchTerm, sortBy, offers, selectedViewMode]);

  const handleSubmit = async (formData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found.");
      return;
    }

    try {
      setError(null);
      const method = selectedOffer ? "PUT" : "POST";
      const url = selectedOffer
        ? `http://localhost:3000/dest/api/v1/offers/${selectedOffer.id}`
        : "http://localhost:3000/dest/api/v1/offers";
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operator_id: parseInt(userId),
          ...formData,
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setShowModal(false);
      setSelectedOffer(null);
      fetchOffers();
    } catch (err) {
      console.error("Error submitting offer:", err);
      setError("Failed to submit offer.");
    }
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        `http://localhost:3000/dest/api/v1/offers/${offerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      fetchOffers();
    } catch (err) {
      console.error("Error deleting offer:", err);
      setError("Failed to delete offer.");
    }
  };

  const handleEdit = (offer) => {
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedOffer(null);
    setShowModal(true);
  };

  const handleResetFilters = () => {
    setSelectedViewMode("All");
    setSelectedDate(null); // Clear date filter
    setSearchTerm("");
    setSortBy("Offer Name (A-Z)");
  };

  if (loading) {
    return (
      <Container className={classes.loadingContainer}>
        <CircularProgress color="primary" />
      </Container>
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
      <Container className={classes.container}>
        <Typography variant="h3" className={classes.title}>
          My Offers
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
                <MenuItem value="Offer Name (A-Z)">Offer Name (A-Z)</MenuItem>
                <MenuItem value="Offer Name (Z-A)">Offer Name (Z-A)</MenuItem>
                <MenuItem value="Price (Low to High)">
                  Price (Low to High)
                </MenuItem>
                <MenuItem value="Price (High to Low)">
                  Price (High to Low)
                </MenuItem>
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

        <Grid container spacing={2} className={classes.searchResetContainer}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by Offer or Destination Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchInput}
              aria-label="Search offers"
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

        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          className={classes.createButton}
        >
          Create New Offer
        </Button>

        {filteredOffers.length === 0 ? (
          <Typography className={classes.noResults}>
            No offers found.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredOffers.map((offer) => (
              <Grid item xs={12} sm={6} md={4} key={offer.id}>
                <Offer
                  offer={offer}
                  operatorName={userName}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {showModal && (
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <OfferForm
                offer={selectedOffer}
                destinations={operatorDestinations}
                userId={userId}
                onSubmit={handleSubmit}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </Container>
    </LocalizationProvider>
  );
}

export default OfferList;
