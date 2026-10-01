import { redisClient } from "../config/redis.js";
import { UrlRecord } from "../repositories/urlRepository.js";

const CACHE_TTL_SECONDS = 300;

function cacheKey(shortCode: string): string {
  return `url:${shortCode}`;
}

export async function getCachedUrl(
  shortCode: string,
): Promise<UrlRecord | null> {
  if (!redisClient.isReady) {
    return null;
  }

  try {
    const value = await redisClient.get(cacheKey(shortCode));

    if (!value) {
      return null;
    }

    return JSON.parse(value) as UrlRecord;
  } catch (error) {
    console.error("Redis cache read failed:", error);
    return null;
  }
}

export async function cacheUrl(url: UrlRecord): Promise<void> {
  if (!redisClient.isReady) {
    return;
  }

  try {
    await redisClient.set(
      cacheKey(url.short_code),
      JSON.stringify(url),
      {
        EX: CACHE_TTL_SECONDS,
      },
    );
  } catch (error) {
    console.error("Redis cache write failed:", error);
  }
}
