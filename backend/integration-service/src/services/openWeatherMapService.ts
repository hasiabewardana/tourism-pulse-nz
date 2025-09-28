import axios from "axios";
import redisClient from "../lib/redisClient";
import dotenv from "dotenv";

dotenv.config(); // Ensure this is loaded; consider moving to index.ts for global scope

class WeatherService {
  private readonly CACHE_TTL = 1800; // 30 minutes in seconds

  async getWeather(lat: number, lon: number) {
    const cacheKey = `weather:${lat.toFixed(4)}:${lon.toFixed(4)}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      console.log("Loaded OWM_API_KEY:", process.env.OWM_API_KEY); // Debug key
      if (!process.env.OWM_API_KEY) {
        throw new Error("OWM_API_KEY is not set in environment variables");
      }

      const baseUrl =
        process.env.OWM_BASE_URL ||
        "https://api.openweathermap.org/data/2.5/weather";
      const fullUrl = `${baseUrl}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${process.env.OWM_API_KEY}`;
      console.log("Calling weather URL:", fullUrl); // Remove in prod

      const response = await axios.get(baseUrl, {
        params: {
          lat,
          lon,
          exclude: "minutely,hourly,alerts",
          units: "metric",
          appid: process.env.OWM_API_KEY,
        },
        timeout: 5000,
      });

      console.log("Axios config:", {
        baseUrl,
        params: {
          lat,
          lon,
          exclude: "minutely,hourly,alerts",
          units: "metric",
          appid: process.env.OWM_API_KEY,
        },
      }); // Debug config
      console.log(
        "Raw API response structure:",
        Object.keys(response.data as object)
      ); // Debug structure

      const data = response.data as any; // Keep as 'any' to preserve full structure

      await redisClient.set(cacheKey, JSON.stringify(data), {
        EX: this.CACHE_TTL,
      });
      return data; // Return exact API response
    } catch (error: any) {
      console.error(
        "Weather fetch error:",
        error.message,
        error.response?.data
      ); // Log API error details
      return null;
    }
  }
}

export default new WeatherService();
