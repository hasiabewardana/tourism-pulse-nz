import { Router } from "express"; // Import Express Router
import { register, login, users } from "../controllers/authController"; // Import controllers

const router = Router(); // Create router instance

router.post("/v1/register", register); // Define register route
router.post("/v1/login", login); // Define login route
router.get("/v1/users", users); // Define getAllUsers route

export default router; // Export router for use in index.ts
