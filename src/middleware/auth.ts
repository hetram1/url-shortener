import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/tokenService.js";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.get("authorization");

  if (!authorization) {
    res.status(401).json({
      error: "Authentication required",
    });

    return;
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      error: "Invalid authorization header",
    });

    return;
  }

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    res.status(401).json({
      error: "Invalid or expired token",
    });
  }
}
