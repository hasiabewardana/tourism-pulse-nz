import express from "express";
import healthRoutes from "./routes/healthRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/auth-service/api", healthRoutes);
app.use("/auth-service/api", authRoutes);
app.use("/auth-service/api", userRoutes);

// Centralized error handling for the service
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(`[AUTH-SERVICE ERROR] ${err.message}`, {
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

const PORT = process.env.PORT || 3001; // Use PORT from .env or default to 3001
app.listen(PORT, () => {
  console.log(`✓ Auth service running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
}); // Start server
