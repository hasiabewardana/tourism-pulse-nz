import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import z from "zod";
import {
  createUser,
  findUserByEmail,
  createSession,
} from "../models/authModel";

// Input validation schema for user registration
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["admin", "operator", "public"]),
});

// Input validation schema for user login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * Register a new user account.
 * Validates input, checks for existing users, hashes the password, and creates the account.
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = registerSchema.parse(
      req.body
    );

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log(`Registration failed: User already exists - ${email}`);
      return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
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

/**
 * Authenticate a user and issue a JWT token.
 * Verifies credentials, generates a token, and creates a session.
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await findUserByEmail(email);
    if (!user) {
      console.log(`Login failed: User not found - ${email}`);
      return res.status(404).json({ error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      console.log(`Login failed: Invalid credentials - ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

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
