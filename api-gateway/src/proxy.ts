import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { RouteConfig } from "./routes/routes";

/**
 * Configure proxy middleware to forward requests to backend microservices.
 * Each route is mapped to its corresponding service endpoint.
 */
export const setupProxies = (
  app: express.Application,
  routes: RouteConfig[]
) => {
  routes.forEach((r) => {
    app.use(r.url, createProxyMiddleware(r.proxy));
  });
};
