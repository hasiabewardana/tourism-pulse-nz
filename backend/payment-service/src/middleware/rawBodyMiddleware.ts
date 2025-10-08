import { Request, Response, NextFunction } from "express";

/**
 * Middleware to preserve raw body for Stripe webhook signature verification
 * This must be applied BEFORE express.json() for webhook routes
 */
export const rawBodyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.originalUrl === "/api/payments/webhook") {
    let data = "";
    req.setEncoding("utf8");

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      req.body = data;
      next();
    });
  } else {
    next();
  }
};
