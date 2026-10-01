import { Router } from "express";
import { resolveShortUrl } from "../services/urlService.js";

const router = Router();

router.get("/:shortCode", async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await resolveShortUrl(shortCode);

    if (!url) {
      return res.status(404).json({
        error: "Short URL not found",
      });
    }

    if (url.expires_at && url.expires_at <= new Date()) {
      return res.status(410).json({
        error: "Short URL has expired",
      });
    }

    return res.redirect(302, url.original_url);
  } catch (error: unknown) {
    console.error("Failed to resolve short URL:", error);

    return res.status(500).json({
      error: "Failed to resolve short URL",
    });
  }
});

export default router;
