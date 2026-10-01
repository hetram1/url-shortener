import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error("Unhandled application error:", error);

  if (res.headersSent) {
    next(error);
    return;
  }

  res.status(500).json({
    error: "Internal server error",
  });
}
