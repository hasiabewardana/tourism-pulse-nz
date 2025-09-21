import { Request, Response } from "express";
import z from "zod";
import weatherService from "../services/openWeatherMapService";

// Zod schema for weather request
const weatherSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

// Get weather for coordinates
export const getWeather = async (req: Request, res: Response) => {
  try {
    const { lat, lon } = weatherSchema.parse({
      lat: parseFloat(req.query.lat as string),
      lon: parseFloat(req.query.lon as string),
    });

    const weather = await weatherService.getWeather(lat, lon);
    if (!weather) {
      return res.status(503).json({ error: "Weather service unavailable" });
    }

    res.json(weather);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Weather handler error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
