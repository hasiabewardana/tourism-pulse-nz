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
  destinationId: number | undefined,
  userId: number | undefined,
  bookingDate: string | undefined,
  visitorCount: number | undefined,
  status: string
) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (destinationId !== undefined) {
    fields.push(`destination_id = $${index++}`);
    values.push(destinationId);
  }
  if (userId !== undefined) {
    fields.push(`user_id = $${index++}`);
    values.push(userId);
  }
  if (bookingDate !== undefined) {
    fields.push(`booking_date = $${index++}`);
    values.push(bookingDate);
  }
  if (visitorCount !== undefined) {
    fields.push(`visitor_count = $${index++}`);
    values.push(visitorCount);
  }
  fields.push(`status = $${index++}`);
  values.push(status);

  if (fields.length === 0) throw new Error("No fields to update");

  const queryStr = `UPDATE dest.bookings SET ${fields.join(
    ", "
  )} WHERE booking_id = $${index} RETURNING booking_id`;
  values.push(bookingId);

  const result = await query(queryStr, values);
  return result[0].booking_id;
};

// Delete a booking
export const deleteBooking = async (bookingId: number) => {
  await query("DELETE FROM dest.bookings WHERE booking_id = $1", [bookingId]);
};
