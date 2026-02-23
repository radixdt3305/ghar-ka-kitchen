import { otpRepository } from "../repository/otp.repository.js";
import { generateOtp } from "../utils/otp.util.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { OtpPurpose } from "../constants/enums.js";
import { MAX_OTP_ATTEMPTS } from "../constants/app.constants.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/api-error.util.js";

export class OtpService {
  async generateAndStore(
    email: string,
    purpose: OtpPurpose
  ): Promise<string> {
    const otp = generateOtp();
    const hashedOtp = await hashPassword(otp);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env.OTP_EXPIRY_MINUTES);

    await otpRepository.create(email, hashedOtp, purpose, expiresAt);

    // In production, send OTP via SMS/email here
    // For now, return the plain OTP (for dev/testing)
    return otp;
  }

  async verify(
    email: string,
    plainOtp: string,
    purpose: OtpPurpose
  ): Promise<boolean> {
    const otpRecord = await otpRepository.findLatest(email, purpose);

    if (!otpRecord) {
      throw new AppError("OTP not found or expired", 400);
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await otpRepository.deleteByEmailAndPurpose(email, purpose);
      throw new AppError(
        "Maximum OTP attempts exceeded. Please request a new OTP",
        400
      );
    }

    const isMatch = await comparePassword(plainOtp, otpRecord.otp);

    if (!isMatch) {
      await otpRepository.incrementAttempts(String(otpRecord._id));
      throw new AppError("Invalid OTP", 400);
    }

    // OTP verified -- clean up
    await otpRepository.deleteByEmailAndPurpose(email, purpose);
    return true;
  }
}

export const otpService = new OtpService();
