import RefreshToken from "../model/refresh-token.js";
import { IRefreshTokenDocument } from "../interfaces/refresh-token.interface.js";

export class RefreshTokenRepository {
  async create(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<IRefreshTokenDocument> {
    const rt = new RefreshToken({ userId, token, expiresAt });
    return rt.save();
  }

  async findByToken(token: string): Promise<IRefreshTokenDocument | null> {
    return RefreshToken.findOne({ token, expiresAt: { $gt: new Date() } });
  }

  async deleteByToken(token: string): Promise<void> {
    await RefreshToken.deleteOne({ token });
  }

  async deleteAllForUser(userId: string): Promise<void> {
    await RefreshToken.deleteMany({ userId });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
