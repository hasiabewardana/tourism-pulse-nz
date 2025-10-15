import { Request, Response } from "express";
import z from "zod";
import {
  getAllDestinations,
  findDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} from "../models/destinationModel";
import { extractRegion } from "../utils/regionParser";

// Input validation schema for destination data
const destinationSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: z.string().optional(),
  capacity: z.number().min(0),
  photos: z.array(z.string()).min(1).optional(),
  region: z.string().optional(),
});

/**
 * Retrieve all destinations with optional filtering.
 * Supports filtering by status, availability, date, and region.
 */
export const getDestinations = async (req: Request, res: Response) => {
  try {
    const { status, availability, date, region } = req.query;

    let validatedFilters: {
      status?: string;
      availability?: "Full" | "Available";
      date?: string;
      region?: string;
    } = {};

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

    if (status) validatedFilters.status = status as string;
    if (availability)
      validatedFilters.availability = availability as "Full" | "Available";
    if (date) validatedFilters.date = date as string;
    if (region) validatedFilters.region = region as string;

    const destinations = await getAllDestinations(validatedFilters);

    // Add thumbnail to each destination
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
    console.error("Destinations fetch error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Retrieve a specific destination by ID.
 */
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

/**
 * Create a new destination.
 * Automatically extracts region from the destination name if not provided.
 */
export const addDestination = async (req: Request, res: Response) => {
  try {
    const data = destinationSchema.parse(req.body);

    const region = data.region || extractRegion(data.name || "");

    const destinationId = await createDestination(
      data.name,
      data.description,
      data.location ?? null,
      data.capacity,
      data.photos || ["https://default-destination-thumbnail.jpg"],
      region
    );
    res.status(201).json({ destinationId });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update an existing destination with new information.
 */
export const modifyDestination = async (req: Request, res: Response) => {
  try {
    const destinationId = parseInt(req.params.id, 10);
    const data = destinationSchema.parse(req.body);

    const region = data.region || extractRegion(data.name || "");

    const updatedId = await updateDestination(
      destinationId,
      data.name,
      data.description,
      data.location ?? null,
      data.capacity,
      data.photos || ["https://default-destination-thumbnail.jpg"],
      region
    );
    res.json({ destinationId: updatedId });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Delete a destination from the database.
 */
export const removeDestination = async (req: Request, res: Response) => {
  try {
    const destinationId = parseInt(req.params.id, 10);
    await deleteDestination(destinationId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
