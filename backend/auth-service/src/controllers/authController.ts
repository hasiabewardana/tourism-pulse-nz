import { Request, Response } from "express"; // Import Express types
import bcrypt from "bcrypt"; // For password hashing
import jwt from "jsonwebtoken"; // For token generation
import {
  createUser,
  findUserByEmail,
  createSession,
} from "../models/authModel"; // Import models

const register = async (req: Request, res: Response) => {
  // Handle user registration
  const { email, password, firstName, lastName, role } = req.body;
  if (!["admin", "operator", "public"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" }); // Validate role
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10); // Hash password
    const userId = await createUser(
      email,
      passwordHash,
      firstName,
      lastName,
      role
    ); // Create user
    res.status(201).json({ userId }); // Return user ID
  } catch (error) {
    res.status(500).json({ error: "Internal server error" }); // Handle errors
  }
};

const login = async (req: Request, res: Response) => {
  // Handle user login
  const { email, password } = req.body;
  try {
    const user = await findUserByEmail(email); // Find user by email
    if (!user) return res.status(404).json({ error: "User not found" });
    const match = await bcrypt.compare(password, user.password_hash); // Compare passwords
    if (!match) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    ); // Generate JWT
    const role = user.role;
    await createSession(user.user_id, token); // Create session
    res.json({ token, role }); // Return token
  } catch (error) {
    res.status(500).json({ error: "Internal server error" }); // Handle errors
  }
};

export { register, login };
