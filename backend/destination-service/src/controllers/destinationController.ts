import { Request, Response } from "express";
import z from "zod";
import {
  getAllDestinations,
  findDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} from "../models/destinationModel";

const destinationSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(), // GeoJSON or WKT string
  capacity: z.number().min(0),
  photos: z.array(z.string().url()).min(1).optional(),
});

export const getDestinations = async (req: Request, res: Response) => {
  try {
    const destinations = await getAllDestinations();
    // Return list with thumbnail (first photo)
    const response = destinations.map((d) => ({
      ...d,
      thumbnail: d.photos?.[0] || "https://default-destination-thumbnail.jpg",
    }));
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

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

export const removeDestination = async (req: Request, res: Response) => {
  try {
    const destinationId = parseInt(req.params.id, 10);
    await deleteDestination(destinationId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
