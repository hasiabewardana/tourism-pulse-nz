import { Request, Response } from "express";
import z from "zod";
import {
  getAllBookings,
  findBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from "../models/bookingModel";

// Validation schema for booking data
const bookingSchema = z.object({
  destinationId: z.number().min(1),
  userId: z.number().min(1),
  bookingDate: z.string().datetime(),
  visitorCount: z.number().min(1),
  status: z.enum(["confirmed", "cancelled", "pending"]),
});

// Get all bookings
export const getBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await getAllBookings();
    res.json(bookings);
  } catch (error) {
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
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add a new booking
export const addBooking = async (req: Request, res: Response) => {
  try {
    const data = bookingSchema.parse(req.body);
    const bookingId = await createBooking(
      data.destinationId,
      data.userId,
      data.bookingDate,
      data.visitorCount,
      data.status
    );
    res.status(201).json({ bookingId });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an existing booking
export const modifyBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    const data = bookingSchema.parse(req.body);
    const updatedId = await updateBooking(
      bookingId,
      data.destinationId,
      data.userId,
      data.bookingDate,
      data.visitorCount,
      data.status
    );
    res.json({ bookingId: updatedId });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a booking
export const removeBooking = async (req: Request, res: Response) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    await deleteBooking(bookingId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
