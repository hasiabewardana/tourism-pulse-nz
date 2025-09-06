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
