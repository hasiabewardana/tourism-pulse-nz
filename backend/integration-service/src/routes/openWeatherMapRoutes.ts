import { Router } from "express";
import { getWeather } from "../controllers/openWeatherMapController";

const router = Router();

// Public access
router.get("/v1/weather", getWeather); // Get weather data for a location

export default router;
