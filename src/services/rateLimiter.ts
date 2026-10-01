import { redisClient } from "../config/redis.js";

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 10;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

export async function checkRateLimit(
  key: string,
): Promise<RateLimitResult> {
  if (!redisClient.isReady) {
    return {
      allowed: true,
      remaining: MAX_REQUESTS,
      retryAfter: 0,
    };
  }

  try {
    const currentCount = await redisClient.incr(key);

    if (currentCount === 1) {
      await redisClient.expire(key, WINDOW_SECONDS);
    }

    const allowed = currentCount <= MAX_REQUESTS;
    const remaining = Math.max(0, MAX_REQUESTS - currentCount);

    let retryAfter = 0;

    if (!allowed) {
      const ttl = await redisClient.ttl(key);
      retryAfter = Math.max(0, ttl);
    }

    return {
      allowed,
      remaining,
      retryAfter,
    };
  } catch (error) {
    console.error("Rate limiter failed:", error);

    return {
      allowed: true,
      remaining: MAX_REQUESTS,
      retryAfter: 0,
    };
  }
}
