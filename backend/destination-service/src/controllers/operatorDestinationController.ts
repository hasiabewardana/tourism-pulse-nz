import { Request, Response } from "express";
import z from "zod";
import {
  assignOperatorToDestination,
  getDestinationsByOperator,
  getOperatorsByDestination,
  removeOperatorFromDestination,
} from "../models/operatorDestinationModel";
import { findDestinationById } from "../models/destinationModel";

// Zod schema for operator-destination assignment
const operatorDestinationSchema = z.object({
  userId: z.number().min(1),
  destinationId: z.number().min(1),
});

// Assign an operator to a destination
export const assignOperator = async (req: Request, res: Response) => {
  try {
    const data = operatorDestinationSchema.parse(req.body);

    // Verify destination exists
    const destination = await findDestinationById(data.destinationId);
    if (!destination) {
      return res.status(404).json({ error: "Destination not found" });
    }

    // For operators, ensure they can only assign themselves unless admin
    if (req.user?.role === "operator" && req.user?.userId !== data.userId) {
      return res
        .status(403)
        .json({ error: "Operators can only assign themselves" });
    }

    const operatorDestinationId = await assignOperatorToDestination(
      data.userId,
      data.destinationId
    );
    if (!operatorDestinationId) {
      return res
        .status(409)
        .json({ error: "Operator already assigned to destination" });
    }
    res.status(201).json({ operatorDestinationId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Assign operator error:", {
      message: error,
      stack: error,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get destinations managed by an operator
export const getOperatorDestinations = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    // Operators can only view their own destinations
    if (req.user?.role === "operator" && req.user?.userId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const destinations = await getDestinationsByOperator(userId);
    const response = destinations.map((d: any) => ({
      ...d,
      thumbnail: d.photos?.[0] || "https://default-destination-thumbnail.jpg",
    }));
    res.json(response);
  } catch (error) {
    console.error("Get operator destinations error:", {
      message: error,
      stack: error,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get operators for a destination
export const getDestinationOperators = async (req: Request, res: Response) => {
  try {
    const destinationId = parseInt(req.params.destinationId, 10);

    // Verify destination exists
    const destination = await findDestinationById(destinationId);
    if (!destination) {
      return res.status(404).json({ error: "Destination not found" });
    }

    const operators = await getOperatorsByDestination(destinationId);
    res.json(operators);
  } catch (error) {
    console.error("Get destination operators error:", {
      message: error,
      stack: error,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Remove an operator from a destination
export const removeOperator = async (req: Request, res: Response) => {
  try {
    const { userId, destinationId } = operatorDestinationSchema.parse(req.body);

    // Verify destination exists
    const destination = await findDestinationById(destinationId);
    if (!destination) {
      return res.status(404).json({ error: "Destination not found" });
    }

    // Operators can only remove themselves unless admin
    if (req.user?.role === "operator" && req.user?.userId !== userId) {
      return res
        .status(403)
        .json({ error: "Operators can only remove themselves" });
    }

    const operatorDestinationId = await removeOperatorFromDestination(
      userId,
      destinationId
    );
    if (!operatorDestinationId) {
      return res
        .status(404)
        .json({ error: "Operator-destination assignment not found" });
    }
    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Remove operator error:", {
      message: error,
      stack: error,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};
