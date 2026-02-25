import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./token.util.js";
import "./types.js"; // ensure Express augmentation is applied

/**
 * JWT authentication middleware.
 *
 * Extracts the Bearer token from the Authorization header,
 * verifies it, and populates req.userId, req.userEmail, req.userRole.
 *
 * Usage:
 *   import { createAuthMiddleware } from "@gharkakitchen/shared-auth";
 *   const authenticate = createAuthMiddleware(process.env.JWT_ACCESS_SECRET!);
 *   router.get("/protected", authenticate, handler);
 */
export function createAuthMiddleware(jwtAccessSecret: string) {
  return function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
  ): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const err = new Error("Authentication required") as Error & {
        statusCode: number;
      };
      err.statusCode = 401;
      return next(err);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      const err = new Error("Authentication required") as Error & {
        statusCode: number;
      };
      err.statusCode = 401;
      return next(err);
    }

    try {
      const payload = verifyAccessToken(token, jwtAccessSecret);
      req.userId = payload.userId;
      req.userEmail = payload.email;
      req.userRole = payload.role;
      next();
    } catch (err) {
      next(err);
    }
  };
}
