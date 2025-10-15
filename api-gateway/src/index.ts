import express from "express";
import { setupLogging } from "./logging";
import { setupProxies } from "./proxy";
import { setupRateLimit } from "./ratelimit";
import { setupCreditCheck } from "./creditcheck";
import { ROUTES } from "./routes/routes";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const app = express();
const port = process.env.PORT || 3000;

// Load OpenAPI specification for API documentation
let swaggerDocument;
try {
  swaggerDocument = YAML.load(path.join(__dirname, "../../docs/openapi.yaml"));
  console.log("✓ OpenAPI specification loaded successfully");
} catch (error) {
  console.error("✗ Failed to load OpenAPI specification:", error);
  swaggerDocument = null;
}

// Enable CORS for frontend communication
app.use(
  cors({
    origin: "http://localhost:3006",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Configure Swagger UI for interactive API documentation
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

// Redirect root path to API documentation
app.get("/", (req, res) => {
  if (swaggerDocument) {
    res.redirect("/api-docs");
  } else {
    res.status(503).json({ error: "API documentation unavailable" });
  }
});

// Apply middleware layers in the correct order
setupLogging(app);
setupRateLimit(app, ROUTES);
setupCreditCheck(app, ROUTES);
setupProxies(app, ROUTES);

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
