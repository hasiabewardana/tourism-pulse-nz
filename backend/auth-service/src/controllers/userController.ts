import { Request, Response } from "express"; // Import Express types
import bcrypt from "bcrypt"; // For password hashing
import z from "zod"; // For input validation
import {
  getAllUsers,
  findUserById,
  updateUser,
  deleteUser,
  getSessionsByUserId,
  revokeSession,
  revokeAllSessionsForUser,
} from "../models/authModel"; // Import models

// Schema for updating user
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(["admin", "operator", "public"]).optional(),
});

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10); // Extract user ID from params
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update user by ID
export const updateUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10); // Extract user ID from params
    const data = updateUserSchema.parse(req.body); // Validate input
    let passwordHash: string | undefined; // Optional password hash
    if (data.password) passwordHash = await bcrypt.hash(data.password, 10); // Hash if provided

    // Update user in DB
    const updatedId = await updateUser(
      userId,
      data.email!,
      data.firstName!,
      data.lastName!,
      data.role!,
      passwordHash
    );
    res.json({ userId: updatedId });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.message });
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete user by ID
export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10); // Extract user ID from params
    await deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Logout user (revoke session)
export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.body.sessionId; // Or extract from token if single session
    if (sessionId) {
      await revokeSession(sessionId); // Revoke specific session
    } else {
      await revokeAllSessionsForUser(req.user!.userId); // Revoke all sessions for user
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get sessions for user
export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(
      req.params.userId || req.user!.userId.toString(),
      10
    ); // Admin can specify, else self
    const sessions = await getSessionsByUserId(userId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// Revoke session by ID
export const revokeSessionById = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    await revokeSession(sessionId);
    res.json({ message: "Session revoked" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
