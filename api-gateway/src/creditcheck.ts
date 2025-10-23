import express, { Request, Response, NextFunction } from "express";
import { RouteConfig } from "./routes/routes";

/**
 * Simulate a credit check for premium features.
 * This is a placeholder for future payment integration.
 */
const checkCredit = (req: Request) => {
  return new Promise((resolve, reject) => {
    console.log("Checking credit with token", req.headers["authorization"]);
    setTimeout(() => {
      reject("No sufficient credits");
    }, 500);
  });
};

/**
 * Apply credit check middleware to routes that require payment.
 * Returns 402 Payment Required if credits are insufficient.
 */
export const setupCreditCheck = (
  app: express.Application,
  routes: RouteConfig[]
) => {
  routes.forEach((r) => {
    if (r.creditCheck) {
      app.use(r.url, (req: Request, res: Response, next: NextFunction) => {
        checkCredit(req)
          .then(() => next())
          .catch((error) => res.status(402).send({ error }));
      });
    }
  });
};
