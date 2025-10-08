import express from "express";
import { setupLogging } from "./logging"; // Importing logging setup for request tracking
import { setupProxies } from "./proxy"; // Importing proxy setup for routing to microservices
import { setupRateLimit } from "./ratelimit"; // Importing rate limiting setup for load control
import { setupCreditCheck } from "./creditcheck"; // Importing credit check setup for premium access
import { ROUTES } from "./routes/routes"; // Importing route configurations for the API gateway
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const app = express(); // Initializing Express application as the API gateway
const port = process.env.PORT || 3000; // Setting port from environment variable or default to 3000

// Load OpenAPI specification
let swaggerDocument;
try {
  swaggerDocument = YAML.load(path.join(__dirname, "../../docs/openapi.yaml"));
  console.log("✓ OpenAPI specification loaded successfully");
} catch (error) {
  console.error("✗ Failed to load OpenAPI specification:", error);
  swaggerDocument = null;
}

// Allow frontend origin
app.use(
  cors({
    origin: "http://localhost:3005", // allow frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Swagger UI setup
if (swaggerDocument) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "TourismPulseNZ API Documentation",
      customfavIcon: "/favicon.ico",
    })
  );
  console.log("✓ Swagger UI configured at /api-docs");
}

// API documentation redirect
app.get("/", (req, res) => {
  if (swaggerDocument) {
    res.redirect("/api-docs");
  } else {
    res.status(503).json({ error: "API documentation unavailable" });
  }
});

// Applying middleware in sequence for request processing
setupLogging(app); // Configuring logging to track all incoming requests
setupRateLimit(app, ROUTES); // Applying rate limiting based on route configurations
setupCreditCheck(app, ROUTES); // Implementing credit checks for premium routes
setupProxies(app, ROUTES); // Setting up proxy rules to route requests to backend services

// Global error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(`[ERROR] ${err.message}`, {
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

app.listen(port, () => {
  // Starting the server and listening on the specified port
  console.log(`✓ API Gateway running on port ${port}`);
  console.log(`✓ API Documentation: http://localhost:${port}/api-docs`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || "development"}`);
});
