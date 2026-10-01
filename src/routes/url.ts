import { Router } from "express";
import { createShortUrl, listUserUrls } from "../services/urlService.js";
import { requireAuth } from "../middleware/auth.js";
import { rateLimitUrlCreation } from "../middleware/rateLimit.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const rawLimit = req.query.limit;
    const rawOffset = req.query.offset;

    const limit = rawLimit === undefined
      ? 20
      : Number(rawLimit);

    const offset = rawOffset === undefined
      ? 0
      : Number(rawOffset);

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        error: "limit must be an integer between 1 and 100",
      });
    }

    if (!Number.isInteger(offset) || offset < 0) {
      return res.status(400).json({
        error: "offset must be a non-negative integer",
      });
    }

    const urls = await listUserUrls(
      req.user!.userId,
      limit,
      offset,
    );

    return res.status(200).json({
      urls: urls.map((url) => ({
        id: url.id,
        shortCode: url.short_code,
        originalUrl: url.original_url,
        createdAt: url.created_at,
        expiresAt: url.expires_at,
        clickCount: url.click_count,
        customAlias: url.custom_alias,
      })),
      pagination: {
        limit,
        offset,
        count: urls.length,
      },
    });
  } catch (error: unknown) {
    console.error("Failed to list user URLs:", error);

    return res.status(500).json({
      error: "Failed to list URLs",
    });
  }
});

router.post("/", requireAuth, rateLimitUrlCreation, async (req, res) => {
  try {
    const { originalUrl, expiresAt, customAlias } = req.body;

    if (typeof originalUrl !== "string") {
      return res.status(400).json({
        error: "originalUrl must be a string",
      });
    }

    if (customAlias !== undefined && customAlias !== null && typeof customAlias !== "string") {
      return res.status(400).json({
        error: "customAlias must be a string",
      });
    }

    let parsedExpiresAt: Date | null = null;

    if (expiresAt !== undefined && expiresAt !== null) {
      if (typeof expiresAt !== "string") {
        return res.status(400).json({
          error: "expiresAt must be an ISO date string",
        });
      }

      parsedExpiresAt = new Date(expiresAt);

      if (Number.isNaN(parsedExpiresAt.getTime())) {
        return res.status(400).json({
          error: "expiresAt must be a valid ISO date",
        });
      }
    }

    const url = await createShortUrl({
      originalUrl,
      expiresAt: parsedExpiresAt,
      customAlias,
      userId: req.user!.userId,
    });

    return res.status(201).json({
      id: url.id,
      shortCode: url.short_code,
      originalUrl: url.original_url,
      createdAt: url.created_at,
      expiresAt: url.expires_at,
      clickCount: url.click_count,
      customAlias: url.custom_alias,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (
        error.message === "Original URL is required" ||
        error.message === "Original URL must be a valid URL" ||
        error.message ===
          "Custom alias can only contain letters, numbers, hyphens, and underscores" ||
        error.message === "Custom alias must be between 3 and 50 characters" ||
        error.message === "Custom alias is already in use"
      )
    ) {
      return res.status(400).json({
        error: error.message,
      });
    }

    console.error("Failed to create short URL:", error);

    return res.status(500).json({
      error: "Failed to create short URL",
    });
  }
});

export default router;
