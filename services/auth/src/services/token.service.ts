import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { refreshTokenRepository } from "../repository/refresh-token.repository.js";
import { IUserDocument } from "../interfaces/user.interface.js";
import { ITokenPair } from "../interfaces/common.interface.js";
import { AppError } from "../utils/api-error.util.js";

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class TokenService {
  generateAccessToken(user: IUserDocument): string {
    return user.generateAccessToken();
  }

  generateRefreshToken(user: IUserDocument): string {
    return user.generateRefreshToken();
  }

  async generateTokenPair(user: IUserDocument): Promise<ITokenPair> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + env.JWT_REFRESH_EXPIRY
    );
    await refreshTokenRepository.create(
      String(user._id),
      refreshToken,
      expiresAt
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    } catch {
      throw new AppError("Invalid or expired access token", 401);
    }
  }

  verifyRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    } catch {
      throw new AppError("Invalid or expired refresh token", 401);
    }
  }

  async refreshTokens(oldRefreshToken: string): Promise<ITokenPair> {
    // Verify the token signature
    const payload = this.verifyRefreshToken(oldRefreshToken);

    // Check it exists in DB (not revoked)
    const stored = await refreshTokenRepository.findByToken(oldRefreshToken);
    if (!stored) {
      throw new AppError("Refresh token not found or revoked", 401);
    }

    // Delete old refresh token (rotation)
    await refreshTokenRepository.deleteByToken(oldRefreshToken);

    // Generate new token pair
    const accessToken = jwt.sign(
      { userId: payload.userId },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY }
    );
    const refreshToken = jwt.sign(
      { userId: payload.userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRY }
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + env.JWT_REFRESH_EXPIRY
    );
    await refreshTokenRepository.create(
      payload.userId,
      refreshToken,
      expiresAt
    );

    return { accessToken, refreshToken };
  }
}

export const tokenService = new TokenService();
