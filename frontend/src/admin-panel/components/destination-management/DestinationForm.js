// src/admin-panel/components/destination-management/DestinationForm.js
import { useState } from "react";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import classes from "./Destination.module.css";

function DestinationForm({ destination, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: destination?.name || "",
    description: destination?.description || "",
    capacity: destination?.capacity || 0,
    photos: destination?.photos?.[0] || "",
    status: destination?.status?.toLowerCase() || "open",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.capacity <= 0)
      newErrors.capacity = "Capacity must be greater than 0";
    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
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
        inputProps={{ min: 0 }}
      />
      <TextField
        label="Photo URL (Thumbnail)"
        name="photos"
        value={formData.photos}
        onChange={handleChange}
        fullWidth
        margin="normal"
        placeholder="https://example.com/image.jpg"
      />
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
