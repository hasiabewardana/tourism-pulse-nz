import { createClient } from "redis";
import config from "../config/redis.json";

const redisClient = createClient({
  url: `redis://${config.host}:${config.port}/${config.db}`,
  password: config.password,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

(async () => {
  await redisClient.connect();
})();

export default redisClient;
