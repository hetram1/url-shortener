import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const TOKEN_EXPIRATION = "1h";

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export function createAccessToken(
  payload: AccessTokenPayload,
): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: TOKEN_EXPIRATION,
  });
}
