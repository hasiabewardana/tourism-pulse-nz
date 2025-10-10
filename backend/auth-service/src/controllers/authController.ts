import { Request, Response } from "express"; // Import Express types
import bcrypt from "bcrypt"; // For password hashing
import jwt from "jsonwebtoken"; // For token generation
import z from "zod"; // For input validation
import {
  createUser,
  findUserByEmail,
  createSession,
} from "../models/authModel"; // Import models

// Schema for registration
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["admin", "operator", "public"]),
});

// Schema for login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Handle user registration
export const register = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { email, password, firstName, lastName, role } = registerSchema.parse(
      req.body
    );
    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log(`Registration failed: User already exists - ${email}`);
      return res.status(409).json({ error: "User already exists" });
    }
    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    // Create user in DB
    const userId = await createUser(
      email,
      passwordHash,
      firstName,
      lastName,
      role
    );
    console.log(`✓ User registered successfully: ${email} (${role})`);
    res.status(201).json({ userId });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.message });
    console.error(`Registration error: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Handle user login
export const login = async (req: Request, res: Response) => {
  try {
    // Validate input
    const { email, password } = loginSchema.parse(req.body);
    // Find user by email
    const user = await findUserByEmail(email);
    if (!user) {
      console.log(`Login failed: User not found - ${email}`);
      return res.status(404).json({ error: "User not found" });
    }
    // Compare passwords
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      console.log(`Login failed: Invalid credentials - ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    // Store session in DB
    await createSession(user.user_id, token);
    console.log(`✓ User logged in successfully: ${email} (${user.role})`);
    res.json({
      userId: user.user_id,
      token,
      role: user.role,
      email: email,
    });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res.status(400).json({ error: error.message });
    console.error(`Login error: ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
};
