import { query } from "../services/db";

// Get all bookings
export const getAllBookings = async () => {
  const result = await query("SELECT * FROM dest.bookings");
  return result;
};

// Find a booking by ID
export const findBookingById = async (bookingId: number) => {
  const result = await query(
    "SELECT * FROM dest.bookings WHERE booking_id = $1",
    [bookingId]
  );
  return result[0] || null;
};

// Create a new booking
export const createBooking = async (
  destinationId: number,
  userId: number,
  bookingDate: string,
  visitorCount: number,
  status: string
) => {
  const result = await query(
    "INSERT INTO dest.bookings (destination_id, user_id, booking_date, visitor_count, status) VALUES ($1, $2, $3, $4, $5) RETURNING booking_id",
    [destinationId, userId, bookingDate, visitorCount, status]
  );
  return result[0].booking_id;
};

// Update an existing booking
export const updateBooking = async (
  bookingId: number,
  destinationId: number,
  userId: number,
  bookingDate: string,
  visitorCount: number,
  status: string
) => {
  const result = await query(
    "UPDATE dest.bookings SET destination_id = $1, user_id = $2, booking_date = $3, visitor_count = $4, status = $5 WHERE booking_id = $6 RETURNING booking_id",
    [destinationId, userId, bookingDate, visitorCount, status, bookingId]
  );
  return result[0].booking_id;
};

// Delete a booking
export const deleteBooking = async (bookingId: number) => {
  await query("DELETE FROM dest.bookings WHERE booking_id = $1", [bookingId]);
};
