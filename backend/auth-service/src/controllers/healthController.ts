import { Request, Response } from "express"; // Import Express types
import pool from "../services/db"; // Import database pool
import os from "os"; // Import OS module for system stats

const healthCheck = async (req: Request, res: Response) => {
  // Handle health check
  try {
    await pool.query("SELECT 1"); // Test database connection
    const uptime = process.uptime(); // Get service uptime
    res.status(200).json({
      status: "ok",
      message: "Service and database are healthy",
      uptime: `${uptime} seconds`, // Include uptime in response
      memoryUsage: `${(os.totalmem() - os.freemem()) / 1024 / 1024} MB used`, // Include memory usage
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "Service unhealthy",
      details: error instanceof Error ? error.message : String(error),
    }); // Return error on failure
  }
};

export { healthCheck };
