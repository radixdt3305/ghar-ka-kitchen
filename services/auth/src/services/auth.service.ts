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
  /**
   * Register a new user and send OTP to their phone number.
   * Password is optional — phone+OTP is the primary auth method.
   */
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

    // Generate OTP and send to phone via SMS
    const otp = await otpService.generateAndStore(
      dto.phone,
      OtpPurpose.REGISTRATION
    );

    const response: OtpResponseDto = {
      message:
        "Registration successful. Please verify your account with the OTP sent to your phone.",
    };

    if (env.NODE_ENV !== "production") {
      response.otp = otp;
    }

    return response;
  }

  /**
   * Login with email and password (secondary flow — for admin users).
   */
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

    // Ensure user has a password set (phone-only users cannot use this flow)
    if (!user.password) {
      throw new AppError(
        "Password login not available. Please use phone+OTP login",
        400
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

  /**
   * Send login OTP to a registered phone number (primary login flow).
   */
  async sendLoginOtp(phone: string): Promise<OtpResponseDto> {
    const user = await userRepository.findByPhone(phone);
    if (!user) {
      throw new AppError("No account found with this phone number", 404);
    }

    if (!user.isActive) {
      throw new AppError("Account is deactivated", 403);
    }

    const otp = await otpService.generateAndStore(phone, OtpPurpose.LOGIN);

    const response: OtpResponseDto = {
      message: "OTP sent to your phone number.",
    };

    if (env.NODE_ENV !== "production") {
      response.otp = otp;
    }

    return response;
  }

  /**
   * Verify login OTP and return tokens (primary login flow).
   */
  async verifyLoginOtp(
    phone: string,
    otp: string
  ): Promise<AuthResponseDto> {
    await otpService.verify(phone, otp, OtpPurpose.LOGIN);

    const user = await userRepository.findByPhone(phone);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("Account is deactivated", 403);
    }

    // Mark user as verified if not already
    if (!user.isVerified) {
      await userRepository.updateVerificationStatus(String(user._id), true);
      user.isVerified = true;
    }

    const tokens = await tokenService.generateTokenPair(user);

    return {
      user: this.toUserResponseDto(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  /**
   * Verify registration OTP — supports lookup by phone or email.
   */
  async verifyOtp(dto: VerifyOtpRequestDto): Promise<AuthResponseDto> {
    const purpose = dto.purpose ?? OtpPurpose.REGISTRATION;
    const identifier = dto.phone || dto.email;

    if (!identifier) {
      throw new AppError("Phone number or email is required", 400);
    }

    await otpService.verify(identifier, dto.otp, purpose);

    // Find user by phone (preferred) or email
    const user = dto.phone
      ? await userRepository.findByPhone(dto.phone)
      : await userRepository.findByEmail(dto.email!);

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

  /**
   * Resend OTP — supports phone or email identifier.
   */
  async resendOtp(dto: ResendOtpRequestDto): Promise<OtpResponseDto> {
    const purpose = dto.purpose ?? OtpPurpose.REGISTRATION;
    const identifier = dto.phone || dto.email;

    if (!identifier) {
      throw new AppError("Phone number or email is required", 400);
    }

    // Find user by phone (preferred) or email
    const user = dto.phone
      ? await userRepository.findByPhone(dto.phone)
      : await userRepository.findByEmail(dto.email!);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (purpose === OtpPurpose.REGISTRATION && user.isVerified) {
      throw new AppError("Account is already verified", 400);
    }

    const otp = await otpService.generateAndStore(identifier, purpose);

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
