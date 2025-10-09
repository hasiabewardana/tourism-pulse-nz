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
import classes from "./BookingForm.module.css"; // New CSS module for theme

function BookingForm({ offer, booking, onSubmit, onCancel }) {
  const getInitialDate = () => {
    if (booking?.bookingDate) {
      const date = new Date(booking.bookingDate);
      return date.toISOString();
    }
    if (offer?.available_from) {
      return offer.available_from;
    }
    return new Date().toISOString();
  };

  const [formData, setFormData] = useState({
    bookingDate: getInitialDate(),
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
      offerId: offer.offer_id || offer.id, // Use offer_id from database
      bookingDate: formData.bookingDate,
      visitorCount: formData.visitorCount,
      status: formData.status,
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleFormSubmit} className={classes.form}>
        <Typography variant="h6" className={classes.title}>
          {booking ? "Edit Booking" : "Book Offer"}: {offer.name}
        </Typography>
        <DateTimePicker
          label="Booking Date & Time"
          value={new Date(formData.bookingDate)}
          onChange={(newValue) => {
            if (newValue) {
              const year = newValue.getFullYear();
              const month = String(newValue.getMonth() + 1).padStart(2, "0");
              const day = String(newValue.getDate()).padStart(2, "0");
              const hours = String(newValue.getHours()).padStart(2, "0");
              const minutes = String(newValue.getMinutes()).padStart(2, "0");
              const seconds = String(newValue.getSeconds()).padStart(2, "0");
              const milliseconds = String(newValue.getMilliseconds()).padStart(
                3,
                "0"
              );
              const timezoneOffset = -newValue.getTimezoneOffset();
              const offsetHours = String(
                Math.floor(Math.abs(timezoneOffset) / 60)
              ).padStart(2, "0");
              const offsetMinutes = String(
                Math.abs(timezoneOffset) % 60
              ).padStart(2, "0");
              const offsetSign = timezoneOffset >= 0 ? "+" : "-";
              const isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
              handleChange("bookingDate", isoString);
            }
          }}
          minDateTime={new Date(offer.available_from)}
          maxDateTime={new Date(offer.available_to)}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              error: !!errors.bookingDate,
              helperText: errors.bookingDate,
              className: classes.datePicker,
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
          className={classes.textField}
        />
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
        >
          <Button
            type="submit"
            variant="contained"
            className={classes.submitButton}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            onClick={onCancel}
            className={classes.cancelButton}
          >
            Cancel
          </Button>
        </Box>
      </form>
    </LocalizationProvider>
  );
}

export default BookingForm;
