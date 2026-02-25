import jwt from "jsonwebtoken";
import type { AccessTokenPayload } from "./types.js";

/**
 * Verify a JWT access token and return its payload.
 * Throws an error with status 401 if invalid or expired.
 */
export function verifyAccessToken(
  token: string,
  secret: string
): AccessTokenPayload {
  try {
    return jwt.verify(token, secret) as AccessTokenPayload;
  } catch {
    const err = new Error("Invalid or expired access token") as Error & {
      statusCode: number;
    };
    err.statusCode = 401;
    throw err;
  }
}
