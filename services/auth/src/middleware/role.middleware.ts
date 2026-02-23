import { Request, Response, NextFunction } from "express";
import { UserRole } from "../constants/enums.js";
import { AppError } from "../utils/api-error.util.js";

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      throw new AppError("Authentication required", 401);
    }
    if (!allowedRoles.includes(req.userRole as UserRole)) {
      throw new AppError("Insufficient permissions", 403);
    }
    next();
  };
}
