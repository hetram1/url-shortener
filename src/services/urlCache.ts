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

    const parsed = JSON.parse(value) as UrlRecord;

    return {
      ...parsed,
      created_at: new Date(parsed.created_at),
      expires_at: parsed.expires_at
        ? new Date(parsed.expires_at)
        : null,
    };
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


export async function invalidateCachedUrl(
  shortCode: string,
): Promise<void> {
  if (!redisClient.isReady) {
    return;
  }

  try {
    await redisClient.del(cacheKey(shortCode));
  } catch (error) {
    console.error("Redis cache invalidation failed:", error);
  }
}
