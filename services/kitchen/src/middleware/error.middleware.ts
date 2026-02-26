import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/error.util.js";
import { env } from "../config/env.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error("[ERROR]", err.message);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message, data: null });
    return;
  }

  const statusCode = (err as any).statusCode || 500;
  const message = env.NODE_ENV !== "production" ? err.message : "Internal server error";
  res.status(statusCode).json({ success: false, message, data: null });
}
