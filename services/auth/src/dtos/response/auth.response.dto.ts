import { UserRole } from "../../constants/enums.js";
import { IAddress } from "../../interfaces/user.interface.js";

export interface UserResponseDto {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  addresses: IAddress[];
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPairResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface OtpResponseDto {
  message: string;
  otp?: string;
}
