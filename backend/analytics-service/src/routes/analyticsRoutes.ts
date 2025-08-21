import { Router } from "express"; // Import Express Router
import { createAnalytics } from "../controllers/analyticsController"; // Import controller function

const router = Router(); // Create router instance

router.post("/v1/analytics", createAnalytics); // Define POST route for creating analytics data

export default router; // Export router for use in index.ts
