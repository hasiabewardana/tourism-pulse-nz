// content/admin-panel/src/components/booking-management/Booking.js
import classes from "./Booking.module.css"; // Import CSS module for booking card styles

// Component to display individual booking information in a card format
function Booking({ booking, onEdit, onDelete }) {
  return (
    <div className={classes.bookingCard}>
      <h2>Booking ID: {booking.booking_id}</h2>
      <p>
        <strong>Destination ID:</strong> {booking.destination_id}
      </p>
      <p>
        <strong>User ID:</strong> {booking.user_id}
      </p>
      <p>
        <strong>Date:</strong> {new Date(booking.booking_date).toLocaleString()}
      </p>
      <p>
        <strong>Visitors:</strong> {booking.visitor_count}
      </p>
      <p>
        <strong>Status:</strong> {booking.status}
      </p>
      <div className={classes.actions}>
        <button onClick={() => onEdit(booking)}>Edit</button>
        <button onClick={() => onDelete(booking.booking_id)}>Delete</button>
      </div>
    </div>
  );
}

export default Booking;
