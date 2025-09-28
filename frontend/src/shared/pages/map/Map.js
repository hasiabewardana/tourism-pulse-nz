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
  Chip,
  Card,
  CardContent,
  CardMedia,
  Rating,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Drawer,
  Divider,
  Slider,
} from "@mui/material";
import {
  MyLocation as MyLocationIcon,
  Layers as LayersIcon,
  FilterList as FilterIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Directions as DirectionsIcon,
  PhotoCamera as PhotoIcon,
  Star as StarIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Clear as ClearIcon,
  Navigation as NavigationIcon,
  AccessTime as AccessTimeIcon,
  Straighten as StraightenIcon,
} from "@mui/icons-material";
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
  Circle,
  Polyline,
  Tooltip as LeafletTooltip,
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

// Map layer configurations
const MAP_LAYERS = {
  street: {
    name: "Street View",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  terrain: {
    name: "Terrain",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution:
      "Map data: &copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors, <a href='http://viewfinderpanoramas.org'>SRTM</a> | Map style: &copy; <a href='https://opentopomap.org'>OpenTopoMap</a> (<a href='https://creativecommons.org/licenses/by-sa/3.0/'>CC-BY-SA</a>)",
  },
};

// Destination categories for enhanced filtering
const DESTINATION_CATEGORIES = [
  "Adventure & Sports",
  "Cultural & Heritage",
  "Nature & Wildlife",
  "Food & Wine",
  "Urban Attractions",
  "Beaches & Coastal",
  "Mountains & Hiking",
  "Family-Friendly",
];

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
 * Create custom marker icons based on capacity percentage and category
 * Green: < 50%, Orange: 50-80%, Red: > 80%
 */
const createCustomIcon = (
  capacityPercentage,
  category = null,
  rating = null
) => {
  let color = "green";
  if (capacityPercentage > 80) color = "red";
  else if (capacityPercentage > 50) color = "orange";

  // Enhanced icons with category and rating indicators
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
 * Create special markers for user location
 */
const createUserLocationIcon = () => {
  return new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [30, 48],
    iconAnchor: [15, 48],
    popupAnchor: [1, -42],
    shadowSize: [48, 48],
  });
};

/**
 * Create route waypoint markers for distance indicators
 */
const createRouteWaypointIcon = (distanceKm) => {
  // Create a custom div icon for distance markers
  return new L.DivIcon({
    html: `<div style="
      background: linear-gradient(135deg, #0fa4af, #48d9f3);
      color: white;
      border: 2px solid white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${distanceKm}km</div>`,
    className: "route-waypoint-marker",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

/**
 * Create start/end route markers
 */
const createRouteStartIcon = () => {
  return new L.DivIcon({
    html: `<div style="
      background: linear-gradient(135deg, #4caf50, #66bb6a);
      color: white;
      border: 3px solid white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    ">START</div>`,
    className: "route-start-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const createRouteEndIcon = () => {
  return new L.DivIcon({
    html: `<div style="
      background: linear-gradient(135deg, #f44336, #ef5350);
      color: white;
      border: 3px solid white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    ">END</div>`,
    className: "route-end-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
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

  // Enhanced filtering state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [radiusFilter, setRadiusFilter] = useState(50);

  // Map display state
  const [currentLayer, setCurrentLayer] = useState("street");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // User location state
  const [userLocation, setUserLocation] = useState(null);
  const [trackingLocation, setTrackingLocation] = useState(false);

  // Favorites and sharing
  const [favorites, setFavorites] = useState([]);

  // Routing state
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeInstructions, setRouteInstructions] = useState([]);
  const [showRouteInstructions, setShowRouteInstructions] = useState(false);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routeWaypoints, setRouteWaypoints] = useState([]);

  // Autocompletion state
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [searchInputValue, setSearchInputValue] = useState("");

  // Refs and map instance
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  // Debounced search term to prevent excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_DELAY);

  /**
   * Get user's current location
   */
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setTrackingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lon: longitude });
        setTrackingLocation(false);

        // Center map on user location
        if (mapInstance) {
          mapInstance.flyTo([latitude, longitude], 12);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setTrackingLocation(false);
        setError(`Location error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [mapInstance]);

  /**
   * Toggle favorite destination
   */
  const toggleFavorite = useCallback((destinationId) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(destinationId)
        ? prev.filter((id) => id !== destinationId)
        : [...prev, destinationId];

      // Save to localStorage
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  /**
   * Share destination functionality
   */
  const shareDestination = useCallback(async (destination) => {
    const shareData = {
      title: `${destination.name} - TourismPulseNZ`,
      text: `Check out ${destination.name}: ${destination.description}`,
      url: `${window.location.origin}/destinations?highlight=${destination.destination_id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        // You could show a toast notification here
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  }, []);

  /**
   * Calculate route using OpenStreetMap routing service
   */
  const calculateRoute = useCallback(
    async (destination) => {
      if (!userLocation) {
        getUserLocation();
        return;
      }

      setIsCalculatingRoute(true);
      setRouteCoordinates([]);
      setRouteInstructions([]);
      setRouteWaypoints([]);

      try {
        // Using OSRM (Open Source Routing Machine) - free routing service
        const response = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLocation.lon},${userLocation.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson&steps=true`
        );

        if (!response.ok) {
          throw new Error("Routing service unavailable");
        }

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];

          // Extract route coordinates
          const coordinates = route.geometry.coordinates.map((coord) => [
            coord[1],
            coord[0],
          ]); // Reverse lon,lat to lat,lon
          setRouteCoordinates(coordinates);

          // Create waypoint markers every 5km for distance reference
          const waypoints = [];
          const totalDistance = route.distance; // in meters
          let accumulatedDistance = 0;
          let waypointDistance = 5000; // 5km intervals

          for (let i = 1; i < coordinates.length; i++) {
            const segmentDistance =
              calculateDistance(
                coordinates[i - 1][0],
                coordinates[i - 1][1],
                coordinates[i][0],
                coordinates[i][1]
              ) * 1000; // Convert to meters

            accumulatedDistance += segmentDistance;

            // Add waypoint every 5km
            if (accumulatedDistance >= waypointDistance) {
              waypoints.push({
                position: coordinates[i],
                distance: Math.round(waypointDistance / 1000),
                totalDistance: Math.round(accumulatedDistance / 1000),
              });
              waypointDistance += 5000; // Next 5km mark
            }
          }
          setRouteWaypoints(waypoints);

          // Extract route instructions
          const instructions = [];
          route.legs.forEach((leg) => {
            leg.steps.forEach((step, index) => {
              instructions.push({
                instruction:
                  step.maneuver.instruction ||
                  `Continue for ${(step.distance / 1000).toFixed(1)} km`,
                distance: step.distance,
                duration: step.duration,
                type: step.maneuver.type,
              });
            });
          });
          setRouteInstructions(instructions);

          // Set route summary
          setRouteDistance((route.distance / 1000).toFixed(1)); // Convert to km
          setRouteDuration(Math.round(route.duration / 60)); // Convert to minutes

          // Show route instructions panel
          setShowRouteInstructions(true);

          // Fit map to show the entire route
          if (mapInstance && coordinates.length > 0) {
            const bounds = L.latLngBounds(coordinates);
            mapInstance.fitBounds(bounds, { padding: [20, 20] });
          }
        }
      } catch (error) {
        console.error("Error calculating route:", error);

        // Fallback to Google Maps if routing service fails
        const userConfirm = window.confirm(
          "Our internal routing service is temporarily unavailable. Would you like to open directions in Google Maps instead?"
        );

        if (userConfirm) {
          const directionsUrl = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lon}/${destination.lat},${destination.lon}`;
          window.open(directionsUrl, "_blank");
        }
      } finally {
        setIsCalculatingRoute(false);
      }
    },
    [userLocation, getUserLocation, mapInstance]
  );

  /**
   * Clear current route
   */
  const clearRoute = useCallback(() => {
    setRouteCoordinates([]);
    setRouteInstructions([]);
    setShowRouteInstructions(false);
    setRouteDistance(null);
    setRouteDuration(null);
    setRouteWaypoints([]);
  }, []);

  /**
   * Get directions to destination (updated to use internal routing)
   */
  const getDirections = useCallback(
    (destination) => {
      if (!userLocation) {
        alert("Please enable location access first");
        getUserLocation();
        return;
      }

      calculateRoute(destination);
    },
    [userLocation, getUserLocation, calculateRoute]
  );

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

        // Apply category filter
        if (selectedCategory !== "All") {
          filtered = filtered.filter(
            (dest) => dest.category === selectedCategory
          );
        }

        // Apply rating filter
        if (ratingFilter > 0) {
          filtered = filtered.filter(
            (dest) => (dest.rating || 0) >= ratingFilter
          );
        }

        // Apply radius filter if user location is available
        if (userLocation && radiusFilter < 50) {
          filtered = filtered.filter((dest) => {
            if (dest.latitude && dest.longitude) {
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lon,
                parseFloat(dest.latitude),
                parseFloat(dest.longitude)
              );
              return distance <= radiusFilter;
            }
            return true;
          });
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
    setSelectedCategory("All");
    setPriceRange([0, 500]);
    setRatingFilter(0);
    setRadiusFilter(50);
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setSelectedCategory(e.target.value);
  }, []);

  const handlePriceRangeChange = useCallback((event, newValue) => {
    setPriceRange(newValue);
  }, []);

  const handleRatingFilterChange = useCallback((event, newValue) => {
    setRatingFilter(newValue);
  }, []);

  const handleRadiusFilterChange = useCallback((event, newValue) => {
    setRadiusFilter(newValue);
  }, []);

  const handleLayerChange = useCallback((layerType) => {
    setCurrentLayer(layerType);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setDrawerOpen(!drawerOpen);
  }, [drawerOpen]);

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

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem("favorites");
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Error loading favorites:", error);
      }
    }
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

  // Update the applySearchAndSort dependency array
  const applySearchAndSortMemo = useCallback(applySearchAndSort, [
    debouncedSearchTerm,
    sortBy,
    geocodeDestination,
    mapInstance,
    selectedCategory,
    ratingFilter,
    userLocation,
    radiusFilter,
  ]);

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
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h3" className={classes.title}>
            Destination Map
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="My Location">
              <IconButton
                onClick={getUserLocation}
                disabled={trackingLocation}
                className={classes.actionButton}
                sx={{
                  bgcolor: "#374549",
                  color: "#48d9f3",
                  border: "1px solid #48d9f3",
                  "&:hover": {
                    bgcolor: "#48d9f3",
                    color: "#282f33",
                  },
                  "&:disabled": {
                    bgcolor: "#282f33",
                    color: "#82c2ce",
                  },
                }}
              >
                {trackingLocation ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <MyLocationIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Map Layers">
              <IconButton
                onClick={() => setDrawerOpen(true)}
                className={classes.actionButton}
                sx={{
                  bgcolor: "#374549",
                  color: "#48d9f3",
                  border: "1px solid #48d9f3",
                  "&:hover": {
                    bgcolor: "#48d9f3",
                    color: "#282f33",
                  },
                }}
              >
                <LayersIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Advanced Filters">
              <IconButton
                onClick={handleDrawerToggle}
                className={classes.actionButton}
                sx={{
                  bgcolor: drawerOpen ? "#48d9f3" : "#374549",
                  color: drawerOpen ? "#282f33" : "#48d9f3",
                  border: "1px solid #48d9f3",
                  "&:hover": {
                    bgcolor: "#48d9f3",
                    color: "#282f33",
                  },
                }}
              >
                <FilterIcon />
              </IconButton>
            </Tooltip>
            {routeCoordinates.length > 0 && (
              <Tooltip title="Clear Route">
                <IconButton
                  onClick={clearRoute}
                  className={classes.actionButton}
                  sx={{
                    bgcolor: "#ff9800",
                    color: "#ffffff",
                    border: "1px solid #ff9800",
                    "&:hover": {
                      bgcolor: "#e68900",
                      color: "#ffffff",
                    },
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        {/* Enhanced Filters Section */}
        <Grid container spacing={2} className={classes.filtersContainer}>
          <Grid item xs={12}>
            <Typography variant="h6" color="white" gutterBottom>
              Enhanced Search & Filters
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={selectedCategory} onChange={handleCategoryChange}>
                <MenuItem value="All">All Categories</MenuItem>
                {DESTINATION_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="body2" color="white" gutterBottom>
                Minimum Rating: {ratingFilter} stars
              </Typography>
              <Slider
                value={ratingFilter}
                onChange={handleRatingFilterChange}
                min={0}
                max={5}
                step={0.5}
                marks={[
                  { value: 0, label: "Any" },
                  { value: 2.5, label: "2.5+" },
                  { value: 5, label: "5" },
                ]}
                sx={{ color: "white" }}
              />
            </Box>
          </Grid>
          {userLocation && (
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" color="white" gutterBottom>
                  Radius: {radiusFilter === 50 ? "All" : `${radiusFilter} km`}
                </Typography>
                <Slider
                  value={radiusFilter}
                  onChange={handleRadiusFilterChange}
                  min={1}
                  max={50}
                  step={1}
                  marks={[
                    { value: 1, label: "1km" },
                    { value: 25, label: "25km" },
                    { value: 50, label: "All" },
                  ]}
                  sx={{ color: "white" }}
                />
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Basic Filters/Search mirror Destinations.js */}
        <Grid container spacing={2} className={classes.filtersContainer}>
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
          <Grid container spacing={2}>
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
                key={currentLayer}
                url={MAP_LAYERS[currentLayer].url}
                attribution={MAP_LAYERS[currentLayer].attribution}
                maxZoom={19}
                tileSize={256}
                detectRetina={true}
              />

              {/* User Location Marker */}
              {userLocation && (
                <Marker
                  position={[userLocation.lat, userLocation.lon]}
                  icon={createUserLocationIcon()}
                >
                  <Popup>
                    <Box p={1}>
                      <Typography variant="h6" gutterBottom>
                        <LocationIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                        Your Location
                      </Typography>
                      <Typography variant="body2">
                        Lat: {userLocation.lat.toFixed(6)}
                        <br />
                        Lng: {userLocation.lon.toFixed(6)}
                      </Typography>
                    </Box>
                  </Popup>
                </Marker>
              )}

              {/* User Location Accuracy Circle */}
              {userLocation && (
                <Circle
                  center={[userLocation.lat, userLocation.lon]}
                  radius={100}
                  fillColor="blue"
                  fillOpacity={0.1}
                  color="blue"
                  weight={1}
                />
              )}

              {/* Route Visualization */}
              {routeCoordinates.length > 0 && (
                <>
                  {/* Background route line (darker/thicker for outline effect) */}
                  <Polyline
                    positions={routeCoordinates}
                    color="#0fa4af"
                    weight={8}
                    opacity={0.7}
                  />
                  {/* Main route line (bright and animated) */}
                  <Polyline
                    positions={routeCoordinates}
                    color="#48d9f3"
                    weight={5}
                    opacity={1}
                    dashArray="10, 5"
                    className="route-line-animated"
                  >
                    <LeafletTooltip permanent={false} direction="center">
                      <div style={{ textAlign: "center", fontSize: "12px" }}>
                        <strong>Route to Destination</strong>
                        <br />
                        <span>
                          {routeDistance} km • {routeDuration} min
                        </span>
                      </div>
                    </LeafletTooltip>
                  </Polyline>

                  {/* Route start marker */}
                  <Marker
                    position={routeCoordinates[0]}
                    icon={createRouteStartIcon()}
                    zIndexOffset={1000}
                  >
                    <LeafletTooltip
                      direction="top"
                      permanent={false}
                      opacity={1}
                    >
                      <div style={{ textAlign: "center", fontSize: "12px" }}>
                        <strong>Start Point</strong>
                        <br />
                        <span>Your Location</span>
                      </div>
                    </LeafletTooltip>
                  </Marker>

                  {/* Route end marker */}
                  <Marker
                    position={routeCoordinates[routeCoordinates.length - 1]}
                    icon={createRouteEndIcon()}
                    zIndexOffset={1000}
                  >
                    <LeafletTooltip
                      direction="top"
                      permanent={false}
                      opacity={1}
                    >
                      <div style={{ textAlign: "center", fontSize: "12px" }}>
                        <strong>Destination</strong>
                        <br />
                        <span>
                          {routeDistance} km • {routeDuration} min
                        </span>
                      </div>
                    </LeafletTooltip>
                  </Marker>

                  {/* Route waypoint markers for distance indicators */}
                  {routeWaypoints.map((waypoint, index) => (
                    <Marker
                      key={`waypoint-${index}`}
                      position={waypoint.position}
                      icon={createRouteWaypointIcon(waypoint.totalDistance)}
                    >
                      <LeafletTooltip
                        direction="top"
                        offset={[0, -10]}
                        opacity={1}
                      >
                        <div style={{ textAlign: "center", fontSize: "11px" }}>
                          <strong>{waypoint.totalDistance} km</strong>
                          <br />
                          <span>from start</span>
                        </div>
                      </LeafletTooltip>
                    </Marker>
                  ))}
                </>
              )}
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

                  const isFavorite = favorites.includes(dest.destination_id);
                  const distance = userLocation
                    ? calculateDistance(
                        userLocation.lat,
                        userLocation.lon,
                        dest.lat,
                        dest.lon
                      )
                    : null;

                  return (
                    <Marker
                      key={dest.destination_id}
                      position={[dest.lat, dest.lon]}
                      icon={createCustomIcon(
                        capacityPercentage,
                        dest.category,
                        dest.rating
                      )}
                    >
                      <Popup maxWidth={350} closeButton={true}>
                        <Box>
                          {/* Destination Image */}
                          {dest.photos && dest.photos[0] && (
                            <CardMedia
                              component="img"
                              height="150"
                              image={"/images/destinations/" + dest.photos[0]}
                              alt={dest.name}
                              sx={{ borderRadius: 1, mb: 2 }}
                            />
                          )}

                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            mb={1}
                          >
                            <Typography variant="h6" sx={{ flex: 1, mr: 1 }}>
                              {dest.name}
                            </Typography>
                            <Box display="flex" gap={0.5}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  toggleFavorite(dest.destination_id)
                                }
                                sx={{ color: isFavorite ? "red" : "gray" }}
                              >
                                <FavoriteIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => shareDestination(dest)}
                              >
                                <ShareIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>

                          {/* Rating */}
                          {dest.rating && (
                            <Box display="flex" alignItems="center" mb={1}>
                              <Rating
                                value={dest.rating}
                                readOnly
                                size="small"
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                ({dest.rating})
                              </Typography>
                            </Box>
                          )}

                          {/* Category */}
                          {dest.category && (
                            <Chip
                              label={dest.category}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                          )}

                          {/* Distance */}
                          {distance !== null && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              gutterBottom
                            >
                              <LocationIcon
                                sx={{
                                  fontSize: 14,
                                  mr: 0.5,
                                  verticalAlign: "middle",
                                }}
                              />
                              {distance.toFixed(1)} km away
                            </Typography>
                          )}

                          {/* Description */}
                          {dest.description && (
                            <Typography variant="body2" paragraph>
                              {dest.description.length > 120
                                ? `${dest.description.substring(0, 120)}...`
                                : dest.description}
                            </Typography>
                          )}

                          {/* Stats */}
                          <Grid container spacing={1} sx={{ mb: 2 }}>
                            <Grid item xs={6}>
                              <Box display="flex" alignItems="center">
                                <PeopleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2">
                                  {dest.current_visitors || 0}/
                                  {dest.capacity || "N/A"}
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box display="flex" alignItems="center">
                                <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                <Typography variant="body2">
                                  {capacityPercentage}%
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>

                          {/* Action Buttons */}
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() =>
                                  handleViewDetails(dest.destination_id)
                                }
                                fullWidth
                              >
                                View Details
                              </Button>
                            </Grid>
                            <Grid item xs={6}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => getDirections(dest)}
                                disabled={!userLocation || isCalculatingRoute}
                                startIcon={
                                  isCalculatingRoute ? (
                                    <CircularProgress
                                      size={16}
                                      color="inherit"
                                    />
                                  ) : (
                                    <DirectionsIcon />
                                  )
                                }
                                fullWidth
                              >
                                {isCalculatingRoute
                                  ? "Calculating..."
                                  : "Directions"}
                              </Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            </MapContainer>
          )}
        </Box>

        {/* Layer Control Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 300,
              bgcolor: "#282f33",
              "& .MuiDrawer-paper": {
                bgcolor: "#282f33",
                color: "#ffffff",
                backgroundImage: "linear-gradient(135deg, #282f33, #374549)",
              },
            },
          }}
        >
          <Box sx={{ p: 2, bgcolor: "#282f33", minHeight: "100vh" }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "#ffffff", fontWeight: 600 }}
            >
              Map Controls
            </Typography>
            <Divider sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.3)" }} />

            {/* Layer Selection */}
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ color: "#ffffff", fontWeight: 500 }}
            >
              Map Layers
            </Typography>
            <List>
              {Object.entries(MAP_LAYERS).map(([key, layer]) => (
                <ListItem
                  key={key}
                  button
                  onClick={() => handleLayerChange(key)}
                  selected={currentLayer === key}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor:
                      currentLayer === key
                        ? "rgba(72, 217, 243, 0.3)"
                        : "rgba(255, 255, 255, 0.05)",
                    "&:hover": {
                      bgcolor: "rgba(72, 217, 243, 0.1)",
                    },
                    "&.Mui-selected": {
                      bgcolor: "rgba(72, 217, 243, 0.3)",
                    },
                    border:
                      currentLayer === key
                        ? "1px solid #48d9f3"
                        : "1px solid transparent",
                  }}
                >
                  <ListItemText
                    primary={layer.name}
                    primaryTypographyProps={{
                      color: "#ffffff",
                      fontWeight: currentLayer === key ? 600 : 400,
                    }}
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2, bgcolor: "rgba(255,255,255,0.3)" }} />

            {/* Display Options */}
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ color: "#ffffff", fontWeight: 500 }}
            >
              Display Options
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#48d9f3",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      bgcolor: "#48d9f3",
                    },
                    "& .MuiSwitch-track": {
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                    },
                  }}
                />
              }
              label="Show Visitor Density"
              sx={{
                color: "#ffffff",
                mb: 1,
                "& .MuiFormControlLabel-label": {
                  color: "#ffffff",
                  fontSize: "0.95rem",
                },
              }}
            />

            {/* Route Instructions */}
            {showRouteInstructions && (
              <>
                <Divider sx={{ my: 2, bgcolor: "rgba(255,255,255,0.3)" }} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "#ffffff", fontWeight: 500 }}
                  >
                    Route Instructions
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={clearRoute}
                    sx={{ color: "#ff9800" }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Enhanced Route Summary */}
                <Box
                  sx={{
                    bgcolor:
                      "linear-gradient(135deg, rgba(15, 164, 175, 0.2), rgba(72, 217, 243, 0.2))",
                    p: 2,
                    borderRadius: 2,
                    mb: 2,
                    border: "2px solid rgba(72, 217, 243, 0.4)",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#48d9f3",
                      fontWeight: 600,
                      mb: 1.5,
                      textAlign: "center",
                    }}
                  >
                    🗺️ Route Overview
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <StraightenIcon
                          sx={{ fontSize: 18, mr: 0.5, color: "#48d9f3" }}
                        />
                        <Typography
                          variant="body1"
                          sx={{ color: "#ffffff", fontWeight: 500 }}
                        >
                          {routeDistance} km
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#bdd1d4" }}>
                        Total Distance
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <AccessTimeIcon
                          sx={{ fontSize: 18, mr: 0.5, color: "#48d9f3" }}
                        />
                        <Typography
                          variant="body1"
                          sx={{ color: "#ffffff", fontWeight: 500 }}
                        >
                          {routeDuration} min
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#bdd1d4" }}>
                        Estimated Time
                      </Typography>
                    </Grid>
                  </Grid>

                  {routeWaypoints.length > 0 && (
                    <Box
                      mt={1.5}
                      pt={1.5}
                      borderTop="1px solid rgba(255,255,255,0.2)"
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#ffffff", mb: 0.5 }}
                      >
                        📍 {routeWaypoints.length} waypoint
                        {routeWaypoints.length !== 1 ? "s" : ""} marked
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#bdd1d4" }}>
                        Distance markers every 5km along the route
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Instructions List */}
                <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                  {routeInstructions.map((instruction, index) => (
                    <Box
                      key={index}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.05)",
                        p: 1,
                        borderRadius: 1,
                        mb: 1,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <Box display="flex" alignItems="flex-start">
                        <NavigationIcon
                          sx={{
                            fontSize: 14,
                            mr: 1,
                            mt: 0.2,
                            color: "#48d9f3",
                          }}
                        />
                        <Box flex={1}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#ffffff", fontSize: "0.85rem" }}
                          >
                            {instruction.instruction}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#bdd1d4" }}
                          >
                            {(instruction.distance / 1000).toFixed(1)} km
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            )}

            {/* Statistics */}
            <Divider sx={{ my: 2, bgcolor: "rgba(255,255,255,0.3)" }} />
            <Typography
              variant="subtitle1"
              gutterBottom
              sx={{ color: "#ffffff", fontWeight: 500 }}
            >
              Statistics
            </Typography>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.05)",
                p: 1.5,
                borderRadius: 1,
                mb: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "#bdd1d4", mb: 0.5 }}>
                Total Destinations:{" "}
                <span style={{ color: "#48d9f3", fontWeight: 600 }}>
                  {geocodedDestinations.length}
                </span>
              </Typography>
              <Typography variant="body2" sx={{ color: "#bdd1d4", mb: 0.5 }}>
                Favorites:{" "}
                <span style={{ color: "#48d9f3", fontWeight: 600 }}>
                  {favorites.length}
                </span>
              </Typography>
              {userLocation && (
                <Typography variant="body2" sx={{ color: "#bdd1d4" }}>
                  Location:{" "}
                  <span style={{ color: "#4caf50", fontWeight: 600 }}>
                    Enabled
                  </span>
                </Typography>
              )}
              {!userLocation && (
                <Typography variant="body2" sx={{ color: "#bdd1d4" }}>
                  Location:{" "}
                  <span style={{ color: "#ff9800", fontWeight: 600 }}>
                    Disabled
                  </span>
                </Typography>
              )}
            </Box>
          </Box>
        </Drawer>
      </Container>
    </LocalizationProvider>
  );
}

export default Map;
