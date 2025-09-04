import { Router } from "express"; // Import Express Router
import { register, login } from "../controllers/authController"; // Import auth controllers
import { authenticate } from "../middleware/authMiddleware"; // Import auth middleware

const router = Router(); // Create router instance

// Public routes
router.post("/v1/register", register);
router.post("/v1/login", login);

// Protected routes
router.use(authenticate); // All below require authentication

export default router; // Export router for use in index.ts
