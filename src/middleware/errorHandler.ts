import { Request, Response, NextFunction } from "express";

type HttpError = Error & {
  status?: number;
  statusCode?: number;
  expose?: boolean;
};

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

  const httpError = error as HttpError;

  const status =
    httpError.statusCode ??
    httpError.status ??
    500;

  if (status >= 400 && status < 500) {
    res.status(status).json({
      error: status === 400
        ? "Invalid request"
        : "Request failed",
    });
    return;
  }

  res.status(500).json({
    error: "Internal server error",
  });
}
