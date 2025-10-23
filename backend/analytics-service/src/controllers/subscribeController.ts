import { Request, Response } from "express";
import {
  toggleSubscription as toggleSubscriptionModel,
  checkSubscription as checkSubscriptionModel,
} from "../models/subscriptionModel";

/**
 * Toggle notification subscription for an operator-destination pair.
 * Operators can subscribe or unsubscribe from capacity alerts.
 */
export const toggleSubscription = async (req: Request, res: Response) => {
  const { operatorId, destinationId, subscribed } = req.body;
  if (!operatorId || !destinationId || subscribed === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await toggleSubscriptionModel(operatorId, destinationId, subscribed);
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to update subscription:", err);
    res.status(500).json({ error: "Failed to update subscription" });
  }
};

/**
 * Check if an operator is subscribed to a destination's alerts.
 */
export const checkSubscription = async (req: Request, res: Response) => {
  const { operatorId, destinationId } = req.query as {
    operatorId?: string;
    destinationId?: string;
  };
  if (!operatorId || !destinationId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const subscribed = await checkSubscriptionModel(
      parseInt(operatorId),
      parseInt(destinationId)
    );
    res.json({ subscribed });
  } catch (err) {
    console.error("Failed to check subscription:", err);
    res.status(500).json({ error: "Failed to check subscription" });
  }
};
