import { Router } from "express"; // Import Express Router
import {
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  logout,
  getSessions,
  revokeSessionById,
} from "../controllers/userController"; // Import user controllers
import { authenticate, authorize } from "../middleware/authMiddleware"; // Import auth middleware

const router = Router(); // Create router instance

// Protected routes
router.use(authenticate); // All below require authentication

// Admin-only
router.get("/v1/users", authorize(["admin"]), getUsers);
router.get("/v1/users/:id", authorize(["admin"]), getUserById);
router.put("/v1/users/:id", authorize(["admin"]), updateUserById);
router.delete("/v1/users/:id", authorize(["admin"]), deleteUserById);
router.get("/v1/sessions/:userId", authorize(["admin"]), getSessions); // Admin views any user's sessions
router.delete(
  "/v1/sessions/:sessionId",
  authorize(["admin"]),
  revokeSessionById
); // Admin revokes any session

// All roles (self-management)
router.put("/v1/profile", updateUserById); // Use req.user.userId internally if no :id
router.get("/v1/sessions", getSessions); // Self sessions
router.post("/v1/logout", logout);

export default router; // Export router for use in index.ts
