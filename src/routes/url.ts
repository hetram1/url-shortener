import { Router } from "express";
import { createShortUrl } from "../services/urlService.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { originalUrl, expiresAt } = req.body;

    if (typeof originalUrl !== "string") {
      return res.status(400).json({
        error: "originalUrl must be a string",
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
    });

    return res.status(201).json({
      id: url.id,
      shortCode: url.short_code,
      originalUrl: url.original_url,
      createdAt: url.created_at,
      expiresAt: url.expires_at,
      clickCount: url.click_count,
    });
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (
        error.message === "Original URL is required" ||
        error.message === "Original URL must be a valid URL"
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
