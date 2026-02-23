import { Request, Response, NextFunction } from "express";
import { tokenService } from "../services/token.service.js";
import { AppError } from "../utils/api-error.util.js";

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: string;
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new AppError("Authentication required", 401);
  }

  const payload = tokenService.verifyAccessToken(token);
  req.userId = payload.userId;
  req.userEmail = payload.email;
  req.userRole = payload.role;
  next();
}
