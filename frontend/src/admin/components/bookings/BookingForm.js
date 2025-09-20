// content/admin-panel/src/components/booking-management/BookingForm.js
import { useState } from "react";
import classes from "./Booking.module.css"; // Reuse CSS module for form styles

// Form component for creating or editing bookings
function BookingForm({ booking, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    destinationId: booking?.destination_id || "",
    userId: booking?.user_id || "",
    bookingDate: booking?.booking_date || "",
    visitorCount: booking?.visitor_count || 1,
    status: booking?.status || "pending",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className={classes.bookingForm} onSubmit={handleFormSubmit}>
      <label>
        Destination ID:
        <input
          type="number"
          name="destinationId"
          value={formData.destinationId}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        User ID:
        <input
          type="number"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Booking Date:
        <input
          type="datetime-local"
          name="bookingDate"
          value={formData.bookingDate}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Visitor Count:
        <input
          type="number"
          name="visitorCount"
          value={formData.visitorCount}
          onChange={handleChange}
          min="1"
          required
        />
      </label>
      <label>
        Status:
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <div className={classes.formActions}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default BookingForm;
