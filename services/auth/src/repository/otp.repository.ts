import Otp from "../model/otp.js";
import { IOtpDocument } from "../interfaces/otp.interface.js";
import { OtpPurpose } from "../constants/enums.js";

export class OtpRepository {
  async create(
    email: string,
    hashedOtp: string,
    purpose: OtpPurpose,
    expiresAt: Date
  ): Promise<IOtpDocument> {
    // Delete any existing OTP for this email+purpose before creating new
    await Otp.deleteMany({ email: email.toLowerCase(), purpose });
    const otp = new Otp({
      email: email.toLowerCase(),
      otp: hashedOtp,
      purpose,
      expiresAt,
    });
    return otp.save();
  }

  async findLatest(
    email: string,
    purpose: OtpPurpose
  ): Promise<IOtpDocument | null> {
    return Otp.findOne({
      email: email.toLowerCase(),
      purpose,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  }

  async incrementAttempts(id: string): Promise<void> {
    await Otp.findByIdAndUpdate(id, { $inc: { attempts: 1 } });
  }

  async deleteByEmailAndPurpose(
    email: string,
    purpose: OtpPurpose
  ): Promise<void> {
    await Otp.deleteMany({ email: email.toLowerCase(), purpose });
  }
}

export const otpRepository = new OtpRepository();
