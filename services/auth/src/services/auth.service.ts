import { userRepository } from "../repository/user.repository.js";
import { tokenService } from "./token.service.js";
import { otpService } from "./otp.service.js";
import { RegisterRequestDto } from "../dtos/request/register.dto.js";
import { LoginRequestDto } from "../dtos/request/login.dto.js";
import { VerifyOtpRequestDto } from "../dtos/request/verify-otp.dto.js";
import { ResendOtpRequestDto } from "../dtos/request/resend-otp.dto.js";
import {
  AuthResponseDto,
  UserResponseDto,
  OtpResponseDto,
} from "../dtos/response/auth.response.dto.js";
import { ITokenPair } from "../interfaces/common.interface.js";
import { OtpPurpose, UserRole } from "../constants/enums.js";
import { AppError } from "../utils/api-error.util.js";
import { IUserDocument } from "../interfaces/user.interface.js";
import { env } from "../config/env.js";

export class AuthService {
  async register(dto: RegisterRequestDto): Promise<OtpResponseDto> {
    // Check if email already exists
    if (await userRepository.existsByEmail(dto.email)) {
      throw new AppError("Email already registered", 409);
    }

    // Check if phone already exists
    if (await userRepository.existsByPhone(dto.phone)) {
      throw new AppError("Phone number already registered", 409);
    }

    // Create user (unverified)
    const userData = {
      ...dto,
      role: dto.role ?? UserRole.BUYER,
    };
    await userRepository.create(userData);

    // Generate OTP for verification
    const otp = await otpService.generateAndStore(
      dto.email,
      OtpPurpose.REGISTRATION
    );

    // In development, return OTP in response; in production, send via SMS/email
    const response: OtpResponseDto = {
      message:
        "Registration successful. Please verify your account with the OTP sent.",
    };

    if (env.NODE_ENV !== "production") {
      response.otp = otp;
    }

    return response;
  }

  async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    // Find user with password field included
    const user = await userRepository.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Check if account is active
    if (!user.isActive) {
      throw new AppError("Account is deactivated", 403);
    }

    // Check if verified
    if (!user.isVerified) {
      throw new AppError(
        "Account not verified. Please verify your OTP first",
        403
      );
    }

    // Compare passwords
    const isMatch = await user.comparePassword(dto.password);
    if (!isMatch) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate tokens
    const tokens = await tokenService.generateTokenPair(user);

    return {
      user: this.toUserResponseDto(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async verifyOtp(dto: VerifyOtpRequestDto): Promise<AuthResponseDto> {
    const purpose = dto.purpose ?? OtpPurpose.REGISTRATION;

    await otpService.verify(dto.email, dto.otp, purpose);

    // Mark user as verified
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isVerified) {
      await userRepository.updateVerificationStatus(
        String(user._id),
        true
      );
      user.isVerified = true;
    }

    // Generate tokens and return authenticated response
    const tokens = await tokenService.generateTokenPair(user);

    return {
      user: this.toUserResponseDto(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async resendOtp(dto: ResendOtpRequestDto): Promise<OtpResponseDto> {
    const purpose = dto.purpose ?? OtpPurpose.REGISTRATION;

    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (purpose === OtpPurpose.REGISTRATION && user.isVerified) {
      throw new AppError("Account is already verified", 400);
    }

    const otp = await otpService.generateAndStore(dto.email, purpose);

    const response: OtpResponseDto = {
      message: "OTP resent successfully.",
    };

    if (env.NODE_ENV !== "production") {
      response.otp = otp;
    }

    return response;
  }

  async refreshToken(refreshToken: string): Promise<ITokenPair> {
    return tokenService.refreshTokens(refreshToken);
  }

  private toUserResponseDto(user: IUserDocument): UserResponseDto {
    return {
      _id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      addresses: user.addresses,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}

export const authService = new AuthService();
