import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getAnalytics } from "../services/analyticsService.js";

const router = Router();

router.get("/:shortCode/analytics", requireAuth, async (req, res) => {
  try {
    const shortCode = String(req.params.shortCode);

    const analytics = await getAnalytics(shortCode, req.user!.userId);

    if (!analytics) {
      return res.status(404).json({
        error: "Short URL not found",
      });
    }

    return res.status(200).json(analytics);
  } catch (error: unknown) {
    console.error("Failed to fetch URL analytics:", error);

    return res.status(500).json({
      error: "Failed to fetch URL analytics",
    });
  }
});

export default router;
