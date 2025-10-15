import express from "express";
import cors from "cors";
import helmet from "helmet";
import openWeatherMapRoutes from "./routes/openWeatherMapRoutes";
import statsnzRoutes from "./routes/statsnzRoutes";
import contactRoutes from "./routes/contactRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/integration-service/api", openWeatherMapRoutes);
app.use("/integration-service/api/statsnz", statsnzRoutes);
app.use("/integration-service/api", contactRoutes);

// Centralized error handling for external API integrations
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(`[INTEGRATION-SERVICE ERROR] ${err.message}`, {
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

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`✓ Integration service running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
});
