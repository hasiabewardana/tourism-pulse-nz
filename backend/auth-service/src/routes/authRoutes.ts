import { Router } from "express"; // Import Express Router
import { register, login } from "../controllers/authController"; // Import controllers

const router = Router(); // Create router instance

router.post("/v1/register", register); // Define register route
router.post("/v1/login", login); // Define login route

export default router; // Export router for use in index.ts
