// src/manager/pages/bookings/ManagerBookingsPage.js
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
import ManagerBookingList from "../../components/bookings/ManagerBookingList";
import Pagination from "../../../shared/components/common/Pagination";
import classes from "./ManagerBookingsPage.module.css";

function ManagerBookingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [paginatedBookings, setPaginatedBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedViewMode, setSelectedViewMode] = useState("All");
  const [startDate, setStartDate] = useState(null);
  const [sortBy, setSortBy] = useState("Booking Date (Asc)");
  const [searchTerm, setSearchTerm] = useState("");

  const ITEMS_PER_PAGE = 12;

  const token = isAuthenticated ? localStorage.getItem("token") : null;
  const operatorId = localStorage.getItem("userId"); // Assuming userId is operatorId for managers

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
      const res = await fetch(
        `http://localhost:3000/dest/api/v1/operators/${operatorId}/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      console.log("API Response:", data); // Debug log
      setBookings(
        data.map((b) => ({
          id: b.booking_id,
          bookingDate: b.booking_date,
          visitorCount: b.visitor_count,
          status: b.status,
          offerName: b.offer?.name || "",
          offer: b.offer || {
            name: b.offerName,
            description: "No description",
          }, // Fallback
          touristName: b.user?.name || "Anonymous", // Assuming API returns user info
          touristEmail: b.user?.email || "", // Assuming additional fields
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [bookings, selectedViewMode, startDate, sortBy, searchTerm]);

  const applyFiltersAndSort = () => {
    const now = new Date();
    let filtered = [...bookings];

    if (selectedViewMode === "Upcoming") {
      filtered = filtered.filter((b) => {
        const date = new Date(b.bookingDate);
        return date >= now && !isNaN(date);
      });
    } else if (selectedViewMode === "Expired") {
      filtered = filtered.filter((b) => {
        const date = new Date(b.bookingDate);
        return date < now && !isNaN(date);
      });
    }

    if (startDate)
      filtered = filtered.filter((b) => {
        const date = new Date(b.bookingDate);
        return date >= startDate && !isNaN(date);
      });

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.offerName.toLowerCase().includes(lowerSearch) ||
          b.offer?.description?.toLowerCase().includes(lowerSearch) ||
          b.touristName.toLowerCase().includes(lowerSearch) ||
          b.touristEmail.toLowerCase().includes(lowerSearch) ||
          ""
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Booking Date (Asc)":
          return new Date(a.bookingDate) - new Date(b.bookingDate);
        case "Booking Date (Desc)":
          return new Date(b.bookingDate) - new Date(a.bookingDate);
        case "Offer Name (A-Z)":
          return a.offerName.localeCompare(b.offerName);
        case "Offer Name (Z-A)":
          return b.offerName.localeCompare(a.offerName);
        case "Visitor Count (Low-High)":
          return a.visitorCount - b.visitorCount;
        case "Visitor Count (High-Low)":
          return b.visitorCount - a.visitorCount;
        case "Tourist Name (A-Z)":
          return a.touristName.localeCompare(b.touristName);
        case "Tourist Name (Z-A)":
          return b.touristName.localeCompare(a.touristName);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  };

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedBookings(filteredBookings.slice(startIndex, endIndex));
  }, [filteredBookings, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedViewMode, startDate, sortBy, searchTerm]);

  const handleResetFilters = () => {
    setSelectedViewMode("All");
    setStartDate(null);
    setSortBy("Booking Date (Asc)");
    setSearchTerm("");
  };

  if (loading) return <CircularProgress className={classes.loadingContainer} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" className={classes.container}>
        <Typography variant="h3" className={classes.title}>
          My Bookings
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
                <MenuItem value="Upcoming">Upcoming</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Filter by Date"
              value={startDate}
              onChange={setStartDate}
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
                <MenuItem value="Tourist Name (A-Z)">User Name (A-Z)</MenuItem>
                <MenuItem value="Tourist Name (Z-A)">User Name (Z-A)</MenuItem>
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

        <Grid container spacing={2} style={{ marginBottom: "1rem" }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by Offer, User Name, or Email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchInput}
              aria-label="Search bookings"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              onClick={() => navigate("/operator/offers")}
              className={classes.createButton}
              fullWidth
              size="large"
            >
              Manage Offers
            </Button>
          </Grid>
        </Grid>

        {filteredBookings.length === 0 ? (
          <div className={classes.noResultsContainer}>
            <Typography className={classes.noResults}>
              No bookings found yet. Bookings will appear here once customers
              book your offers!
            </Typography>
          </div>
        ) : (
          <>
            <ManagerBookingList
              bookings={paginatedBookings}
              onRefresh={fetchBookings}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredBookings.length / ITEMS_PER_PAGE)}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </Container>
    </LocalizationProvider>
  );
}

export default ManagerBookingsPage;
