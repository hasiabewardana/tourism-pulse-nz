import { Request, Response } from "express";
import bcrypt from "bcrypt";
import z from "zod";
import {
  getAllUsers,
  findUserById,
  updateUser,
  deleteUser,
  getSessionsByUserId,
  revokeSession,
  revokeAllSessionsForUser,
} from "../models/authModel";

// Input validation schema for updating user information
const updateUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.enum(["admin", "operator", "public"]).optional(),
});

/**
 * Retrieve all users from the database.
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Retrieve a specific user by their ID.
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Update user information including password if provided.
 */
export const updateUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const data = updateUserSchema.parse(req.body);
    let passwordHash: string | undefined;
    if (data.password) passwordHash = await bcrypt.hash(data.password, 10);

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

/**
 * Permanently delete a user account from the database.
 */
export const deleteUserById = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id, 10);
    await deleteUser(userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Log out a user by revoking their session(s).
 * Can revoke a specific session or all sessions for the user.
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const sessionId = req.body.sessionId;
    if (sessionId) {
      await revokeSession(sessionId);
    } else {
      await revokeAllSessionsForUser(req.user!.userId);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Retrieve all active sessions for a user.
 */
export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(
      req.params.userId || req.user!.userId.toString(),
      10
    );
    const sessions = await getSessionsByUserId(userId);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Revoke a specific session, effectively logging out that device/browser.
 */
export const revokeSessionById = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    await revokeSession(sessionId);
    res.json({ message: "Session revoked" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
