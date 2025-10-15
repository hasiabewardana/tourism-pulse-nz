import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Server } from "ws";
import http from "http";
import dotenv from "dotenv";
import { query } from "./services/db";
import subscribeRoutes from "./routes/subscribeRoutes";
import healthRoutes from "./routes/healthRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import { URL } from "url";
import { connectMongoDB } from "./config/mongodb";
import { initializeScheduledJobs } from "./jobs/scheduledJobs";
import { startDataSyncJobs, performFullSync } from "./jobs/dataSync";

dotenv.config();
const CAPACITY_THRESHOLD = Number(process.env.CAPACITY_THRESHOLD) || 80;

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3006",
      "http://localhost:3001",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Establish MongoDB connection and initialize data synchronization
connectMongoDB()
  .then(() => {
    console.log("✓ MongoDB connected successfully");
    performFullSync();
    startDataSyncJobs();
    console.log("✓ Analytics data sync started");
  })
  .catch((err) => {
    console.error("✗ Failed to connect to MongoDB:", err);
    process.exit(1);
  });

initializeScheduledJobs();
console.log("✓ Scheduled jobs initialized");

// Configure WebSocket server for real-time analytics updates
const server = http.createServer(app);
const wss = new Server({ server });

// Track active WebSocket connections per operator
const operatorConnections = new Map();

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "", "http://localhost");
  const operatorId = url.searchParams.get("operatorId")?.toString();
  if (!operatorId) {
    console.log("No operatorId provided, closing connection");
    ws.close();
    return;
  }

  if (!operatorConnections.has(operatorId)) {
    operatorConnections.set(operatorId, new Set());
  }
  operatorConnections.get(operatorId).add(ws);
  console.log(`Client connected for operator ${operatorId}`);

  // Send real-time capacity updates every few seconds
  const interval = setInterval(async () => {
    try {
      const result = await query(
        `SELECT d.destination_id, d.name, d.capacity, 
                COALESCE(SUM(b.visitor_count), 0) as current_visitors,
                CASE WHEN d.capacity > 0 THEN 
                    ROUND((COALESCE(SUM(b.visitor_count), 0) * 100.0 / d.capacity), 2)
                ELSE 0 END as occupancy_percentage
         FROM dest.destinations d
         LEFT JOIN dest.offer_items oi ON d.destination_id = oi.destination_id
         LEFT JOIN dest.offers o ON oi.offer_id = o.offer_id
         LEFT JOIN dest.bookings b ON o.offer_id = b.offer_id 
           AND b.status = 'confirmed'
           AND DATE(b.booking_date) = CURRENT_DATE
         WHERE d.status = 'Open'
         GROUP BY d.destination_id, d.name, d.capacity`
      );
      const data = result;

      operatorConnections
        .get(operatorId)
        ?.forEach((client: import("ws").WebSocket) => {
          if (client.readyState === 1)
            client.send(JSON.stringify({ type: "capacity", data }));
        });

      // Check subscriptions and send alerts
      for (const item of data) {
        const subscriptionCheck = await query(
          `SELECT subscribed FROM dest.subscriptions 
           WHERE operator_id = $1 AND destination_id = $2`,
          [operatorId, item.destination_id]
        );
        const isSubscribed = subscriptionCheck[0]?.subscribed || false;

        if (isSubscribed && item.occupancy_percentage > CAPACITY_THRESHOLD) {
          const alertMsg = JSON.stringify({
            type: "alert",
            message: `Capacity exceeded ${CAPACITY_THRESHOLD}% at ${item.name} (ID: ${item.destination_id})`,
          });
          console.log(
            `⚠ Capacity alert: ${item.name} at ${item.occupancy_percentage}%`
          );
          operatorConnections
            .get(operatorId)
            ?.forEach((client: import("ws").WebSocket) => {
              if (client.readyState === 1) client.send(alertMsg);
            });
        }
      }
    } catch (err) {
      console.error("WebSocket error:", err);
    }
  }, 5000);

  ws.on("close", () => {
    const operatorWsSet = operatorConnections.get(operatorId);
    if (operatorWsSet) {
      operatorWsSet.delete(ws);
      if (operatorWsSet.size === 0) operatorConnections.delete(operatorId);
    }
    clearInterval(interval);
    console.log(`Client disconnected for operator ${operatorId}`);
  });
});

// Mount routes
app.use("/analytics-service/api", healthRoutes);
app.use("/analytics-service/api", dashboardRoutes);
app.use("/analytics-service/api", subscribeRoutes);

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(`[ANALYTICS-SERVICE ERROR] ${err.message}`, {
      url: req.url,
      method: req.method,
    });
    res.status(err.status || 500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  }
);

const PORT = 3003;
server.listen(PORT, () => {
  console.log(`✓ Analytics service running on port ${PORT}`);
  console.log(`✓ WebSocket server ready on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
});
