// src/shared/pages/map/Map.js
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import classes from "./Map.module.css"; // New styles file

// Fix Leaflet default icon paths (common React issue)
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
};

// Custom icon based on capacity
const createCustomIcon = (capacity) => {
  let color = "green";
  if (capacity > 80) color = "red";
  else if (capacity > 50) color = "orange";
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

function Map() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [geocodedDestinations, setGeocodedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortBy, setSortBy] = useState("Name (A-Z)");
  const mapRef = useRef(null);

  // Fetch destinations (mirrors Destinations.js)
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
      const response = await fetch(apiUrl, { headers });
      if (!response.ok)
        throw new Error(`Failed to fetch: ${response.statusText}`);
      const data = await response.json();
      setDestinations(data);
      applySearchAndSort(data); // Initial apply
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Geocode destinations if lat/lon missing
  const geocodeDestination = async (dest) => {
    const cacheKey = `geo_${dest.name}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          dest.name + ", New Zealand"
        )}&limit=1`
      );
      const data = await response.json();
      if (data[0]) {
        const { lat, lon } = data[0];
        const geo = { lat: parseFloat(lat), lon: parseFloat(lon) };
        localStorage.setItem(cacheKey, JSON.stringify(geo));
        return geo;
      }
    } catch (err) {
      console.error(`Geocode error for ${dest.name}:`, err);
    }
    return { lat: -41, lon: 174 }; // Fallback to NZ center
  };

  // Apply search and sort, then geocode
  const applySearchAndSort = async (data) => {
    let filtered = [...data];
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(lowerSearch) ||
          dest.description.toLowerCase().includes(lowerSearch)
      );
    }
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
        break;
    }
    // Geocode all (use Promise.all for batch)
    const geocoded = await Promise.all(
      filtered.map(async (dest) => ({
        ...dest,
        ...(await geocodeDestination(dest)),
      }))
    );
    setGeocodedDestinations(geocoded);
    // Center map on first destination if available
    if (geocoded[0] && mapRef.current) {
      mapRef.current.flyTo([geocoded[0].lat, geocoded[0].lon], 6);
    }
  };

  // Handle filter changes (trigger fetch)
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
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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

  // View details handler (navigate to destinations page or future modal trigger)
  const handleViewDetails = (id) => navigate(`/destinations?highlight=${id}`); // Future: Pass param to open modal

  useEffect(() => {
    fixLeafletIcons();
    fetchDestinations();
  }, []);

  useEffect(() => {
    applySearchAndSort(destinations);
  }, [searchTerm, sortBy, destinations]);

  if (loading)
    return (
      <Container className={classes.loadingContainer}>
        <CircularProgress />
      </Container>
    );
  if (error)
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" className={classes.container}>
        <Typography variant="h3" className={classes.title}>
          Destination Map
        </Typography>
        {/* Filters/Search mirror Destinations.js */}
        <Grid container spacing={2} className={classes.filtersContainer}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={selectedStatus} onChange={handleStatusChange}>
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
              <Select value={sortBy} onChange={handleSortChange}>
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
        <Box className={classes.mapContainer}>
          <MapContainer
            center={[-41, 174]}
            zoom={5}
            style={{ height: "600px", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <MarkerClusterGroup>
              {geocodedDestinations.map((dest) => (
                <Marker
                  key={dest.destination_id}
                  position={[dest.lat, dest.lon]}
                  icon={createCustomIcon(
                    (dest.current_visitors / dest.capacity) * 100
                  )}
                >
                  <Popup>
                    <Typography variant="h6">{dest.name}</Typography>
                    <Typography>
                      Visitors: {dest.current_visitors} / {dest.capacity}
                    </Typography>
                    <Typography>Status: {dest.status}</Typography>
                    <Button
                      onClick={() => handleViewDetails(dest.destination_id)}
                    >
                      View Details
                    </Button>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

export default Map;
