import type { Request, Response, NextFunction } from "express";
import { UserRole } from "./types.js";

/**
 * Role-based authorization middleware.
 *
 * Must be used AFTER createAuthMiddleware — requires req.userRole to be set.
 *
 * Usage:
 *   import { authorize, UserRole } from "@gharkakitchen/shared-auth";
 *
 *   // Allow only admins:
 *   router.delete("/users/:id", authenticate, authorize(UserRole.ADMIN), handler);
 *
 *   // Allow buyers and cooks:
 *   router.get("/menu", authenticate, authorize(UserRole.BUYER, UserRole.COOK), handler);
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      const err = new Error("Authentication required") as Error & {
        statusCode: number;
      };
      err.statusCode = 401;
      return next(err);
    }

    if (!allowedRoles.includes(req.userRole as UserRole)) {
      const err = new Error(
        `Access denied. Required role: ${allowedRoles.join(" or ")}`
      ) as Error & { statusCode: number };
      err.statusCode = 403;
      return next(err);
    }

    next();
  };
}
