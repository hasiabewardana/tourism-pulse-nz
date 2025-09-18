import { Request, Response } from "express";
import z from "zod";
import {
  getAllBookings,
  getBookingsByUserId,
  getBookingsByOperatorId,
  findBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../models/bookingModel";

// Validation schema for creating a booking
const createBookingSchema = z.object({
  offerId: z.number().min(1),
  userId: z.number().min(1).optional(), // Optional for now, must be provided
  bookingDate: z.string().datetime(),
  visitorCount: z.number().min(1),
  status: z
    .enum(["confirmed", "cancelled", "pending"])
    .optional()
    .default("pending"),
  price: z.number().min(0),
  operatorId: z.number().min(1).optional(), // Optional if fetched from offer
});

// Schema for updating a booking (all optional except at least one field)
const updateBookingSchema = z
  .object({
    offerId: z.number().min(1).optional(),
    userId: z.number().min(1).optional(),
    bookingDate: z.string().datetime().optional(),
    visitorCount: z.number().min(1).optional(),
    status: z.enum(["confirmed", "cancelled", "pending"]).optional(),
    price: z.number().min(0).optional(),
    operatorId: z.number().min(1).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field must be provided for update",
  });

// Get all bookings
export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (error) {
    console.error(error); // Log for debugging
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all bookings by user ID
export const getUserBookings = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const bookings = await getBookingsByUserId(userId);
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all bookings by operator ID
export const getOperatorBookings = async (req: Request, res: Response) => {
  try {
    const operatorId = parseInt(req.params.operatorId, 10);
    const bookings = await getBookingsByOperatorId(operatorId);
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const booking = await findBookingById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a new booking
export const addBooking = async (req: Request, res: Response) => {
  try {
    const data = createBookingSchema.parse(req.body);

    if (!data.userId) {
      return res.status(400).json({ error: "userId is required for bookings" });
    }

    // TODO: Optionally calculate price = offer.price * visitorCount (requires offers query)
    // TODO: Auto-set operatorId from offers table if omitted

    const bookingId = await createBooking(
      data.offerId,
      data.userId,
      data.bookingDate,
      data.visitorCount,
      data.status,
      data.price,
      data.operatorId
    );
    res
      .status(201)
      .json({ bookingId, message: "Booking created successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues.map((e) => e.message).join(", ") });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an existing booking
export const modifyBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const data = updateBookingSchema.parse(req.body);

    const existingBooking = await findBookingById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Use existing values for unspecified fields
    const updatedId = await updateBooking(
      bookingId,
      data.offerId ?? existingBooking.offer_id,
      data.userId ?? existingBooking.user_id,
      data.bookingDate ?? existingBooking.booking_date.toISOString(),
      data.visitorCount ?? existingBooking.visitor_count,
      data.status ?? existingBooking.status,
      data.price ?? existingBooking.price,
      data.operatorId ?? existingBooking.operator_id
    );
    res.json({ bookingId: updatedId, message: "Booking updated successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues.map((e) => e.message).join(", ") });
    }
    if (
      error instanceof Error &&
      error.message.includes("No fields to update")
    ) {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a booking
export const removeBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const existingBooking = await findBookingById(bookingId);
    if (!existingBooking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    await deleteBooking(bookingId);
    res.status(204).json({ message: "Booking deleted successfully" }).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
