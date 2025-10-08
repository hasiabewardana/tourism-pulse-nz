import { query } from "../services/db"; // Assuming your DB service exports a query function

// Get all bookings (admin only)
export const getAllBookings = async () => {
  const result = await query(
    "SELECT * FROM dest.bookings ORDER BY created_at DESC"
  );
  return result;
};

// Get bookings by user ID (user only, their own)
export const getBookingsByUserId = async (userId: number) => {
  const result = await query(
    `SELECT b.*, o.name as offer_name, o.description as offer_description, 
     o.destination_id, d.name as destination_name
     FROM dest.bookings b
     LEFT JOIN dest.offers o ON b.offer_id = o.offer_id
     LEFT JOIN dest.destinations d ON o.destination_id = d.destination_id
     WHERE b.user_id = $1 
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return result;
};

// Get bookings by operator ID (operator only, their own)
export const getBookingsByOperatorId = async (operatorId: number) => {
  const result = await query(
    "SELECT * FROM dest.bookings WHERE operator_id = $1 ORDER BY created_at DESC",
    [operatorId]
  );
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

// Get offer details by ID (for price calculation)
export const getOfferById = async (offerId: number) => {
  const result = await query(
    "SELECT price, operator_id FROM dest.offers WHERE offer_id = $1",
    [offerId]
  );
  return result[0] || null;
};

// Create a new booking
export const createBooking = async (
  offerId: number,
  userId: number,
  bookingDate: string,
  visitorCount: number,
  status: string,
  price: number,
  operatorId?: number // Optional if auto-set, but included for flexibility
) => {
  const values = [offerId, userId, bookingDate, visitorCount, status, price];
  let queryStr =
    "INSERT INTO dest.bookings (offer_id, user_id, booking_date, visitor_count, status, price";
  const params = [];
  let index = 1;

  params.push(offerId);
  params.push(userId);
  params.push(bookingDate);
  params.push(visitorCount);
  params.push(status);
  params.push(price);
  if (operatorId !== undefined) {
    queryStr += ", operator_id";
    params.push(operatorId);
  }

  queryStr +=
    ") VALUES ($1, $2, $3, $4, $5, $6" +
    (operatorId !== undefined ? ", $7" : "") +
    ") RETURNING booking_id";
  const result = await query(queryStr, params);
  return result[0].booking_id;
};

// Update an existing booking (partial updates)
export const updateBooking = async (
  bookingId: number,
  offerId?: number,
  userId?: number,
  bookingDate?: string,
  visitorCount?: number,
  status?: string,
  price?: number,
  operatorId?: number
) => {
  const fields = [];
  const values = [];
  let index = 1;

  if (offerId !== undefined) {
    fields.push(`offer_id = $${index++}`);
    values.push(offerId);
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
  if (status !== undefined) {
    fields.push(`status = $${index++}`);
    values.push(status);
  }
  if (price !== undefined) {
    fields.push(`price = $${index++}`);
    values.push(price);
  }
  if (operatorId !== undefined) {
    fields.push(`operator_id = $${index++}`);
    values.push(operatorId);
  }

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
