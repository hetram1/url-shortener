import { Router } from "express";
import { getAnalytics } from "../services/analyticsService.js";

const router = Router();

router.get("/:shortCode/analytics", async (req, res) => {
  try {
    const { shortCode } = req.params;

    const analytics = await getAnalytics(shortCode);

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
