import type { Document, Types } from "mongoose";

export interface IRefreshToken {
  userId: Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface IRefreshTokenDocument extends IRefreshToken, Document {}
