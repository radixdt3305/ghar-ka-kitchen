import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import { RegisterRequestDto } from "../dtos/request/register.dto.js";
import { LoginRequestDto } from "../dtos/request/login.dto.js";
import { VerifyOtpRequestDto } from "../dtos/request/verify-otp.dto.js";
import { RefreshTokenRequestDto } from "../dtos/request/refresh-token.dto.js";
import { ResendOtpRequestDto } from "../dtos/request/resend-otp.dto.js";
import { SendOtpRequestDto } from "../dtos/request/send-otp.dto.js";
import { ChangePasswordRequestDto } from "../dtos/request/change-password.dto.js";
import { sendSuccess } from "../utils/api-response.util.js";

export const register = async (
  req: Request,
  res: Response
): Promise<void> => {
  const dto = req.body as RegisterRequestDto;
  const result = await authService.register(dto);
  sendSuccess(res, 201, "Registration successful", result);
};

export const login = async (
  req: Request,
  res: Response
): Promise<void> => {
  const dto = req.body as LoginRequestDto;
  const result = await authService.login(dto);
  sendSuccess(res, 200, "Login successful", result);
};

export const sendLoginOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  const dto = req.body as SendOtpRequestDto;
  const result = await authService.sendLoginOtp(dto.phone);
  sendSuccess(res, 200, "OTP sent successfully", result);
};

export const verifyLoginOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { phone, otp } = req.body as { phone: string; otp: string };
  const result = await authService.verifyLoginOtp(phone, otp);
  sendSuccess(res, 200, "Login successful", result);
};

export const verifyOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  const dto = req.body as VerifyOtpRequestDto;
  const result = await authService.verifyOtp(dto);
  sendSuccess(res, 200, "OTP verified successfully", result);
};

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const dto = req.body as RefreshTokenRequestDto;
  const result = await authService.refreshToken(dto.refreshToken);
  sendSuccess(res, 200, "Token refreshed successfully", result);
};

export const resendOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  const dto = req.body as ResendOtpRequestDto;
  const result = await authService.resendOtp(dto);
  sendSuccess(res, 200, "OTP resent successfully", result);
};

export const changePassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.userId!;
  const dto = req.body as ChangePasswordRequestDto;
  const result = await authService.changePassword(userId, dto);
  sendSuccess(res, 200, "Password changed successfully", result);
};
