import {
  createUrl,
  findUrlByShortCode,
  incrementClickCount,
  UrlRecord,
} from "../repositories/urlRepository.js";
import { generateShortCode } from "../utils/shortCode.js";

const MAX_COLLISION_RETRIES = 5;

export interface CreateShortUrlInput {
  originalUrl: string;
  expiresAt?: Date | null;
  customAlias?: string | null;
}

export async function createShortUrl(
  input: CreateShortUrlInput,
): Promise<UrlRecord> {
  const {
    originalUrl,
    expiresAt = null,
    customAlias = null,
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

export async function resolveShortUrl(
  shortCode: string,
): Promise<UrlRecord | null> {
  const url = await findUrlByShortCode(shortCode);

  if (!url) {
    return null;
  }

  if (url.expires_at && url.expires_at <= new Date()) {
    return url;
  }

  await incrementClickCount(shortCode);

  return url;
}
