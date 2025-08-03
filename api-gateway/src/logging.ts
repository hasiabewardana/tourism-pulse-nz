import morgan from "morgan"; // Importing morgan for HTTP request logging
import express from "express"; // Importing express for type definitions

export const setupLogging = (app: express.Application) => {
  // Function to configure logging middleware
  app.use(morgan("combined")); // Applying 'combined' format logging to capture detailed request info
};
