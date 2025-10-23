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
import axios from "axios";
import OfferCard from "../../components/offers/OfferCard";
import BookingForm from "../../components/bookings/BookingForm";
import Pagination from "../../../shared/components/common/Pagination";
import classes from "./OffersPage.module.css";

function OffersPage() {
  const { destinationId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [paginatedOffers, setPaginatedOffers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
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

  const ITEMS_PER_PAGE = 12;
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
    // eslint-disable-next-line
  }, [destinationId, token]);

  useEffect(() => {
    console.log("useEffect triggered - sortBy:", sortBy);
    const applyFiltersAndSortInner = () => {
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
          const from = new Date(offer.available_from)
            .toISOString()
            .split("T")[0];
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
      console.log("Sorting by:", sortBy);
      console.log(
        "Before sort:",
        sorted.map((o) => ({ name: o.name, price: o.price }))
      );

      switch (sortBy) {
        case "Destination":
          sorted.sort((a, b) => {
            const aHasDest = a.destinations && a.destinations.length > 0;
            const bHasDest = b.destinations && b.destinations.length > 0;

            if (!aHasDest && !bHasDest) return 0;
            if (!aHasDest) return 1;
            if (!bHasDest) return -1;

            const aName = a.destinations[0].name || "";
            const bName = b.destinations[0].name || "";
            return aName.localeCompare(bName);
          });
          break;
        case "Offer Name (A-Z)":
        case "Name (A-Z)":
          sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
          break;
        case "Offer Name (Z-A)":
        case "Name (Z-A)":
          sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
          break;
        case "Price (Low to High)":
          sorted.sort(
            (a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)
          );
          break;
        case "Price (High to Low)":
          sorted.sort(
            (a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)
          );
          break;
        case "Available From (Earliest)":
          sorted.sort((a, b) => {
            const dateA = a.available_from
              ? new Date(a.available_from)
              : new Date(0);
            const dateB = b.available_from
              ? new Date(b.available_from)
              : new Date(0);
            return dateA - dateB;
          });
          break;
        default:
          console.log("No matching sort case for:", sortBy);
          break;
      }

      console.log(
        "After sort:",
        sorted.map((o) => ({ name: o.name, price: o.price }))
      );
      setFilteredOffers(sorted);
    };

    applyFiltersAndSortInner();
  }, [offers, selectedViewMode, selectedDate, sortBy, searchTerm]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedOffers(filteredOffers.slice(startIndex, endIndex));
  }, [filteredOffers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedViewMode, selectedDate, sortBy, searchTerm]);

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
      console.log("Raw offer data:", data);
      // Map to include destinationNames for display
      const mappedData = data.map((offer) => {
        const destNames =
          offer.destinations?.map((d) => d.name).filter(Boolean) || [];
        console.log(
          `Offer ${offer.name} destinations:`,
          offer.destinations,
          "mapped to:",
          destNames
        );
        return {
          ...offer,
          id: offer.offer_id,
          destinationNames: destNames,
        };
      });
      console.log("Mapped offer data:", mappedData);
      setOffers(mappedData);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch offers"
      );
    } finally {
      setLoading(false);
    }
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
    const userId = parseInt(localStorage.getItem("userId"));

    const payload = {
      offerId: bookingData.offerId,
      userId: userId,
      bookingDate: bookingData.bookingDate,
      visitorCount: bookingData.visitorCount,
      status: "pending",
    };

    console.log("Booking payload:", payload);

    try {
      const res = await axios.post(
        "http://localhost:3000/dest/api/v1/bookings",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Booking created successfully:", res.data);
      setShowBookingModal(false);
      navigate("/tourist/bookings");
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Failed to create booking"
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

        <Box className={classes.filterPanel}>
          <Box className={classes.topRow}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by Offer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchInput}
              sx={{ flex: 1 }}
            />
            <Box className={classes.sortByContainer}>
              <Typography className={classes.sortByLabel}>Sort By</Typography>
              <FormControl className={classes.sortBySelect}>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  displayEmpty
                  variant="outlined"
                >
                  {destinationId ? (
                    <>
                      <MenuItem value="Price (Low to High)">
                        Price (Low to High)
                      </MenuItem>
                      <MenuItem value="Price (High to Low)">
                        Price (High to Low)
                      </MenuItem>
                      <MenuItem value="Offer Name (A-Z)">Name (A-Z)</MenuItem>
                      <MenuItem value="Offer Name (Z-A)">Name (Z-A)</MenuItem>
                      <MenuItem value="Available From (Earliest)">
                        Available From (Earliest)
                      </MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem value="Destination">Destination</MenuItem>
                      <MenuItem value="Offer Name (A-Z)">Name (A-Z)</MenuItem>
                      <MenuItem value="Offer Name (Z-A)">Name (Z-A)</MenuItem>
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
            </Box>
          </Box>

          <Box className={classes.bottomRow}>
            <Box className={classes.filterGroup}>
              <Typography className={classes.filterLabel}>Status</Typography>
              <FormControl className={classes.filterSelect}>
                <Select
                  value={selectedViewMode}
                  onChange={(e) => setSelectedViewMode(e.target.value)}
                  displayEmpty
                  variant="outlined"
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box className={classes.filterGroup}>
              <Typography className={classes.filterLabel}>
                Select Date
              </Typography>
              <DatePicker
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    placeholder: "10/10/2025",
                    className: classes.datePicker,
                  },
                }}
              />
            </Box>

            <Button
              variant="outlined"
              onClick={handleResetFilters}
              className={classes.resetButton}
            >
              RESET
            </Button>
          </Box>
        </Box>

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
          <>
            <Grid container spacing={3} className={classes.grid}>
              {paginatedOffers.map((offer) => (
                <Grid item xs={12} sm={6} md={4} key={offer.id}>
                  <OfferCard
                    offer={offer}
                    onBookNow={() => handleOpenBookingModal(offer)}
                  />
                </Grid>
              ))}
            </Grid>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredOffers.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </>
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
