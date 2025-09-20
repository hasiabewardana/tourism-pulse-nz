// src/tourist/components/bookings/BookingForm.js
import { useState, useEffect } from "react";
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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// Assume shared styles or import from OffersPage.module.css if needed

function BookingForm({ offer, booking, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    bookingDate:
      booking?.bookingDate || offer?.available_from || new Date().toISOString(),
    visitorCount: booking?.visitorCount || 1,
    status: booking?.status || "pending",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    const bookingDt = new Date(formData.bookingDate);
    const from = new Date(offer.available_from);
    const to = new Date(offer.available_to);
    if (bookingDt < from || bookingDt > to)
      newErrors.bookingDate = "Date must be within offer availability";
    if (formData.visitorCount < 1 || formData.visitorCount > offer.max_slots)
      newErrors.visitorCount = `Visitors must be 1-${offer.max_slots}`;
    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    // Map to snake_case for backend
    onSubmit({
      offer_id: offer.id,
      booking_date: formData.bookingDate,
      visitor_count: formData.visitorCount,
      status: formData.status,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleFormSubmit}>
        <Typography variant="h6">
          {booking ? "Edit Booking" : "Book Offer"}: {offer.name}
        </Typography>
        <DateTimePicker
          label="Booking Date & Time"
          value={new Date(formData.bookingDate)}
          onChange={(newValue) =>
            handleChange("bookingDate", newValue.toISOString())
          }
          minDateTime={new Date(offer.available_from)}
          maxDateTime={new Date(offer.available_to)}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              error: !!errors.bookingDate,
              helperText: errors.bookingDate,
            },
          }}
        />
        <TextField
          label="Visitor Count"
          name="visitorCount"
          type="number"
          value={formData.visitorCount}
          onChange={(e) =>
            handleChange("visitorCount", parseInt(e.target.value))
          }
          required
          error={!!errors.visitorCount}
          helperText={errors.visitorCount}
          fullWidth
          margin="normal"
          inputProps={{ min: 1, max: offer.max_slots }}
        />
        {booking && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              disabled={booking.status === "confirmed"} // Cannot change if confirmed
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        )}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
}

export default BookingForm;
