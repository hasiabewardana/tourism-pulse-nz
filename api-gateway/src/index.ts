import express from "express";
import { setupLogging } from "./logging"; // Importing logging setup for request tracking
import { setupProxies } from "./proxy"; // Importing proxy setup for routing to microservices
import { setupRateLimit } from "./ratelimit"; // Importing rate limiting setup for load control
import { setupCreditCheck } from "./creditcheck"; // Importing credit check setup for premium access
import { ROUTES } from "./routes/routes"; // Importing route configurations for the API gateway

const app = express(); // Initializing Express application as the API gateway
const port = process.env.PORT || 3000; // Setting port from environment variable or default to 3000

app.use(express.json()); // Enabling JSON body parsing for incoming requests

// Applying middleware in sequence for request processing
setupLogging(app); // Configuring logging to track all incoming requests
setupRateLimit(app, ROUTES); // Applying rate limiting based on route configurations
setupCreditCheck(app, ROUTES); // Implementing credit checks for premium routes
setupProxies(app, ROUTES); // Setting up proxy rules to route requests to backend services

app.listen(port, () => {
  // Starting the server and listening on the specified port
  console.log(`API Gateway running on port ${port}`);
});
