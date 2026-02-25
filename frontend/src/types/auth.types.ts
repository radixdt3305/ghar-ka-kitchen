export type UserRole = "buyer" | "cook" | "admin" | "delivery";
export type OtpPurpose = "registration" | "password_reset" | "login";

export interface Address {
  label: string;
  street: string;
  city: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  addresses: Address[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface OtpData {
  message: string;
  otp?: string;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyLoginOtpRequest {
  phone: string;
  otp: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role?: UserRole;
}

export interface VerifyOtpRequest {
  phone?: string;
  email?: string;
  otp: string;
  purpose?: OtpPurpose;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResendOtpRequest {
  phone?: string;
  email?: string;
  purpose?: OtpPurpose;
}
