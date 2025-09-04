// content/admin-panel/src/components/booking-management/BookingList.js
import { useState, useEffect } from "react";
import Booking from "./Booking"; // Import Booking component
import BookingForm from "./BookingForm"; // Import BookingForm for create/edit
import classes from "./Booking.module.css"; // Import CSS module for styling

// Component to list all bookings, handle CRUD operations
function BookingList() {
  const [bookings, setBookings] = useState([]); // State for booking list
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [selectedBooking, setSelectedBooking] = useState(null); // Selected booking for edit

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/dest/api/v1/bookings", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setBookings(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError(
          "Failed to fetch bookings. Please check your token or try logging in again."
        );
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Handle booking creation or update
  const handleSubmit = async (bookingData) => {
    const token = localStorage.getItem("token");
    const method = selectedBooking ? "PUT" : "POST";
    const url = selectedBooking
      ? `http://localhost:3000/dest/api/v1/bookings/${selectedBooking.booking_id}`
      : "http://localhost:3000/dest/api/v1/bookings";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const updatedBooking = await res.json();

      if (selectedBooking) {
        // Update existing booking in list
        setBookings(
          bookings.map((b) =>
            b.booking_id === selectedBooking.booking_id ? updatedBooking : b
          )
        );
      } else {
        // Add new booking to list
        setBookings([...bookings, updatedBooking]);
      }

      setShowModal(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error("Error saving booking:", err);
      setError("Failed to save booking.");
    }
  };

  // Handle booking deletion
  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3000/dest/api/v1/bookings/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setBookings(bookings.filter((b) => b.booking_id !== bookingId));
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking.");
    }
  };

  // Open modal for edit
  const handleEdit = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  // Open modal for create
  const handleCreate = () => {
    setSelectedBooking(null);
    setShowModal(true);
  };

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p>Error: {error}</p>;
  if (bookings.length === 0) return <p>No bookings found.</p>;

  return (
    <div className={classes.bookingList}>
      <h1 className={classes.title}>Bookings</h1>
      <button className={classes.createButton} onClick={handleCreate}>
        Create New Booking
      </button>
      <div className={classes.grid}>
        {bookings.map((booking) => (
          <Booking
            key={booking.booking_id}
            booking={booking}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      {showModal && (
        <div className={classes.modal}>
          <div className={classes.modalContent}>
            <BookingForm
              booking={selectedBooking}
              onSubmit={handleSubmit}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingList;
