import mongoose from "mongoose";
const { Schema } = mongoose;
import { IRefreshTokenDocument } from "../interfaces/refresh-token.interface.js";

const RefreshTokenSchema = new Schema<IRefreshTokenDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes
RefreshTokenSchema.index({ userId: 1 });
RefreshTokenSchema.index({ token: 1 }, { unique: true });

const RefreshToken = mongoose.model<IRefreshTokenDocument>(
  "RefreshToken",
  RefreshTokenSchema
);
export default RefreshToken;
