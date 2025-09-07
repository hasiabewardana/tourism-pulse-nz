// src/admin-panel/components/destination-management/DestinationForm.js
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
} from "@mui/material";
import { readAndCompressImage } from "browser-image-resizer";
import classes from "./Destination.module.css";
import slugify from "slugify";

const config = {
  quality: 0.8,
  maxWidth: 400,
  maxHeight: 200,
  autoRotate: true,
  compressFormat: "JPG",
  // Removed outputType: "base64" - returns Blob by default
};

function DestinationForm({ destination, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: destination?.name || "",
    description: destination?.description || "",
    capacity: destination?.capacity || 0,
    lat: 0,
    lon: 0,
    status: destination?.status?.toLowerCase() || "open",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});

  // Parse location for edit
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
  };

  const saveFile = async (blob, filename, slug) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("file", blob, filename);
      formDataToSend.append("slug", slug);

      const saveUrl = `/save-image`; // Relative URL to same-origin server (port 3005)
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
      // Fallback: Still generate path, but log warning
    }
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const resizedBlob = await readAndCompressImage(file, config); // Returns Blob
        setThumbnail(resizedBlob);

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
      const resizedFiles = await Promise.all(
        files.map((file) => readAndCompressImage(file, config)) // Returns array of Blobs
      );
      setPhotos(resizedFiles);

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

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.capacity <= 0)
      newErrors.capacity = "Capacity must be greater than 0";
    if (
      formData.lat < -47 ||
      formData.lat > -35 ||
      formData.lon < 166 ||
      formData.lon > 179
    )
      newErrors.location =
        "Location outside NZ bounds (-35 to -47 lat, 166 to 179 lon)";
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
    const photoPaths = [
      thumbnail ? `${slug}/${slug}-thumbnail.jpg` : "default-thumbnail.jpg",
    ];
    for (let i = 0; i < photos.length; i++) {
      photoPaths.push(`${slug}/${slug}-${i + 1}.jpg`);
    }

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
      <Box sx={{ display: "flex", gap: 2 }}>
        <TextField
          label="Latitude (-35 to -47)"
          name="lat"
          type="number"
          step="any"
          value={formData.lat}
          onChange={handleChange}
          required
          error={!!errors.location}
          helperText={errors.location || "e.g., -41.2865"}
          sx={{ flex: 1 }}
          inputProps={{ min: -47, max: -35 }}
        />
        <TextField
          label="Longitude (166 to 179)"
          name="lon"
          type="number"
          step="any"
          value={formData.lon}
          onChange={handleChange}
          required
          error={!!errors.location}
          helperText="e.g., 174.7762"
          sx={{ flex: 1 }}
          inputProps={{ min: 166, max: 179 }}
        />
      </Box>
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
        Additional Photos (up to 5, resized to 400x200)
      </Typography>
      <FormControl fullWidth margin="normal" error={!!errors.status}>
        <InputLabel>Status</InputLabel>
        <Select name="status" value={formData.status} onChange={handleChange}>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
          <MenuItem value="maintenance">Maintenance</MenuItem>
        </Select>
      </FormControl>
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
