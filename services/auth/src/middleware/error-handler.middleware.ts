import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/api-error.util.js";
import { env } from "../config/env.js";
import mongoose from "mongoose";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Always log the full error in the console for debugging
  console.error("[ERROR]", err.message);
  if (env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
      data: null,
    });
    return;
  }

  // Mongoose duplicate key error (code 11000)
  if ((err as any).code === 11000) {
    const field =
      Object.keys((err as any).keyValue || {})[0] || "field";
    res.status(409).json({
      success: false,
      message: `Duplicate value for ${field}`,
      data: null,
    });
    return;
  }

  // Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
    return;
  }

  // Unexpected errors — show real message in dev, hide in production
  const statusCode = (err as any).statusCode || 500;
  const message =
    env.NODE_ENV !== "production"
      ? err.message || "Internal server error"
      : "Internal server error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV !== "production" && { stack: err.stack }),
    data: null,
  });
}
