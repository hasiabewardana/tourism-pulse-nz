// src/manager/components/bookings/ManagerBookingForm.js
import { useState } from "react";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from "@mui/material";
// No date picker needed for manager, as they don't edit date/count

function ManagerBookingForm({ offer, booking, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    status: booking?.status || "pending",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!["pending", "confirmed", "cancelled"].includes(formData.status))
      newErrors.status = "Invalid status";
    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({
      status: formData.status,
    });
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Typography variant="h6">Manage Booking: {offer.name}</Typography>
      <Typography variant="body1">
        Booking Date: {new Date(booking.bookingDate).toLocaleString()}
      </Typography>
      <Typography variant="body1">Visitors: {booking.visitorCount}</Typography>
      <Typography variant="body1">
        Tourist: {booking.touristName} ({booking.touristEmail})
      </Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select
          name="status"
          value={formData.status}
          onChange={(e) => handleChange("status", e.target.value)}
          error={!!errors.status}
        >
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="confirmed">Confirmed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>
        {errors.status && (
          <Typography color="error">{errors.status}</Typography>
        )}
      </FormControl>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}>
        <Button type="submit" variant="contained" color="primary">
          Update
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Close
        </Button>
      </Box>
    </form>
  );
}

export default ManagerBookingForm;
