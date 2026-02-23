import { OtpPurpose } from "../../constants/enums.js";

export interface VerifyOtpRequestDto {
  email: string;
  otp: string;
  purpose?: OtpPurpose;
}
