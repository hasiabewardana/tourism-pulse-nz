import rateLimit from "express-rate-limit"; // Importing rate-limit middleware for request throttling
import express from "express"; // Importing express for type definitions
import { RouteConfig } from "./routes/routes"; // Importing route configuration interface

export const setupRateLimit = (
  app: express.Application,
  routes: RouteConfig[]
) => {
  // Function to configure rate limiting
  routes.forEach((r) => {
    // Iterating over each route to apply rate limiting
    if (r.rateLimit) {
      // Checking if rate limiting is configured for the route
      app.use(r.url, rateLimit(r.rateLimit)); // Applying rate limiting with specified constraints
    }
  });
};
