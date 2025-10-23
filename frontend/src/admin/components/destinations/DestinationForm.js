import { useState, useEffect } from "react";
import axios from "axios";
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
import classes from "./DestinationForm.module.css";
import slugify from "slugify";
import { NZ_REGIONS, extractRegion } from "../../../util/regionParser";

// Image compression configurations
const thumbnailConfig = {
  quality: 1,
  maxWidth: 400,
  maxHeight: 200,
  autoRotate: true,
  compressFormat: "JPG",
};

const photoConfig = {
  quality: 1,
  maxWidth: 1200,
  maxHeight: 600,
  autoRotate: true,
  compressFormat: "JPG",
};

// Form for creating and editing destinations
function DestinationForm({ destination, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: destination?.name || "",
    description: destination?.description || "",
    capacity: destination?.capacity || 0,
    locationName: destination?.locationName || "",
    lat: 0,
    lon: 0,
    status: destination?.status?.toLowerCase() || "open",
    region: destination?.region || "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [modifiedFields, setModifiedFields] = useState(new Set());

  // Helper function to get field style based on modification status
  const getFieldStyle = (fieldName) => {
    if (!destination) return {}; // No styling for new destinations
    return modifiedFields.has(fieldName)
      ? {
          "& .MuiOutlinedInput-root": {
            borderColor: "#48d9f3",
            "&:hover": { borderColor: "#48d9f3" },
            "&.Mui-focused": { borderColor: "#48d9f3" },
          },
          "& .MuiSelect-root": {
            borderColor: "#48d9f3",
          },
          "& .MuiFormLabel-root": {
            color: "#48d9f3",
          },
        }
      : {};
  };

  useEffect(() => {
    if (destination?.location) {
      const match = destination.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (match) {
        setFormData((prev) => ({
          ...prev,
          lon: parseFloat(match[1]),
          lat: parseFloat(match[2]),
        }));
      }
    }
  }, [destination]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

    // Track modified fields for editing mode
    if (destination) {
      let originalValue = destination[name];

      // Handle status comparison - form stores lowercase, destination might be capitalized
      if (name === "status") {
        originalValue = destination.status?.toLowerCase();
        console.log("Status comparison:", {
          newValue: value,
          originalValue: originalValue,
          destinationStatus: destination.status,
        });
      }

      if (value !== originalValue) {
        setModifiedFields((prev) => new Set([...prev, name]));
        console.log(
          `Field ${name} marked as modified: ${value} !== ${originalValue}`
        );
      } else {
        setModifiedFields((prev) => {
          const newSet = new Set(prev);
          newSet.delete(name);
          return newSet;
        });
        console.log(
          `Field ${name} unmarked as modified: ${value} === ${originalValue}`
        );
      }
    }
  };

  // Save uploaded image to server
  const saveFile = async (blob, filename, slug) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", blob, filename);
      formDataToSend.append("slug", slug);

      const response = await axios.post("/save-image", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("File saved:", filename);
    } catch (error) {
      console.error("Failed to save file:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to save file";
      console.error("Save error:", errorMessage);
    }
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const resizedBlob = await readAndCompressImage(file, thumbnailConfig);
        setThumbnail(resizedBlob);
        const slug = slugify(formData.name, { lower: true, strict: true });
        const filename = `${slug}-thumbnail.jpg`;
        await saveFile(resizedBlob, filename, slug);

        // Mark thumbnail as modified
        if (destination) {
          setModifiedFields((prev) => new Set([...prev, "thumbnail"]));
        }
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
      const resizedFiles = await Promise.all(
        files.map((file) => readAndCompressImage(file, photoConfig))
      );
      setPhotos(resizedFiles);
      const slug = slugify(formData.name, { lower: true, strict: true });
      await Promise.all(
        resizedFiles.map(async (blob, i) => {
          const filename = `${slug}-${i + 1}.jpg`;
          await saveFile(blob, filename, slug);
        })
      );

      // Mark photos as modified
      if (destination) {
        setModifiedFields((prev) => new Set([...prev, "photos"]));
      }
    } catch (error) {
      console.error("Photos resize failed:", error);
    }
  };

  // Get location suggestions from OpenStreetMap
  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const config = {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 8,
          countrycodes: "NZ",
        },
        headers: {
          "User-Agent": "TourismPulseNZ/1.0 (hasitha@example.com)",
        },
      };

      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        config
      );

      const suggestions = response.data.map((item) => ({
        label: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        name: item.name || query,
      }));

      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch location suggestions";
      console.error("Location suggestions error:", errorMessage);
      setLocationSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Get coordinates for manual location entry
  const fetchLocationCoordinates = async (locationName) => {
    try {
      const config = {
        params: {
          q: locationName,
          format: "json",
          addressdetails: 1,
          limit: 1,
          countrycodes: "NZ",
        },
        headers: {
          "User-Agent": "TourismPulseNZ/1.0 (hasitha@example.com)",
        },
      };

      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        config
      );

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
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
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch location";
      setErrors((prev) => ({
        ...prev,
        locationName: errorMessage,
      }));
    }
  };

  const handleLocationSelect = (event, selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        locationName: selectedOption.name,
        lat: selectedOption.lat,
        lon: selectedOption.lon,
        region: extractRegion(selectedOption.name),
      }));
      setErrors((prev) => ({ ...prev, locationName: null }));

      // Mark location and region as modified if coordinates changed
      if (destination) {
        const originalLocation = `POINT(${
          destination.location?.match(/POINT\(([^ ]+) ([^ ]+)\)/)?.[1]
        } ${destination.location?.match(/POINT\(([^ ]+) ([^ ]+)\)/)?.[2]})`;
        const newLocation = `POINT(${selectedOption.lon} ${selectedOption.lat})`;
        if (originalLocation !== newLocation) {
          setModifiedFields((prev) => new Set([...prev, "location"]));
        }

        const newRegion = extractRegion(selectedOption.name);
        if (newRegion !== destination.region) {
          setModifiedFields((prev) => new Set([...prev, "region"]));
        }
      }
    }
  };

  const handleLocationInputChange = (event, value) => {
    setFormData((prev) => ({ ...prev, locationName: value }));
    fetchLocationSuggestions(value);
  };

  const handleLocationSearch = (e) => {
    if (e.key === "Enter" && formData.locationName) {
      fetchLocationCoordinates(formData.locationName);
    }
  };

  // Form validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.capacity <= 0)
      newErrors.capacity = "Capacity must be greater than 0";

    // For new destinations, location is required
    if (!destination && !formData.locationName.trim()) {
      newErrors.locationName = "Location is required for new destinations";
    }

    // Check NZ geographic bounds only if coordinates are provided
    if (formData.lat !== 0 && formData.lon !== 0) {
      if (
        formData.lat < -47 ||
        formData.lat > -35 ||
        formData.lon < 166 ||
        formData.lon > 179
      ) {
        newErrors.locationName =
          "Location outside NZ bounds (-35 to -47 lat, 166 to 179 lon)";
      }
    }

    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const slug = slugify(formData.name, { lower: true, strict: true });
    const currentLocation = `POINT(${formData.lon} ${formData.lat})`;
    const currentStatus =
      formData.status.charAt(0).toUpperCase() + formData.status.slice(1);

    // Always include required fields for both new and existing destinations
    const submitData = {
      name: formData.name,
      description: formData.description,
      capacity: parseInt(formData.capacity),
      status: currentStatus,
      region:
        formData.region ||
        extractRegion(formData.locationName || formData.name),
    };

    // Include location if coordinates are available
    if (formData.lat !== 0 && formData.lon !== 0) {
      submitData.location = currentLocation;
    } else if (destination?.location) {
      // Keep existing location if no new coordinates
      submitData.location = destination.location;
    }

    // Handle photos - always include photos array
    const photoPaths = [];

    // Add thumbnail path
    if (thumbnail) {
      photoPaths.push(`${slug}/${slug}-thumbnail.jpg`);
    } else if (destination?.thumbnail) {
      // Keep existing thumbnail if no new one uploaded
      photoPaths.push(destination.thumbnail);
    } else {
      photoPaths.push("default-thumbnail.jpg");
    }

    // Add additional photos
    if (photos.length > 0) {
      // Add new photos
      for (let i = 0; i < photos.length; i++) {
        photoPaths.push(`${slug}/${slug}-${i + 1}.jpg`);
      }
    } else if (destination?.photos && destination.photos.length > 1) {
      // Keep existing additional photos if no new ones uploaded
      photoPaths.push(...destination.photos.slice(1));
    }

    submitData.photos = photoPaths;

    console.log("Submitting data:", submitData);
    onSubmit(submitData);
  };

  return (
    <form className={classes.destinationForm} onSubmit={handleFormSubmit}>
      <TextField
        label={`Name ${modifiedFields.has("name") ? "✎" : ""}`}
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        error={!!errors.name}
        helperText={
          errors.name || (modifiedFields.has("name") ? "Modified" : "")
        }
        fullWidth
        margin="normal"
        sx={getFieldStyle("name")}
      />

      <TextField
        label={`Description ${modifiedFields.has("description") ? "✎" : ""}`}
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
        error={!!errors.description}
        helperText={
          errors.description ||
          (modifiedFields.has("description") ? "Modified" : "")
        }
        fullWidth
        margin="normal"
        multiline
        rows={2}
        sx={getFieldStyle("description")}
      />

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
            label={`Location Name (e.g., Auckland) ${
              modifiedFields.has("location") ? "✎" : ""
            }`}
            required={!destination}
            error={!!errors.locationName}
            helperText={
              errors.locationName ||
              (modifiedFields.has("location")
                ? "Location Modified"
                : "Type to search locations in NZ")
            }
            fullWidth
            margin="normal"
            sx={getFieldStyle("location")}
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

      <FormControl fullWidth margin="normal" sx={getFieldStyle("region")}>
        <InputLabel>
          Region {modifiedFields.has("region") ? "✎" : ""}
        </InputLabel>
        <Select
          name="region"
          value={formData.region}
          onChange={handleChange}
          label={`Region ${modifiedFields.has("region") ? "✎" : ""}`}
        >
          <MenuItem value="">
            <em>Auto-detect from location</em>
          </MenuItem>
          {NZ_REGIONS.map((region) => (
            <MenuItem key={region} value={region}>
              {region}
            </MenuItem>
          ))}
        </Select>
        {modifiedFields.has("region") && (
          <Typography
            variant="caption"
            sx={{ color: "#48d9f3", marginTop: "4px" }}
          >
            Modified
          </Typography>
        )}
      </FormControl>

      <TextField
        label={`Capacity ${modifiedFields.has("capacity") ? "✎" : ""}`}
        name="capacity"
        type="number"
        value={formData.capacity}
        onChange={handleChange}
        required
        error={!!errors.capacity}
        helperText={
          errors.capacity || (modifiedFields.has("capacity") ? "Modified" : "")
        }
        fullWidth
        margin="normal"
        inputProps={{ min: 1 }}
        sx={getFieldStyle("capacity")}
      />

      <Box sx={{ marginBottom: "1rem" }}>
        <Typography variant="body2" sx={{ marginBottom: "0.5rem" }}>
          Thumbnail {destination && "- Upload new to replace existing"}
        </Typography>
        {destination?.thumbnail && !thumbnail && (
          <Box sx={{ marginBottom: "0.5rem" }}>
            <img
              src={`/images/destinations/${destination.thumbnail}`}
              alt="Current thumbnail"
              style={{
                width: "100px",
                height: "50px",
                objectFit: "cover",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
            <Typography
              variant="caption"
              sx={{ display: "block", color: "gray" }}
            >
              Current thumbnail
            </Typography>
          </Box>
        )}
        <input type="file" accept="image/*" onChange={handleThumbnailChange} />
      </Box>

      <Box sx={{ marginBottom: "1rem" }}>
        <Typography variant="body2" sx={{ marginBottom: "0.5rem" }}>
          Additional Photos (up to 5){" "}
          {destination && "- Upload new to replace existing"}
        </Typography>
        {destination?.photos &&
          destination.photos.length > 1 &&
          photos.length === 0 && (
            <Box
              sx={{
                marginBottom: "0.5rem",
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              {destination.photos.slice(1).map((photo, index) => (
                <Box key={index}>
                  <img
                    src={`/images/destinations/${photo}`}
                    alt={`Current photo ${index + 1}`}
                    style={{
                      width: "80px",
                      height: "40px",
                      objectFit: "cover",
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ display: "block", color: "gray", fontSize: "0.7rem" }}
                  >
                    Photo {index + 1}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handlePhotosChange}
        />
      </Box>

      <FormControl
        fullWidth
        margin="normal"
        error={!!errors.status}
        sx={getFieldStyle("status")}
      >
        <InputLabel>
          Status {modifiedFields.has("status") ? "✎" : ""}
        </InputLabel>
        <Select name="status" value={formData.status} onChange={handleChange}>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
          <MenuItem value="maintenance">Maintenance</MenuItem>
        </Select>
        {modifiedFields.has("status") && (
          <Typography
            variant="caption"
            sx={{ color: "#1976d2", marginTop: "4px" }}
          >
            Modified
          </Typography>
        )}
      </FormControl>

      {destination && modifiedFields.size > 0 && (
        <Box
          sx={{
            marginBottom: "1rem",
            padding: "1rem",
            backgroundColor: "#e3f2fd",
            borderRadius: "4px",
            border: "1px solid #48d9f3",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, marginBottom: "0.5rem" }}
          >
            Fields to be updated:
          </Typography>
          <Typography variant="body2" sx={{ color: "#1976d2" }}>
            {Array.from(modifiedFields)
              .map((field) => {
                const fieldNames = {
                  name: "Name",
                  description: "Description",
                  capacity: "Capacity",
                  status: "Status",
                  location: "Location",
                  thumbnail: "Thumbnail",
                  photos: "Photos",
                };
                return fieldNames[field] || field;
              })
              .join(", ")}
          </Typography>
        </Box>
      )}

      <div className={classes.formActions}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={destination && modifiedFields.size === 0}
        >
          {destination
            ? `Update ${
                modifiedFields.size > 0
                  ? `(${modifiedFields.size} changes)`
                  : "Destination"
              }`
            : "Create Destination"}
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default DestinationForm;
