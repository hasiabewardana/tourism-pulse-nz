import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "./db";

const register = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  if (!["admin", "operator", "public"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    "INSERT INTO auth.users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id",
    [email, passwordHash, role]
  );
  res.status(201).json({ userId: result[0].user_id });
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await query("SELECT * FROM auth.users WHERE email = $1", [
    email,
  ]);
  if (result.length === 0)
    return res.status(404).json({ error: "User not found" });
  const user = result[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );
  await query(
    "INSERT INTO auth.sessions (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
    [user.user_id, token]
  );
  res.json({ token });
};

export { register, login };
