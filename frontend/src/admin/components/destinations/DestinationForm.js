import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Autocomplete,
} from "@mui/material";
import { readAndCompressImage } from "browser-image-resizer";
import classes from "./Destination.module.css";
import slugify from "slugify";

// Image compression configurations
const thumbnailConfig = {
  quality: 0.8,
  maxWidth: 400,
  maxHeight: 200,
  autoRotate: true,
  compressFormat: "JPG",
};

const photoConfig = {
  quality: 0.8,
  maxWidth: 800,
  maxHeight: 400,
  autoRotate: true,
  compressFormat: "JPG",
};

/**
 * DestinationForm Component
 *
 * Form for creating and editing tourism destinations with features:
 * - Location autocomplete using OpenStreetMap/Nominatim API
 * - Image upload and compression
 * - GPS coordinate validation for New Zealand
 * - Form validation and error handling
 */
function DestinationForm({ destination, onSubmit, onCancel }) {
  // Form state management
  const [formData, setFormData] = useState({
    name: destination?.name || "",
    description: destination?.description || "",
    capacity: destination?.capacity || 0,
    locationName: destination?.locationName || "",
    lat: 0,
    lon: 0,
    status: destination?.status?.toLowerCase() || "open",
  });

  // Image and UI state
  const [thumbnail, setThumbnail] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});

  // Location autocomplete state
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Parse existing destination coordinates from POINT format when editing
  useEffect(() => {
    if (destination?.location) {
      const match = destination.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (match) {
        setFormData((prev) => ({
          ...prev,
          lon: parseFloat(match[1]), // PostGIS format: POINT(lon lat)
          lat: parseFloat(match[2]),
        }));
      }
    }
  }, [destination]);

  // Generic form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  /**
   * Save compressed image file to backend
   * @param {Blob} blob - Compressed image blob
   * @param {string} filename - Target filename
   * @param {string} slug - Destination slug for folder organization
   */
  const saveFile = async (blob, filename, slug) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", blob, filename);
      formDataToSend.append("slug", slug);

      const saveUrl = `/save-image`;
      const response = await fetch(saveUrl, {
        method: "POST",
        body: formDataToSend,
      });
      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`);
      }
      console.log("File saved:", filename);
    } catch (error) {
      console.error("Failed to save file:", error);
    }
  };

  // Image upload handlers with compression
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Compress thumbnail to 400x200
        const resizedBlob = await readAndCompressImage(file, thumbnailConfig);
        setThumbnail(resizedBlob);

        // Generate filename based on destination name
        const slug = slugify(formData.name, { lower: true, strict: true });
        const filename = `${slug}-thumbnail.jpg`;
        await saveFile(resizedBlob, filename, slug);
      } catch (error) {
        console.error("Thumbnail resize failed:", error);
      }
    }
  };

  const handlePhotosChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Max 5 additional photos allowed");
      return;
    }
    try {
      // Compress all photos to 800x400
      const resizedFiles = await Promise.all(
        files.map((file) => readAndCompressImage(file, photoConfig))
      );
      setPhotos(resizedFiles);

      // Save all photos with sequential naming
      const slug = slugify(formData.name, { lower: true, strict: true });
      await Promise.all(
        resizedFiles.map(async (blob, i) => {
          const filename = `${slug}-${i + 1}.jpg`;
          await saveFile(blob, filename, slug);
        })
      );
    } catch (error) {
      console.error("Photos resize failed:", error);
    }
  };

  /**
   * Fetch location suggestions from OpenStreetMap Nominatim API
   * Provides real-time autocomplete for New Zealand locations
   * @param {string} query - Search query (minimum 3 characters)
   */
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query
        )}&format=json&addressdetails=1&limit=8&countrycodes=NZ`,
        {
          method: "GET",
          headers: {
            "User-Agent": "TourismPulseNZ/1.0 (hasitha@example.com)",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch suggestions");
      const data = await response.json();

      // Transform API response to autocomplete format
      const suggestions = data.map((item) => ({
        label: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        name: item.name || query,
      }));

      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setLocationSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  /**
   * Fetch coordinates for a specific location name (fallback for manual entry)
   * @param {string} locationName - Location name to geocode
   */
  const fetchLocationCoordinates = async (locationName) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          locationName
        )}&format=json&addressdetails=1&limit=1&countrycodes=NZ`,
        {
          method: "GET",
          headers: {
            "User-Agent": "TourismPulseNZ/1.0 (hasitha@example.com)",
          },
        }
      );
      if (!response.ok) throw new Error("Location not found");
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setFormData((prev) => ({
          ...prev,
          lon: parseFloat(lon),
          lat: parseFloat(lat),
          locationName,
        }));
      } else {
        setErrors((prev) => ({ ...prev, locationName: "Location not found" }));
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setErrors((prev) => ({
        ...prev,
        locationName: "Failed to fetch location",
      }));
    }
  };

  // Location autocomplete event handlers
  const handleLocationSelect = (event, selectedOption) => {
    if (selectedOption) {
      // Auto-populate coordinates when selecting from dropdown
      setFormData((prev) => ({
        ...prev,
        locationName: selectedOption.name,
        lat: selectedOption.lat,
        lon: selectedOption.lon,
      }));
      setErrors((prev) => ({ ...prev, locationName: null }));
    }
  };

  const handleLocationInputChange = (event, value) => {
    setFormData((prev) => ({ ...prev, locationName: value }));
    // Trigger autocomplete suggestions as user types
    fetchLocationSuggestions(value);
  };

  // Fallback for manual location entry (Enter key)
  const handleLocationSearch = (e) => {
    if (e.key === "Enter" && formData.locationName) {
      fetchLocationCoordinates(formData.locationName);
    }
  };

  /**
   * Form validation with New Zealand geographic bounds checking
   * @returns {Object} Object containing validation errors
   */
  const validate = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.capacity <= 0)
      newErrors.capacity = "Capacity must be greater than 0";

    // New Zealand geographic bounds validation
    // Latitude: -35 (North Island) to -47 (South Island)
    // Longitude: 166 (Chatham Islands) to 179 (East Coast)
    if (
      formData.lat < -47 ||
      formData.lat > -35 ||
      formData.lon < 166 ||
      formData.lon > 179
    ) {
      newErrors.locationName =
        "Location outside NZ bounds (-35 to -47 lat, 166 to 179 lon)";
    }

    return newErrors;
  };

  /**
   * Handle form submission with validation and data formatting
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Generate URL-friendly slug for file organization
    const slug = slugify(formData.name, { lower: true, strict: true });

    // Build photo paths array (thumbnail + additional photos)
    const photoPaths = [
      thumbnail ? `${slug}/${slug}-thumbnail.jpg` : "default-thumbnail.jpg",
    ];
    for (let i = 0; i < photos.length; i++) {
      photoPaths.push(`${slug}/${slug}-${i + 1}.jpg`);
    }

    // Format data for backend (PostGIS POINT format: POINT(lon lat))
    const submitData = {
      name: formData.name,
      description: formData.description,
      capacity: parseInt(formData.capacity),
      photos: photoPaths,
      location: `POINT(${formData.lon} ${formData.lat})`,
      status:
        formData.status.charAt(0).toUpperCase() + formData.status.slice(1),
    };

    onSubmit(submitData);
  };

  return (
    <form className={classes.destinationForm} onSubmit={handleFormSubmit}>
      {/* Basic destination information */}
      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        error={!!errors.name}
        helperText={errors.name}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        error={!!errors.description}
        helperText={errors.description}
        fullWidth
        margin="normal"
        multiline
        rows={4}
      />

      {/* Location autocomplete with OpenStreetMap integration */}
      <Autocomplete
        options={locationSuggestions}
        getOptionLabel={(option) => option.label || option}
        value={formData.locationName}
        onChange={handleLocationSelect}
        onInputChange={handleLocationInputChange}
        loading={loadingSuggestions}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label="Location Name (e.g., Auckland)"
            required
            error={!!errors.locationName}
            helperText={errors.locationName || "Type to search locations in NZ"}
            fullWidth
            margin="normal"
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Box>
              <Typography variant="body2" component="div">
                {option.label}
              </Typography>
            </Box>
          </li>
        )}
      />
      {/* GPS Coordinates (auto-populated from location selection) */}
      <Box sx={{ display: "flex", gap: 2, marginBottom: "1rem" }}>
        <TextField
          label="Latitude (-35 to -47)"
          name="lat"
          type="number"
          step="any"
          value={formData.lat}
          onChange={handleChange}
          disabled
          sx={{ flex: 1 }}
          inputProps={{ min: -47, max: -35 }}
          margin="normal"
        />
        <TextField
          label="Longitude (166 to 179)"
          name="lon"
          type="number"
          step="any"
          value={formData.lon}
          onChange={handleChange}
          disabled
          sx={{ flex: 1 }}
          inputProps={{ min: 166, max: 179 }}
          margin="normal"
        />
      </Box>

      {/* Destination capacity */}
      <TextField
        label="Capacity"
        name="capacity"
        type="number"
        value={formData.capacity}
        onChange={handleChange}
        required
        error={!!errors.capacity}
        helperText={errors.capacity}
        fullWidth
        margin="normal"
        inputProps={{ min: 1 }}
      />

      {/* Image uploads with automatic compression */}
      <input
        type="file"
        accept="image/*"
        onChange={handleThumbnailChange}
        style={{ margin: "1rem 0" }}
      />
      <Typography variant="body2">Thumbnail (resized to 400x200)</Typography>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handlePhotosChange}
        style={{ margin: "1rem 0" }}
      />
      <Typography variant="body2">
        Additional Photos (up to 5, resized to 800x400)
      </Typography>

      {/* Destination status */}
      <FormControl fullWidth margin="normal" error={!!errors.status}>
        <InputLabel>Status</InputLabel>
        <Select name="status" value={formData.status} onChange={handleChange}>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
          <MenuItem value="maintenance">Maintenance</MenuItem>
        </Select>
      </FormControl>

      {/* Form action buttons */}
      <div className={classes.formActions}>
        <Button type="submit" variant="contained" color="primary">
          Save
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default DestinationForm;
