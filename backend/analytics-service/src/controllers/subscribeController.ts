import { Request, Response } from "express";
import {
  toggleSubscription as toggleSubscriptionModel,
  checkSubscription as checkSubscriptionModel,
} from "../models/subscriptionModel";

export const toggleSubscription = async (req: Request, res: Response) => {
  const { operatorId, destinationId, subscribed } = req.body;
  if (!operatorId || !destinationId || subscribed === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await toggleSubscriptionModel(operatorId, destinationId, subscribed);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update subscription" });
  }
};

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
    res.status(500).json({ error: "Failed to check subscription" });
  }
};
