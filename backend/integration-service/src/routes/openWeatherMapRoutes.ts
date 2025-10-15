import { Router } from "express";
import { getWeather } from "../controllers/openWeatherMapController";

const router = Router();

router.get("/v1/weather", getWeather);

export default router;
