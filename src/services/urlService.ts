import {
  createUrl,
  deleteUrlByShortCode,
  findUrlByShortCode,
  updateUrlByShortCode,
  findUrlsByUserId,
  recordClickEvent,
  UrlRecord,
} from "../repositories/urlRepository.js";
import { generateShortCode } from "../utils/shortCode.js";
import {
  cacheUrl,
  getCachedUrl,
  invalidateCachedUrl,
} from "./urlCache.js";

const MAX_COLLISION_RETRIES = 5;

export interface CreateShortUrlInput {
  originalUrl: string;
  expiresAt?: Date | null;
  customAlias?: string | null;
  userId: string;
}

export async function createShortUrl(
  input: CreateShortUrlInput,
): Promise<UrlRecord> {
  const {
    originalUrl,
    expiresAt = null,
    customAlias = null,
    userId,
  } = input;

  if (!originalUrl || !originalUrl.trim()) {
    throw new Error("Original URL is required");
  }

  try {
    new URL(originalUrl.trim());
  } catch {
    throw new Error("Original URL must be a valid URL");
  }

  let alias = customAlias?.trim() || null;

  if (alias) {
    if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
      throw new Error(
        "Custom alias can only contain letters, numbers, hyphens, and underscores",
      );
    }

    if (alias.length < 3 || alias.length > 50) {
      throw new Error("Custom alias must be between 3 and 50 characters");
    }
  }

  if (alias) {
    try {
      return await createUrl(
        alias,
        originalUrl.trim(),
        expiresAt,
        alias,
        userId,
      );
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        throw new Error("Custom alias is already in use");
      }

      throw error;
    }
  }

  for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt += 1) {
    const shortCode = generateShortCode();

    try {
      return await createUrl(
        shortCode,
        originalUrl.trim(),
        expiresAt,
        null,
        userId,
      );
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Unable to generate a unique short code");
}

function isUniqueViolation(error: unknown): boolean {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error
  ) {
    return (error as { code?: string }).code === "23505";
  }

  return false;
}

export interface ClickMetadata {
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
}

export async function resolveShortUrl(
  shortCode: string,
  clickMetadata?: ClickMetadata,
): Promise<UrlRecord | null> {
  const cachedUrl = await getCachedUrl(shortCode);

  if (cachedUrl) {
    if (cachedUrl.expires_at && cachedUrl.expires_at <= new Date()) {
      return cachedUrl;
    }

    await recordClickEvent({
      urlId: cachedUrl.id,
      ipAddress: clickMetadata?.ipAddress ?? null,
      userAgent: clickMetadata?.userAgent ?? null,
      referrer: clickMetadata?.referrer ?? null,
    });

    return cachedUrl;
  }

  const url = await findUrlByShortCode(shortCode);

  if (!url) {
    return null;
  }

  if (url.expires_at && url.expires_at <= new Date()) {
    return url;
  }

  await cacheUrl(url);

  await recordClickEvent({
    urlId: url.id,
    ipAddress: clickMetadata?.ipAddress ?? null,
    userAgent: clickMetadata?.userAgent ?? null,
    referrer: clickMetadata?.referrer ?? null,
  });

  return url;
}


export async function listUserUrls(
  userId: string,
  limit: number = 20,
  offset: number = 0,
): Promise<UrlRecord[]> {
  return findUrlsByUserId(userId, {
    limit,
    offset,
  });
}


export async function deleteUserUrl(
  shortCode: string,
  userId: string,
): Promise<boolean> {
  const deleted = await deleteUrlByShortCode(
    shortCode,
    userId,
  );

  if (!deleted) {
    return false;
  }

  await invalidateCachedUrl(shortCode);

  return true;
}


export async function updateUserUrl(
  shortCode: string,
  userId: string,
  originalUrl: string,
  expiresAt: Date | null,
): Promise<UrlRecord | null> {
  if (!originalUrl || !originalUrl.trim()) {
    throw new Error("Original URL is required");
  }

  const normalizedUrl = originalUrl.trim();

  try {
    new URL(normalizedUrl);
  } catch {
    throw new Error("Original URL must be a valid URL");
  }

  const updatedUrl = await updateUrlByShortCode(
    shortCode,
    userId,
    normalizedUrl,
    expiresAt,
  );

  if (!updatedUrl) {
    return null;
  }

  await invalidateCachedUrl(shortCode);

  return updatedUrl;
}
