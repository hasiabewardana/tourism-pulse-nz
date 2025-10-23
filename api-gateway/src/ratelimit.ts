import rateLimit from "express-rate-limit";
import express from "express";
import { RouteConfig } from "./routes/routes";

/**
 * Apply rate limiting to routes that have it configured.
 * This prevents abuse by limiting the number of requests from a single client.
 */
export const setupRateLimit = (
  app: express.Application,
  routes: RouteConfig[]
) => {
  routes.forEach((r) => {
    if (r.rateLimit) {
      app.use(r.url, rateLimit(r.rateLimit));
    }
  });
};
