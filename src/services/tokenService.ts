import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AuthenticatedUser } from "../types/auth.js";

const TOKEN_EXPIRATION = "1h";

export function createAccessToken(
  payload: AuthenticatedUser,
): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: TOKEN_EXPIRATION,
  });
}

export function verifyAccessToken(
  token: string,
): AuthenticatedUser {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.userId !== "string" ||
    typeof decoded.email !== "string"
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    userId: decoded.userId,
    email: decoded.email,
  };
}
