import { Request, Response } from "express";
import {
  OperatorAnalyticsService,
  AdminAnalyticsService,
} from "../services/realAnalyticsService";

const operatorService = new OperatorAnalyticsService();
const adminService = new AdminAnalyticsService();

export const getOperatorDashboard = async (req: Request, res: Response) => {
  try {
    const operatorId = parseInt(req.params.operatorId);
    const days = parseInt(req.query.days as string) || 30;

    if (!operatorId) {
      return res.status(400).json({ error: "Operator ID is required" });
    }

    const data = await operatorService.getOperatorOverview(operatorId, days);
    res.json(data);
  } catch (error) {
    console.error("Error fetching operator dashboard:", error);
    res.status(500).json({ error: "Failed to fetch operator analytics" });
  }
};

export const getDestinationPerformance = async (
  req: Request,
  res: Response
) => {
  try {
    const operatorId = parseInt(req.params.operatorId);

    if (!operatorId) {
      return res.status(400).json({ error: "Operator ID is required" });
    }

    const data = await operatorService.getDestinationPerformance(operatorId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching destination performance:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch destination performance data" });
  }
};

export const getRevenueBreakdown = async (req: Request, res: Response) => {
  try {
    const operatorId = parseInt(req.params.operatorId);
    const days = parseInt(req.query.days as string) || 30;

    if (!operatorId) {
      return res.status(400).json({ error: "Operator ID is required" });
    }

    const data = await operatorService.getRevenueBreakdown(operatorId, days);
    res.json(data);
  } catch (error) {
    console.error("Error fetching revenue breakdown:", error);
    res.status(500).json({ error: "Failed to fetch revenue breakdown" });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = await adminService.getPlatformOverview(days);
    res.json(data);
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ error: "Failed to fetch platform analytics" });
  }
};

export const getOperatorPerformance = async (req: Request, res: Response) => {
  try {
    const data = await adminService.getOperatorPerformance();
    res.json(data);
  } catch (error) {
    console.error("Error fetching operator performance:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch operator performance data" });
  }
};
