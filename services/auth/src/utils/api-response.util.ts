import { Response } from "express";
import { IApiResponse } from "../interfaces/common.interface.js";

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T
): void {
  const response: IApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string
): void {
  const response: IApiResponse<null> = { success: false, message, data: null };
  res.status(statusCode).json(response);
}
