import { createClient } from "redis";
import { env } from "./env.js";

export const redisClient = createClient({
  url: env.redisUrl,
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message);
});

export async function connectRedis(): Promise<void> {
  if (redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.connect();
    console.log("Redis connection successful");
  } catch (error) {
    console.error("Redis unavailable. Continuing without cache.");
  }
}
