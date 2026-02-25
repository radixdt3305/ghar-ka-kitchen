import { otpRepository } from "../repository/otp.repository.js";
import { generateOtp } from "../utils/otp.util.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { OtpPurpose } from "../constants/enums.js";
import { MAX_OTP_ATTEMPTS, PHONE_REGEX } from "../constants/app.constants.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/api-error.util.js";
import { smsService } from "./sms.service.js";

export class OtpService {
  async generateAndStore(
    identifier: string,
    purpose: OtpPurpose
  ): Promise<string> {
    const otp = generateOtp();
    const hashedOtp = await hashPassword(otp);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + env.OTP_EXPIRY_MINUTES);

    await otpRepository.create(identifier, hashedOtp, purpose, expiresAt);

    // Send OTP via SMS if identifier is a phone number
    if (PHONE_REGEX.test(identifier)) {
      await smsService.sendOtp(identifier, otp);
    }

    return otp;
  }

  async verify(
    identifier: string,
    plainOtp: string,
    purpose: OtpPurpose
  ): Promise<boolean> {
    const otpRecord = await otpRepository.findLatest(identifier, purpose);

    if (!otpRecord) {
      throw new AppError("OTP not found or expired", 400);
    }

    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await otpRepository.deleteByIdentifierAndPurpose(identifier, purpose);
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
    await otpRepository.deleteByIdentifierAndPurpose(identifier, purpose);
    return true;
  }
}

export const otpService = new OtpService();
