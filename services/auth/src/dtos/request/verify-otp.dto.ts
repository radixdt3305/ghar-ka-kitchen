import { OtpPurpose } from "../../constants/enums.js";

export interface VerifyOtpRequestDto {
  phone?: string;
  email?: string;
  otp: string;
  purpose?: OtpPurpose;
}
