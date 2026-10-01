import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({
      status: "ok",
      service: "url-shortener",
    });
  }),
);

export default router;
