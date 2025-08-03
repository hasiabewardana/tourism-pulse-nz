import express, { Request, Response, NextFunction } from "express"; // Importing Express and its types for middleware
import { RouteConfig } from "./routes/routes"; // Importing route configuration interface

const checkCredit = (req: Request) => {
  // Function to simulate credit check for premium access
  return new Promise((resolve, reject) => {
    // Using Promise for asynchronous credit validation
    console.log("Checking credit with token", req.headers["authorization"]); // Logging the authorization header
    setTimeout(() => {
      // Simulating delay for credit check process
      reject("No sufficient credits"); // Rejecting with error if credits are insufficient
    }, 500);
  });
};

export const setupCreditCheck = (
  app: express.Application,
  routes: RouteConfig[]
) => {
  // Function to configure credit check middleware
  routes.forEach((r) => {
    // Iterating over each route to apply credit check
    if (r.creditCheck) {
      // Checking if credit check is required for the route
      app.use(r.url, (req: Request, res: Response, next: NextFunction) => {
        // Defining custom middleware
        checkCredit(req) // Executing credit check
          .then(() => next()) // Proceeding to next middleware if credit check passes
          .catch((error) => res.status(402).send({ error })); // Sending error response if credit check fails
      });
    }
  });
};
