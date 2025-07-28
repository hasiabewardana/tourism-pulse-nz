import { Router } from "express"; // Import Express Router
import { register, login } from "../controllers/authController"; // Import controllers

const router = Router(); // Create router instance

router.post("/register", register); // Define register route
router.post("/login", login); // Define login route

export default router; // Export router for use in index.ts
