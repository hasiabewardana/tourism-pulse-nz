import express from "express"; // Importing express for type definitions
import { createProxyMiddleware } from "http-proxy-middleware"; // Importing proxy middleware for request routing
import { RouteConfig } from "./routes/routes"; // Importing route configuration interface

export const setupProxies = (
  app: express.Application,
  routes: RouteConfig[]
) => {
  // Function to configure proxy middleware
  routes.forEach((r) => {
    // Iterating over each route to set up proxy
    app.use(r.url, createProxyMiddleware(r.proxy)); // Applying proxy middleware for the specified route
  });
};
