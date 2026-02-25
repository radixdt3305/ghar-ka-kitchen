import { OtpPurpose } from "../../constants/enums.js";

export interface ResendOtpRequestDto {
  phone?: string;
  email?: string;
  purpose?: OtpPurpose;
}
