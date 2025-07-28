import { Pool } from "pg"; // Import PostgreSQL client
import dotenv from "dotenv"; // Load environment variables

dotenv.config(); // Load .env file

const pool = new Pool({
  // Create a connection pool
  connectionString: process.env.DATABASE_URL, // Use DATABASE_URL from .env
});

export const query = async (text: string, params?: any[]) => {
  // Async query function
  const client = await pool.connect(); // Acquire a client from the pool
  try {
    const result = await client.query(text, params); // Execute query
    return result.rows; // Return query results
  } finally {
    client.release(); // Release client back to pool
  }
};

export default pool; // Export pool for direct use if needed
