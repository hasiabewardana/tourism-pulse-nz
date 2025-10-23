import axios from "axios";
import redisClient from "../lib/redisClient";
import dotenv from "dotenv";

dotenv.config();

class WeatherService {
  private readonly CACHE_TTL = 1800; // Cache weather data for 30 minutes

  /**
   * Fetch current weather data for a location.
   * Results are cached to reduce API calls and improve response times.
   */
  async getWeather(lat: number, lon: number) {
    const cacheKey = `weather:${lat.toFixed(4)}:${lon.toFixed(4)}`;
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      console.log("Loaded OWM_API_KEY:", process.env.OWM_API_KEY);
      if (!process.env.OWM_API_KEY) {
        throw new Error("OWM_API_KEY is not set in environment variables");
      }

      const baseUrl =
        process.env.OWM_BASE_URL ||
        "https://api.openweathermap.org/data/2.5/weather";
      const fullUrl = `${baseUrl}?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${process.env.OWM_API_KEY}`;
      console.log("Calling weather URL:", fullUrl);

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
      });
      console.log(
        "Raw API response structure:",
        Object.keys(response.data as object)
      );

      const data = response.data as any;

      await redisClient.set(cacheKey, JSON.stringify(data), {
        EX: this.CACHE_TTL,
      });
      return data;
    } catch (error: any) {
      console.error(
        "Weather fetch error:",
        error.message,
        error.response?.data
      );
      return null;
    }
  }
}

export default new WeatherService();
