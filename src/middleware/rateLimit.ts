import { Request, Response, NextFunction } from "express";
import { checkRateLimit } from "../services/rateLimiter.js";

const RATE_LIMIT_PREFIX = "rate-limit:url-create";

export async function rateLimitUrlCreation(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const clientIp = req.ip ?? "unknown";
  const key = `${RATE_LIMIT_PREFIX}:${clientIp}`;

  const result = await checkRateLimit(key);

  res.setHeader("X-RateLimit-Limit", "10");
  res.setHeader("X-RateLimit-Remaining", result.remaining.toString());

  if (!result.allowed) {
    res.setHeader("Retry-After", result.retryAfter.toString());

    res.status(429).json({
      error: "Too many URL creation requests",
      retryAfter: result.retryAfter,
    });

    return;
  }

  next();
}
