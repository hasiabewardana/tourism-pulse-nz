import { Request, Response, NextFunction } from "express"; // Import Express types
import jwt from "jsonwebtoken"; // For token verification

// Declare module augmentation for Express Request
declare module "express" {
  interface Request {
    user?: { userId: number; role: string }; // Optional to handle unauthenticated cases
  }
}

interface JwtPayload {
  userId: number;
  role: string;
}

// List of API paths exempt from token check
const EXEMPT_PATHS = [
  "/v1/destinations/public",
  // Add more public endpoints here as needed
];

// Middleware to authenticate and authorize users
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if the current path is exempt from token check
  if (EXEMPT_PATHS.includes(req.path)) {
    // Set a default user role for public access
    req.user = { userId: 0, role: "public" }; // Default public user
    return next();
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { userId: decoded.userId, role: decoded.role }; // Attach decoded payload
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Middleware to authorize based on user roles
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };
};
