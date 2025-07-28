import { Router } from "express"; // Import Express Router
import { healthCheck } from "../controllers/healthController"; // Import controller

const router = Router(); // Create router instance

router.get("/health", healthCheck); // Define health check route

export default router; // Export router for use in index.ts
