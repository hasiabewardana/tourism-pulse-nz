import { Request, Response, NextFunction } from "express"; // Import Express types
import jwt from "jsonwebtoken"; // For token verification
import { findUserById } from "../models/authModel"; // Import model to find user by ID

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

// Middleware to authenticate and authorize users
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await findUserById(decoded.userId);
    if (!user)
      return res.status(401).json({ error: "Invalid token or user not found" });

    req.user = { userId: user.user_id, role: user.role }; // Attach to req
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
