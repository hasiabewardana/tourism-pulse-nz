import { useState, useEffect } from "react";
import {
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
  Snackbar,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import OfferForm from "./OfferForm";
import Pagination from "../../../shared/components/common/Pagination";
import classes from "./OfferManagement.module.css";
import Offer from "./Offer";

function OfferList() {
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [paginatedOffers, setPaginatedOffers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [userName, setUserName] = useState("");
  const [operatorDestinations, setOperatorDestinations] = useState([]);

  const ITEMS_PER_PAGE = 12;

  // Filter states
  const [selectedViewMode, setSelectedViewMode] = useState("All");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
  );

  // Sort and search states
  const [sortBy, setSortBy] = useState("Offer Name (A-Z)");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Helper to handle API response status for empty results
  const handleEmptyResponse = (res) => {
    if (res.status === 404 || res.status === 204) {
      return []; // Treat as empty success
    }
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return null; // Proceed to parse JSON
  };

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

      // Handle empty response statuses as success with empty array
      const emptyData = handleEmptyResponse(res);
      let data = emptyData ?? (await res.json());

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

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedOffers(filteredOffers.slice(startIndex, endIndex));
  }, [filteredOffers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, selectedViewMode, selectedDate]);

  const handleSubmit = async (formData) => {
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

      // Show success notification
      setNotification({
        open: true,
        message: selectedOffer
          ? `✅ Successfully updated ${formData.name || "offer"}`
          : `✅ Successfully created ${formData.name || "new offer"}`,
        severity: "success",
      });
    } catch (err) {
      console.error("Error submitting offer:", err);
      setError("Failed to submit offer.");
    }
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchOffers();

      // Show success notification
      const offerName = offers.find((o) => o.id === offerId)?.name || "Offer";
      setNotification({
        open: true,
        message: `✅ Successfully deleted ${offerName}`,
        severity: "success",
      });
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
    setSelectedDate(
      new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
    );
    setSearchTerm("");
    setSortBy("Offer Name (A-Z)");
  };

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress color="primary" />
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
      <div className={classes.container}>
        {/* Filters Container */}
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
              value={selectedDate ? new Date(selectedDate) : null}
              onChange={(newValue) =>
                setSelectedDate(
                  newValue
                    ? newValue.toLocaleDateString("en-CA", {
                        timeZone: "Pacific/Auckland",
                      })
                    : new Date().toLocaleDateString("en-CA", {
                        timeZone: "Pacific/Auckland",
                      })
                )
              }
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
              fullWidth
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>

        {/* Search Input */}
        <Grid container spacing={2} style={{ marginBottom: "1rem" }}>
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
              variant="contained"
              onClick={handleCreate}
              className={classes.createButton}
              fullWidth
              size="large"
            >
              Create New Offer
            </Button>
          </Grid>
        </Grid>

        {/* Offers Grid */}
        {filteredOffers.length === 0 ? (
          <div className={classes.noResultsContainer}>
            <Typography className={classes.noResults}>
              No offers found yet. Start by creating your first one above!
            </Typography>
          </div>
        ) : (
          <>
            <div className={classes.offersGrid}>
              {paginatedOffers.map((offer) => (
                <Offer
                  key={offer.id}
                  offer={offer}
                  operatorName={userName}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredOffers.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </>
        )}

        {/* Modal */}
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

        {/* Notifications */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
}

export default OfferList;
