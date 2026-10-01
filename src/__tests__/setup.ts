import { pool } from "../config/database.js";
import { redisClient } from "../config/redis.js";

afterAll(async () => {
  await pool.end();

  if (redisClient.isOpen) {
    await redisClient.quit();
  }
});
