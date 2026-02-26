import api from "./axios";
import type {
  ApiResponse,
  AuthData,
  OtpData,
  SendOtpRequest,
  VerifyLoginOtpRequest,
  RegisterRequest,
  VerifyOtpRequest,
  LoginRequest,
  ResendOtpRequest,
} from "@/types/auth.types";

export const authApi = {
  sendOtp: (data: SendOtpRequest) =>
    api.post<ApiResponse<OtpData>>("/auth/send-otp", data),

  verifyLoginOtp: (data: VerifyLoginOtpRequest) =>
    api.post<ApiResponse<AuthData>>("/auth/verify-login-otp", data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<OtpData>>("/auth/register", data),

  verifyOtp: (data: VerifyOtpRequest) =>
    api.post<ApiResponse<AuthData>>("/auth/verify-otp", data),

  login: (data: LoginRequest) =>
    api.post<ApiResponse<AuthData>>("/auth/login", data),

  resendOtp: (data: ResendOtpRequest) =>
    api.post<ApiResponse<OtpData>>("/auth/resend-otp", data),
};
