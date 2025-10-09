// src/tourist/pages/bookings/BookingsPage.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { useAuth } from "../../../shared/context/AuthContext";
import axios from "axios"; // New import for API calls
import BookingList from "../../components/bookings/BookingList";
import classes from "./BookingsPage.module.css";

function BookingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [expiredBookings, setExpiredBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedViewMode, setSelectedViewMode] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [sortBy, setSortBy] = useState("Booking Date (Desc)");
  const [searchTerm, setSearchTerm] = useState("");

  const token = isAuthenticated ? localStorage.getItem("token") : null;
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!token) {
      setError("Authentication required. Please log in.");
      setLoading(false);
      return;
    }
    fetchBookings();
  }, [token]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `http://localhost:3000/dest/api/v1/users/${userId}/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = res.data;
      console.log("API Response:", data);

      const reviewsRes = await axios.get(
        `http://localhost:3000/dest/api/v1/users/${userId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const reviews = reviewsRes.data;
      const reviewedBookingIds = new Set(reviews.map((r) => r.booking_id));

      const now = new Date();
      const allBookings = data.map((b) => ({
        id: b.booking_id,
        bookingDate: b.booking_date,
        visitorCount: b.visitor_count,
        status: b.status,
        offerName: b.offer_name || "",
        destinationId: b.destination_id || null,
        offer: {
          name: b.offer_name || "",
          description: b.offer_description || "No description",
        },
        hasReview: reviewedBookingIds.has(b.booking_id),
      }));

      const active = allBookings.filter((b) => new Date(b.bookingDate) >= now);
      const expired = allBookings.filter((b) => new Date(b.bookingDate) < now);

      setBookings(allBookings);
      setActiveBookings(active);
      setExpiredBookings(expired);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch bookings"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [
    bookings,
    activeBookings,
    expiredBookings,
    selectedViewMode,
    selectedStatus,
    startDate,
    endDate,
    sortBy,
    searchTerm,
  ]);

  const applyFiltersAndSort = () => {
    const now = new Date();
    let sourceData = [];

    // Select which bookings to filter based on view mode
    if (selectedViewMode === "Upcoming") {
      sourceData = [...activeBookings];
    } else if (selectedViewMode === "Expired") {
      sourceData = [...expiredBookings];
    } else {
      // For "All", we'll handle this differently in the render
      return;
    }

    let filtered = sourceData;

    if (selectedStatus !== "All") {
      filtered = filtered.filter(
        (b) => b.status === selectedStatus.toLowerCase()
      );
    }

    if (startDate)
      filtered = filtered.filter((b) => {
        const date = new Date(b.bookingDate);
        return date >= startDate && !isNaN(date);
      });
    if (endDate)
      filtered = filtered.filter((b) => {
        const date = new Date(b.bookingDate);
        return date <= endDate && !isNaN(date);
      });

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.offerName.toLowerCase().includes(lowerSearch) ||
          (b.offer?.description || "").toLowerCase().includes(lowerSearch)
      );
    }

    let sorted = [...filtered];
    switch (sortBy) {
      case "Booking Date (Asc)":
        sorted.sort(
          (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate)
        );
        break;
      case "Booking Date (Desc)":
        sorted.sort(
          (a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)
        );
        break;
      case "Offer Name (A-Z)":
        sorted.sort((a, b) => a.offerName.localeCompare(b.offerName));
        break;
      case "Offer Name (Z-A)":
        sorted.sort((a, b) => b.offerName.localeCompare(a.offerName));
        break;
      case "Visitor Count (Low-High)":
        sorted.sort((a, b) => a.visitorCount - b.visitorCount);
        break;
      case "Visitor Count (High-Low)":
        sorted.sort((a, b) => b.visitorCount - a.visitorCount);
        break;
      default:
        break;
    }
    setFilteredBookings(sorted);
  };

  const handleResetFilters = () => {
    setSelectedViewMode("All");
    setSelectedStatus("All");
    setStartDate(null);
    setEndDate(null);
    setSortBy("Booking Date (Desc)");
    setSearchTerm("");
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
          My Bookings
        </Typography>

        <Grid container spacing={2} className={classes.filtersContainer}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>View Mode</InputLabel>
              <Select
                value={selectedViewMode}
                onChange={(e) => setSelectedViewMode(e.target.value)}
              >
                <MenuItem value="Upcoming">Upcoming</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
                <MenuItem value="All">All</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="Booking Date (Asc)">
                  Booking Date (Asc)
                </MenuItem>
                <MenuItem value="Booking Date (Desc)">
                  Booking Date (Desc)
                </MenuItem>
                <MenuItem value="Offer Name (A-Z)">Offer Name (A-Z)</MenuItem>
                <MenuItem value="Offer Name (Z-A)">Offer Name (Z-A)</MenuItem>
                <MenuItem value="Visitor Count (Low-High)">
                  Visitor Count (Low-High)
                </MenuItem>
                <MenuItem value="Visitor Count (High-Low)">
                  Visitor Count (High-Low)
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

        <Grid container spacing={2} className={classes.searchContainer}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by Offer Name or Description"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchInput}
            />
          </Grid>
        </Grid>

        {selectedViewMode === "All" ? (
          <>
            {activeBookings.length > 0 && (
              <div className={classes.bookingsSection}>
                <Typography
                  variant="h5"
                  className={classes.sectionTitle}
                  sx={{ mt: 4, mb: 2, color: "#ffffff", fontWeight: 600 }}
                >
                  Active Bookings
                </Typography>
                <BookingList
                  bookings={activeBookings}
                  onRefresh={fetchBookings}
                />
              </div>
            )}

            {expiredBookings.length > 0 && (
              <div className={classes.bookingsSection}>
                <Typography
                  variant="h5"
                  className={classes.sectionTitle}
                  sx={{ mt: 4, mb: 2, color: "#bdd1d4", fontWeight: 600 }}
                >
                  Booking History
                </Typography>
                <BookingList
                  bookings={expiredBookings}
                  onRefresh={fetchBookings}
                />
              </div>
            )}

            {activeBookings.length === 0 && expiredBookings.length === 0 && (
              <Alert
                severity="info"
                sx={{ mt: 3, maxWidth: "1200px", width: "100%" }}
              >
                No bookings found.
              </Alert>
            )}
          </>
        ) : (
          <div className={classes.bookingsSection}>
            <BookingList
              bookings={filteredBookings}
              onRefresh={fetchBookings}
            />
          </div>
        )}
      </Container>
    </LocalizationProvider>
  );
}

export default BookingsPage;
