import { Request, Response } from "express";
import z from "zod";
import {
  createOfferModel,
  getAllOffersModel,
  getOffersByOperatorModel,
  updateOfferModel,
  deleteOfferModel,
  findOfferById,
} from "../models/offerModel";

// Zod schema for offer validation
const offerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  max_slots: z.number().min(1, "Max slots must be at least 1"),
  available_from: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid available_from date",
  }),
  available_to: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid available_to date",
  }),
  status: z.enum(["active", "inactive", "sold_out"]).default("active"),
  destination_ids: z
    .array(z.number().positive())
    .min(1, "At least one destination is required"),
  operator_id: z.number().positive().optional(), // Required for admins, ignored for operators
});

// Create a new offer
export const createOffer = async (req: Request, res: Response) => {
  try {
    const data = offerSchema.parse(req.body);

    // Validate date range
    if (new Date(data.available_to) <= new Date(data.available_from)) {
      return res
        .status(400)
        .json({ error: "available_to must be after available_from" });
    }

    // Determine operator_id based on user role
    let operatorId: number;
    if (req.user!.role === "operator") {
      operatorId = req.user!.userId; // Use authenticated operator's userId
    } else if (req.user!.role === "admin") {
      if (!data.operator_id) {
        return res
          .status(400)
          .json({ error: "operator_id is required for admin users" });
      }
      operatorId = data.operator_id;
    } else {
      return res.status(403).json({ error: "Forbidden" });
    }

    const offerId = await createOfferModel(
      operatorId,
      data.name,
      data.description,
      data.price,
      data.max_slots,
      data.available_from,
      data.available_to,
      data.status,
      data.destination_ids
    );
    res.status(201).json({ offer_id: offerId });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Offer create error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all offers (admin)
export const getAllOffers = async (req: Request, res: Response) => {
  try {
    const { status, date } = req.query;

    // Validate query parameters
    let validatedFilters: { status?: string; date?: string } = {};
    if (
      status &&
      !["active", "inactive", "sold_out"].includes(status as string)
    ) {
      return res.status(400).json({
        error: "Invalid status. Use 'active', 'inactive', or 'sold_out'.",
      });
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date as string)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    if (status) validatedFilters.status = status as string;
    if (date) validatedFilters.date = date as string;

    const offers = await getAllOffersModel(validatedFilters);
    res.json(offers);
  } catch (error: any) {
    console.error("Offers fetch error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get offers by operator
export const getOffersByOperator = async (req: Request, res: Response) => {
  try {
    const operatorId = parseInt(req.params.operatorId, 10);
    if (isNaN(operatorId)) {
      return res.status(400).json({ error: "Invalid operator ID" });
    }

    // Check if operator is accessing their own offers
    if (req.user!.role === "operator" && req.user!.userId !== operatorId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { status, date } = req.query;

    // Validate query parameters
    let validatedFilters: { status?: string; date?: string } = {};
    if (
      status &&
      !["active", "inactive", "sold_out"].includes(status as string)
    ) {
      return res.status(400).json({
        error: "Invalid status. Use 'active', 'inactive', or 'sold_out'.",
      });
    }
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date as string)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    if (status) validatedFilters.status = status as string;
    if (date) validatedFilters.date = date as string;

    const offers = await getOffersByOperatorModel(operatorId, validatedFilters);
    if (!offers.length && req.user!.role === "operator") {
      return res
        .status(404)
        .json({ error: "No offers found for this operator" });
    }
    res.json(offers);
  } catch (error: any) {
    console.error("Operator offers fetch error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an offer
export const updateOffer = async (req: Request, res: Response) => {
  try {
    const offerId = parseInt(req.params.id, 10);
    if (isNaN(offerId)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }

    const offer = await findOfferById(offerId);
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    // Check if operator is updating their own offer
    if (
      req.user!.role === "operator" &&
      req.user!.userId !== offer.operator_id
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const data = offerSchema.parse(req.body);

    // Validate date range
    if (new Date(data.available_to) <= new Date(data.available_from)) {
      return res
        .status(400)
        .json({ error: "available_to must be after available_from" });
    }

    const updatedId = await updateOfferModel(
      offerId,
      data.name,
      data.description,
      data.price,
      data.max_slots,
      data.available_from,
      data.available_to,
      data.status,
      data.destination_ids || []
    );
    res.json({ offer_id: updatedId });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Offer update error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an offer
export const deleteOffer = async (req: Request, res: Response) => {
  try {
    const offerId = parseInt(req.params.id, 10);
    if (isNaN(offerId)) {
      return res.status(400).json({ error: "Invalid offer ID" });
    }

    const offer = await findOfferById(offerId);
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }

    // Check if operator is deleting their own offer
    if (
      req.user!.role === "operator" &&
      req.user!.userId !== offer.operator_id
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await deleteOfferModel(offerId);
    res.status(204).send();
  } catch (error: any) {
    console.error("Offer delete error:", {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};
