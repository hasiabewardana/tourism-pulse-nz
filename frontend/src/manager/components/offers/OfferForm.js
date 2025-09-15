// src/manager-dashboard/components/offer-management/OfferForm.js
import { useState, useEffect } from "react";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  TextField,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import classes from "./OfferManagement.module.css";

function OfferForm({ offer, destinations, userId, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: offer?.name || "",
    description: offer?.description || "",
    price: offer?.price || "",
    max_slots: offer?.max_slots || "",
    available_from: offer?.available_from
      ? new Date(offer.available_from)
      : null,
    available_to: offer?.available_to ? new Date(offer.available_to) : null,
    status: offer?.status || "active",
    destination_ids: offer?.destination_ids || [],
  });
  const [assignedDestinations, setAssignedDestinations] = useState([]);
  const [errors, setErrors] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (offer) {
      setFormData({
        name: offer.name || "",
        description: offer.description || "",
        price: offer.price || "",
        max_slots: offer.max_slots || "",
        available_from: offer.available_from
          ? new Date(offer.available_from)
          : null,
        available_to: offer.available_to ? new Date(offer.available_to) : null,
        status: offer.status || "active",
        destination_ids: offer.destination_ids || [],
      });
    }
    fetchAssignedDestinations();
  }, [offer]);

  const fetchAssignedDestinations = async () => {
    if (!token || !userId) {
      console.error("No authentication token or user ID found.");
      setErrors({ api: "No authentication token or user ID found." });
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3000/dest/api/v1/operator-destinations/operator/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setAssignedDestinations(data);
    } catch (err) {
      console.error("Failed to fetch assigned destinations:", err);
      setErrors({ api: "Failed to fetch assigned destinations." });
    }
  };

  // Filter out destinations not assigned to the operator
  const availableDestinations = destinations.filter(
    (dest) =>
      assignedDestinations.some(
        (assigned) => assigned.destination_id === dest.destination_id
      ) && !formData.destination_ids?.includes(dest.destination_id) // Exclude already selected for this offer
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      destination_ids: typeof value === "string" ? value.split(",") : value,
    }));
    if (errors.destination_ids)
      setErrors((prev) => ({ ...prev, destination_ids: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Offer name is required";
    if (!formData.description)
      newErrors.description = "Description is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.max_slots || formData.max_slots <= 0)
      newErrors.max_slots = "Valid max slots is required";
    if (!formData.available_from)
      newErrors.available_from = "Available from date is required";
    if (!formData.available_to)
      newErrors.available_to = "Available to date is required";
    if (!formData.destination_ids?.length)
      newErrors.destination_ids = "At least one destination is required";
    if (!userId) newErrors.userId = "User ID not found. Please log in.";
    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submitData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      max_slots: parseInt(formData.max_slots),
      available_from: formData.available_from.toISOString(),
      available_to: formData.available_to.toISOString(),
      status: formData.status,
      destination_ids: formData.destination_ids.map(Number),
    };

    onSubmit(submitData);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form className={classes.offerForm} onSubmit={handleFormSubmit}>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Creating/Updating Offer for User ID: {userId || "Unknown"}
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Offer Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={!!errors.description}
          helperText={errors.description}
          multiline
          rows={3}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Price ($)"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          error={!!errors.price}
          helperText={errors.price}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Max Slots"
          name="max_slots"
          type="number"
          value={formData.max_slots}
          onChange={handleChange}
          error={!!errors.max_slots}
          helperText={errors.max_slots}
        />

        <DatePicker
          label="Available From"
          value={formData.available_from}
          onChange={(value) => handleDateChange("available_from", value)}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              error: !!errors.available_from,
              helperText: errors.available_from,
            },
          }}
        />

        <DatePicker
          label="Available To"
          value={formData.available_to}
          onChange={(value) => handleDateChange("available_to", value)}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              error: !!errors.available_to,
              helperText: errors.available_to,
            },
          }}
        />

        <FormControl fullWidth margin="normal" error={!!errors.destination_ids}>
          <InputLabel>Destinations (Operator-Assigned Only)</InputLabel>
          <Select
            multiple
            value={formData.destination_ids}
            onChange={handleDestinationChange}
            input={<OutlinedInput label="Destinations" />}
            renderValue={(selected) => (
              <div>
                {selected.map((id) => (
                  <Chip
                    key={id}
                    label={
                      destinations.find((d) => d.destination_id === id)?.name ||
                      id
                    }
                  />
                ))}
              </div>
            )}
          >
            {availableDestinations.map((dest) => (
              <MenuItem key={dest.destination_id} value={dest.destination_id}>
                {dest.name}
              </MenuItem>
            ))}
          </Select>
          {errors.destination_ids && (
            <Typography color="error">{errors.destination_ids}</Typography>
          )}
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Status</InputLabel>
          <Select name="status" value={formData.status} onChange={handleChange}>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>

        {errors.userId && (
          <Typography color="error" sx={{ mt: 1 }}>
            {errors.userId}
          </Typography>
        )}
        {errors.api && (
          <Typography color="error" sx={{ mt: 1 }}>
            {errors.api}
          </Typography>
        )}

        <div className={classes.formActions}>
          <Button type="submit" variant="contained" color="primary">
            {offer ? "Update" : "Create"} Offer
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </LocalizationProvider>
  );
}

export default OfferForm;
