// src/shared/pages/map/Map.js
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Autocomplete,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { format } from "date-fns";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";
import classes from "./Map.module.css";

// Constants for better maintainability
const NEW_ZEALAND_CENTER = [-41.2865, 174.7762]; // Wellington coordinates
const DEFAULT_ZOOM = 5;
const DETAIL_ZOOM = 6;
const GEOCODING_CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
const GEOCODING_BATCH_SIZE = 5;
const GEOCODING_BATCH_DELAY = 100; // ms
const SEARCH_DEBOUNCE_DELAY = 300; // ms

// Utility functions
const isValidCoordinate = (lat, lon) => {
  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
};

const cleanCacheExpiredEntries = () => {
  const now = Date.now();
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("geo_")) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data.expires && data.expires < now) {
          keysToRemove.push(key);
        }
      } catch (error) {
        keysToRemove.push(key); // Remove invalid entries
      }
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

/**
 * Fix Leaflet default icon paths (common React issue)
 * This ensures markers display correctly by setting proper icon paths
 */
const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });
};

/**
 * Create custom marker icons based on capacity percentage
 * Green: < 50%, Orange: 50-80%, Red: > 80%
 */
const createCustomIcon = (capacityPercentage) => {
  let color = "green";
  if (capacityPercentage > 80) color = "red";
  else if (capacityPercentage > 50) color = "orange";

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

/**
 * Debounce hook to prevent excessive API calls during typing
 */
/**
 * Debounce hook to prevent excessive API calls during typing
 */
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Map Events Handler Component
 * Handles map events and updates parent component
 */
const MapEventsHandler = ({ onMapReady }) => {
  const map = useMapEvents({
    // Handle map ready event
    whenReady() {
      if (onMapReady) {
        onMapReady(map);
      }
    },
  });

  return null;
};

function Map() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Core state management
  const [destinations, setDestinations] = useState([]);
  const [geocodedDestinations, setGeocodedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sortBy, setSortBy] = useState("Name (A-Z)");

  // Autocompletion state
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState("");

  // Refs and map instance
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Debounced search term to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_DELAY);

  /**
   * Fetch destinations from API based on current filters
   * Uses memoized callback to prevent unnecessary re-renders
   */
  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Format date for API request
      const today = format(selectedDate, "yyyy-MM-dd", {
        timeZone: "Pacific/Auckland",
      });

      // Setup authentication headers
      const token = isAuthenticated ? localStorage.getItem("token") : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Build query parameters
      const params = new URLSearchParams();
      if (selectedStatus !== "All") params.append("status", selectedStatus);
      if (selectedAvailability !== "All")
        params.append("availability", selectedAvailability);
      params.append("date", today);

      // Determine API endpoint based on authentication
      const apiUrl = isAuthenticated
        ? `http://localhost:3000/dest/api/v1/destinations?${params.toString()}`
        : `http://localhost:3000/dest/api/v1/destinations/public?${params.toString()}`;

      const response = await fetch(apiUrl, { headers });
      if (!response.ok)
        throw new Error(`Failed to fetch destinations: ${response.statusText}`);

      const data = await response.json();
      setDestinations(data);

      // Update autocomplete options based on fetched data
      const options = data.map((dest) => ({
        label: dest.name,
        value: dest.name,
        description: dest.description || "",
        id: dest.destination_id,
      }));
      setAutocompleteOptions(options);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setError(err.message);
      setLoading(false);
    }
  }, [selectedStatus, selectedAvailability, selectedDate, isAuthenticated]);

  /**
   * Geocode destinations using Nominatim API with caching
   * Returns cached coordinates or fetches new ones
   */
  const geocodeDestination = useCallback(async (dest) => {
    // Check if destination already has valid coordinates
    if (dest.latitude && dest.longitude) {
      const lat = parseFloat(dest.latitude);
      const lon = parseFloat(dest.longitude);
      if (isValidCoordinate(lat, lon)) {
        return { lat, lon };
      }
    }

    // Check cache first
    const cacheKey = `geo_${dest.name.replace(/\s+/g, "_")}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (parseError) {
        console.warn(
          `Failed to parse cached geo data for ${dest.name}:`,
          parseError
        );
        localStorage.removeItem(cacheKey);
      }
    }

    // Geocode via Nominatim API
    try {
      const query = encodeURIComponent(`${dest.name}, New Zealand`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=nz`,
        {
          headers: {
            "User-Agent": "TourismPulseNZ/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data[0]) {
        const { lat, lon } = data[0];
        const geo = { lat: parseFloat(lat), lon: parseFloat(lon) };

        // Cache the result with expiration (30 days)
        const cacheData = {
          ...geo,
          timestamp: Date.now(),
          expires: Date.now() + GEOCODING_CACHE_EXPIRY,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        return geo;
      }
    } catch (err) {
      console.error(`Geocoding error for ${dest.name}:`, err);
    }

    // Fallback to New Zealand center coordinates
    return { lat: NEW_ZEALAND_CENTER[0], lon: NEW_ZEALAND_CENTER[1] };
  }, []);

  /**
   * Apply search filters and sorting, then geocode results
   * Memoized to prevent unnecessary recalculations
   */
  const applySearchAndSort = useCallback(
    async (data) => {
      if (!data || data.length === 0) {
        setGeocodedDestinations([]);
        return;
      }

      try {
        let filtered = [...data];

        // Apply search filter
        if (debouncedSearchTerm.trim()) {
          const lowerSearch = debouncedSearchTerm.toLowerCase();
          filtered = filtered.filter(
            (dest) =>
              dest.name.toLowerCase().includes(lowerSearch) ||
              (dest.description &&
                dest.description.toLowerCase().includes(lowerSearch)) ||
              (dest.location &&
                dest.location.toLowerCase().includes(lowerSearch))
          );
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
            filtered.sort((a, b) => (a.capacity || 0) - (b.capacity || 0));
            break;
          case "Capacity (High to Low)":
            filtered.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
            break;
          default:
            break;
        }

        // Geocode filtered destinations in batches to prevent API rate limiting
        const batchSize = GEOCODING_BATCH_SIZE;
        const geocoded = [];

        for (let i = 0; i < filtered.length; i += batchSize) {
          const batch = filtered.slice(i, i + batchSize);
          const batchGeocoded = await Promise.all(
            batch.map(async (dest) => {
              try {
                const geoData = await geocodeDestination(dest);
                return { ...dest, ...geoData };
              } catch (error) {
                console.error(`Failed to geocode ${dest.name}:`, error);
                return {
                  ...dest,
                  lat: NEW_ZEALAND_CENTER[0],
                  lon: NEW_ZEALAND_CENTER[1],
                };
              }
            })
          );
          geocoded.push(...batchGeocoded);

          // Small delay between batches to respect API limits
          if (i + batchSize < filtered.length) {
            await new Promise((resolve) =>
              setTimeout(resolve, GEOCODING_BATCH_DELAY)
            );
          }
        }

        setGeocodedDestinations(geocoded);

        // Center map on first destination if available and map is ready
        if (geocoded.length > 0 && mapInstance) {
          mapInstance.flyTo([geocoded[0].lat, geocoded[0].lon], DETAIL_ZOOM);
        }
      } catch (error) {
        console.error("Error in applySearchAndSort:", error);
        setError("Failed to process destination data");
      }
    },
    [debouncedSearchTerm, sortBy, geocodeDestination, mapInstance]
  );

  // Event handlers - memoized to prevent unnecessary re-renders
  const handleStatusChange = useCallback((e) => {
    setSelectedStatus(e.target.value);
  }, []);

  const handleAvailabilityChange = useCallback((e) => {
    setSelectedAvailability(e.target.value);
  }, []);

  const handleDateChange = useCallback((newValue) => {
    setSelectedDate(newValue || new Date());
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  const handleSearchChange = useCallback((event, newValue) => {
    if (typeof newValue === "string") {
      setSearchTerm(newValue);
      setSearchInputValue(newValue);
    }
  }, []);

  const handleSearchInputChange = useCallback((event, newInputValue) => {
    setSearchInputValue(newInputValue);
    setSearchTerm(newInputValue);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedStatus("All");
    setSelectedAvailability("All");
    setSelectedDate(new Date());
    setSortBy("Name (A-Z)");
    setSearchTerm("");
    setSearchInputValue("");
  }, []);

  // Map ready handler
  const handleMapReady = useCallback((map) => {
    setMapInstance(map);
    mapRef.current = map;
  }, []);

  // View details handler - navigate to destinations page with highlight
  const handleViewDetails = useCallback(
    (id) => {
      navigate(`/destinations?highlight=${id}`);
    },
    [navigate]
  );

  // Initialize component and fix Leaflet icons
  useEffect(() => {
    fixLeafletIcons();
    cleanCacheExpiredEntries(); // Clean up expired geocoding cache
  }, []);

  // Fetch destinations when filters change
  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Apply search and sort when data or filters change
  useEffect(() => {
    if (destinations.length > 0) {
      applySearchAndSort(destinations);
    }
  }, [destinations, applySearchAndSort]);

  // Clean up expired geocoding cache entries on mount
  useEffect(() => {
    cleanCacheExpiredEntries();
  }, []);

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
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={selectedStatus} onChange={handleStatusChange}>
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
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
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
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
          <Grid item xs={12} md={9} lg={10}>
            <Autocomplete
              freeSolo
              fullWidth
              options={autocompleteOptions}
              getOptionLabel={(option) =>
                typeof option === "string" ? option : option.label
              }
              value={searchTerm}
              inputValue={searchInputValue}
              onChange={handleSearchChange}
              onInputChange={handleSearchInputChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Destinations"
                  placeholder="Type to search destinations..."
                  className={classes.searchInput}
                  variant="outlined"
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id || option.label}>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {option.label}
                    </Typography>
                    {option.description && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {option.description.length > 60
                          ? `${option.description.substring(0, 60)}...`
                          : option.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              PaperComponent={({ children, ...other }) => (
                <Paper {...other} elevation={3}>
                  {children}
                </Paper>
              )}
              noOptionsText="No destinations found"
              loadingText="Loading destinations..."
            />
          </Grid>
          <Grid item xs={12} md={3} lg={2}>
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
        {/* Map Display */}
        <Box className={classes.mapContainer}>
          {geocodedDestinations.length === 0 && !loading ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height="100%"
              flexDirection="column"
              bgcolor="rgba(255, 255, 255, 0.1)"
              borderRadius={2}
            >
              <Typography variant="h6" color="white" gutterBottom>
                No destinations found
              </Typography>
              <Typography variant="body2" color="#bdd1d4">
                Try adjusting your search criteria or filters
              </Typography>
            </Box>
          ) : (
            <MapContainer
              center={NEW_ZEALAND_CENTER}
              zoom={DEFAULT_ZOOM}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
              attributionControl={true}
              zoomControl={true}
              doubleClickZoom={true}
              touchZoom={true}
              dragging={true}
            >
              <MapEventsHandler onMapReady={handleMapReady} />
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                maxZoom={19}
                tileSize={256}
                detectRetina={true}
              />
              <MarkerClusterGroup
                chunkedLoading
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
                maxClusterRadius={50}
                animate={true}
                animateAddingMarkers={true}
              >
                {geocodedDestinations.map((dest) => {
                  const capacityPercentage =
                    dest.capacity > 0
                      ? Math.round(
                          (dest.current_visitors / dest.capacity) * 100
                        )
                      : 0;

                  return (
                    <Marker
                      key={dest.destination_id}
                      position={[dest.lat, dest.lon]}
                      icon={createCustomIcon(capacityPercentage)}
                    >
                      <Popup maxWidth={300} closeButton={true}>
                        <Box p={1}>
                          <Typography variant="h6" gutterBottom>
                            {dest.name}
                          </Typography>
                          {dest.description && (
                            <Typography variant="body2" paragraph>
                              {dest.description.length > 100
                                ? `${dest.description.substring(0, 100)}...`
                                : dest.description}
                            </Typography>
                          )}
                          <Typography variant="body2" gutterBottom>
                            <strong>Visitors:</strong>{" "}
                            {dest.current_visitors || 0} /{" "}
                            {dest.capacity || "N/A"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Status:</strong> {dest.status || "Unknown"}
                          </Typography>
                          <Typography variant="body2" gutterBottom>
                            <strong>Capacity:</strong> {capacityPercentage}%
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() =>
                              handleViewDetails(dest.destination_id)
                            }
                            sx={{ mt: 1 }}
                            fullWidth
                          >
                            View Details
                          </Button>
                        </Box>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            </MapContainer>
          )}
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

export default Map;
