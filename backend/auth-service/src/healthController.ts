import { Request, Response } from "express";
import pool from "./db";
import os from "os";

const healthCheck = async (req: Request, res: Response) => {
  try {
    await pool.query("SELECT 1");
    const uptime = process.uptime();
    res.status(200).json({
      status: "ok",
      message: "Service and database are healthy",
      uptime: `${uptime} seconds`,
      memoryUsage: `${(os.totalmem() - os.freemem()) / 1024 / 1024} MB used`,
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "Service unhealthy",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

export { healthCheck };
