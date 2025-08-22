import { query } from "../services/db"; // Import query function

// Create user in database
export const createUser = async (
  email: string,
  passwordHash: string,
  fistName: string,
  lastName: string,
  role: string
) => {
  const result = await query(
    "INSERT INTO auth.users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id",
    [email, passwordHash, fistName, lastName, role]
  );
  return result[0].user_id;
};

// Find user by email
export const findUserByEmail = async (email: string) => {
  const result = await query(
    "SELECT user_id, password_hash, first_name, last_name, role FROM auth.users WHERE email = $1",
    [email]
  );
  return result[0] || null;
};

// Get all users with query options
export const getAllUsers = async () => {
  const result = await query("SELECT * FROM auth.users");
  return result;
};

// Create session
export const createSession = async (userId: number, token: string) => {
  await query(
    "INSERT INTO auth.sessions (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
    [userId, token]
  );
};
