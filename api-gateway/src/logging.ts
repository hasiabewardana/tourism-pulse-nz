import morgan from "morgan";
import express from "express";

/**
 * Configure HTTP request logging using Morgan.
 * Uses the combined format for detailed logging of all requests.
 */
export const setupLogging = (app: express.Application) => {
  app.use(morgan("combined"));
};
