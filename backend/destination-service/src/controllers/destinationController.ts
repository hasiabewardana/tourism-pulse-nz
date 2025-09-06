import { Request, Response } from "express";
import z from "zod";
import {
  getAllDestinations,
  findDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} from "../models/destinationModel";

// Zod schema for destination validation
const destinationSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(), // GeoJSON or WKT string
  capacity: z.number().min(0),
  photos: z.array(z.string().url()).min(1).optional(),
});

// Get all destinations
export const getDestinations = async (req: Request, res: Response) => {
  try {
    const { status, availability, date } = req.query;

    // Basic validation
    let validatedFilters: any = {};
    if (status && !["Open", "Closed"].includes(status as string)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Use 'Open' or 'Closed'." });
    }
    if (
      availability &&
      !["Full", "Available"].includes(availability as string)
    ) {
      return res
        .status(400)
        .json({ error: "Invalid availability. Use 'Full' or 'Available'." });
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date as string)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    // Only include validated filters if they exist and are valid
    validatedFilters = {
      status: (status as string) || undefined,
      availability: availability as "Full" | "Available" | undefined,
      date: (date as string) || undefined,
    };

    const destinations = await getAllDestinations(validatedFilters);

    // Map for thumbnail (as before)
    const response = destinations.map((d: any) => ({
      ...d,
      thumbnail:
        (d.photos as string[])?.[0] ||
        "https://default-destination-thumbnail.jpg",
    }));

    res.json(response);
  } catch (error: any) {
    if (error.message.includes("Invalid date")) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Destinations fetch error:", error); // Log for debugging
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get destination by ID
export const getDestinationById = async (req: Request, res: Response) => {
  try {
    const destinationId = parseInt(req.params.id, 10);
    const destination = await findDestinationById(destinationId);
    if (!destination)
      return res.status(404).json({ error: "Destination not found" });
    res.json(destination);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add new destination
export const addDestination = async (req: Request, res: Response) => {
  try {
    const data = destinationSchema.parse(req.body);
    const destinationId = await createDestination(
      data.name,
      data.location ?? null,
      data.capacity,
      data.photos || ["https://default-destination-thumbnail.jpg"]
    );
    res.status(201).json({ destinationId });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update existing destination
export const modifyDestination = async (req: Request, res: Response) => {
  try {
    const destinationId = parseInt(req.params.id, 10);
    const data = destinationSchema.parse(req.body);
    const updatedId = await updateDestination(
      destinationId,
      data.name,
      data.location ?? null,
      data.capacity,
      data.photos || ["https://default-destination-thumbnail.jpg"]
    );
    res.json({ destinationId: updatedId });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete destination
export const removeDestination = async (req: Request, res: Response) => {
  try {
    const destinationId = parseInt(req.params.id, 10);
    await deleteDestination(destinationId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
