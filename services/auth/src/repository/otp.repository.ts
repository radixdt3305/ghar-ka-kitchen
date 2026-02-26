import Otp from "../model/otp.js";
import { IOtpDocument } from "../interfaces/otp.interface.js";
import { OtpPurpose } from "../constants/enums.js";

export class OtpRepository {
  async create(
    identifier: string,
    hashedOtp: string,
    purpose: OtpPurpose,
    expiresAt: Date
  ): Promise<IOtpDocument> {
    // Delete any existing OTP for this identifier+purpose before creating new
    await Otp.deleteMany({ identifier: identifier.toLowerCase(), purpose });
    const otp = new Otp({
      identifier: identifier.toLowerCase(),
      otp: hashedOtp,
      purpose,
      expiresAt,
    });
    return otp.save();
  }

  async findLatest(
    identifier: string,
    purpose: OtpPurpose
  ): Promise<IOtpDocument | null> {
    return Otp.findOne({
      identifier: identifier.toLowerCase(),
      purpose,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  }

  async incrementAttempts(id: string): Promise<void> {
    await Otp.findByIdAndUpdate(id, { $inc: { attempts: 1 } });
  }

  async deleteByIdentifierAndPurpose(
    identifier: string,
    purpose: OtpPurpose
  ): Promise<void> {
    await Otp.deleteMany({ identifier: identifier.toLowerCase(), purpose });
  }
}

export const otpRepository = new OtpRepository();
