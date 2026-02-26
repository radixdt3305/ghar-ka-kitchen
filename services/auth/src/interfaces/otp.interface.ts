import type { Document } from "mongoose";
import { OtpPurpose } from "../constants/enums.js";

export interface IOtp {
  identifier: string;
  otp: string;
  purpose: OtpPurpose;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}

export interface IOtpDocument extends IOtp, Document {}
