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
const swaggerDocument = YAML.load(
  path.join(__dirname, "../../docs/openapi.yaml")
);

// Allow frontend origin
app.use(
  cors({
    origin: "http://localhost:3005", // allow frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Swagger UI setup
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "TourismPulseNZ API Documentation",
    customfavIcon: "/favicon.ico",
  })
);

// API documentation redirect
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Applying middleware in sequence for request processing
setupLogging(app); // Configuring logging to track all incoming requests
setupRateLimit(app, ROUTES); // Applying rate limiting based on route configurations
setupCreditCheck(app, ROUTES); // Implementing credit checks for premium routes
setupProxies(app, ROUTES); // Setting up proxy rules to route requests to backend services

app.listen(port, () => {
  // Starting the server and listening on the specified port
  console.log(`API Gateway running on port ${port}`);
  console.log(
    `API Documentation available at http://localhost:${port}/api-docs`
  );
});
