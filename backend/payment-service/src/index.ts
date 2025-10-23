import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentRoutes from "./routes/paymentRoutes";
import { rawBodyMiddleware } from "./middleware/rawBodyMiddleware";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3005;

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3006", // Frontend dev server
    "http://localhost:3000", // API Gateway
    process.env.FRONTEND_URL || "http://localhost:8080", // Docker/Production
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Raw body middleware for Stripe webhooks (must be before express.json)
app.use(rawBodyMiddleware);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    service: "payment-service",
    timestamp: new Date().toISOString(),
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
  });
});

// API routes
app.use("/api/payments", paymentRoutes);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    service: "TourismPulseNZ Payment Service",
    version: "1.0.0",
    description: "Stripe payment processing for tourism bookings",
    endpoints: {
      health: "/health",
      config: "/api/payments/config",
      createIntent: "POST /api/payments/create-intent",
      paymentStatus: "GET /api/payments/:paymentIntentId/status",
      bookingPayment: "GET /api/payments/booking/:bookingId",
      userPayments: "GET /api/payments/user/:userId",
      cancelPayment: "POST /api/payments/:paymentIntentId/cancel",
      refund: "POST /api/payments/refund",
      webhook: "POST /api/payments/webhook",
    },
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Payment Service running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `💳 Stripe: ${
      process.env.STRIPE_SECRET_KEY ? "Configured" : "NOT CONFIGURED"
    }`
  );
  console.log(
    `🌐 CORS enabled for: ${
      process.env.FRONTEND_URL || "http://localhost:8080"
    }`
  );
});

export default app;
