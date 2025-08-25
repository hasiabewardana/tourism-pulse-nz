import { query } from "../services/db"; // Import query function

// Create user in database
export const createUser = async (
  email: string,
  passwordHash: string,
  firstName: string,
  lastName: string,
  role: string
) => {
  // Insert user and return user ID
  const result = await query(
    "INSERT INTO auth.users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING user_id",
    [email, passwordHash, firstName, lastName, role]
  );
  return result[0].user_id;
};

// Find user by email
export const findUserByEmail = async (email: string) => {
  // Query user by email
  const result = await query(
    "SELECT user_id, password_hash, first_name, last_name, role FROM auth.users WHERE email = $1",
    [email]
  );
  return result[0] || null;
};

// Find user by ID
export const findUserById = async (userId: number) => {
  // Query user by ID
  const result = await query(
    "SELECT user_id, email, first_name, last_name, role FROM auth.users WHERE user_id = $1",
    [userId]
  );
  return result[0] || null;
};

// Get all users with query options
export const getAllUsers = async () => {
  const result = await query("SELECT * FROM auth.users");
  return result;
};

// Update user details
export const updateUser = async (
  userId: number,
  email: string,
  firstName: string,
  lastName: string,
  role: string,
  passwordHash?: string
) => {
  const fields = [];
  const values = [];
  let index = 1;

  // Dynamically build query based on provided fields
  if (email) {
    fields.push(`email = $${index++}`);
    values.push(email);
  }
  if (firstName) {
    fields.push(`first_name = $${index++}`);
    values.push(firstName);
  }
  if (lastName) {
    fields.push(`last_name = $${index++}`);
    values.push(lastName);
  }
  if (role) {
    fields.push(`role = $${index++}`);
    values.push(role);
  }
  if (passwordHash) {
    fields.push(`password_hash = $${index++}`);
    values.push(passwordHash);
  }

  if (fields.length === 0) throw new Error("No fields to update");

  // Build and execute update query
  const queryStr = `UPDATE auth.users SET ${fields.join(
    ", "
  )}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $${index} RETURNING user_id`;
  values.push(userId);

  // Execute query and return updated user ID
  const result = await query(queryStr, values);
  return result[0].user_id;
};

// Delete user by ID
export const deleteUser = async (userId: number) => {
  // Delete user from database
  await query("DELETE FROM auth.users WHERE user_id = $1", [userId]);
};

// Create session
export const createSession = async (userId: number, token: string) => {
  // Insert session into database
  await query(
    "INSERT INTO auth.sessions (user_id, token, expires_at) VALUES ($1, $2, NOW() + INTERVAL '1 hour')",
    [userId, token]
  );
};

// Get sessions by user ID
export const getSessionsByUserId = async (userId: number) => {
  // Query active sessions for user
  const result = await query(
    "SELECT session_id, token, expires_at, created_at FROM auth.sessions WHERE user_id = $1 AND expires_at > NOW()",
    [userId]
  );
  return result;
};

// Revoke session by ID
export const revokeSession = async (sessionId: string) => {
  // Delete session from database
  await query("DELETE FROM auth.sessions WHERE session_id = $1", [sessionId]);
};

// Revoke all sessions for a user
export const revokeAllSessionsForUser = async (userId: number) => {
  // Delete all sessions for user
  await query("DELETE FROM auth.sessions WHERE user_id = $1", [userId]);
};
