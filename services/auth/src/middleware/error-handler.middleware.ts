import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/api-error.util.js";
import mongoose from "mongoose";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: "Validation failed",
      data: null,
      errors: messages,
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

  // Unexpected errors
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    data: null,
  });
}
