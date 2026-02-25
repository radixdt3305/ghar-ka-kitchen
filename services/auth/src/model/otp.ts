import mongoose from "mongoose";
const { Schema } = mongoose;
import { IOtpDocument } from "../interfaces/otp.interface.js";
import { OtpPurpose } from "../constants/enums.js";
import { MAX_OTP_ATTEMPTS } from "../constants/app.constants.js";

const OtpSchema = new Schema<IOtpDocument>({
  identifier: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: Object.values(OtpPurpose),
    default: OtpPurpose.REGISTRATION,
  },
  attempts: {
    type: Number,
    default: 0,
    max: MAX_OTP_ATTEMPTS,
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

// Compound index for efficient lookups
OtpSchema.index({ identifier: 1, purpose: 1 });

const Otp = mongoose.model<IOtpDocument>("Otp", OtpSchema);
export default Otp;
