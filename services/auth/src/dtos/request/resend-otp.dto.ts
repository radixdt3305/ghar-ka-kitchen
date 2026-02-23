import { OtpPurpose } from "../../constants/enums.js";

export interface ResendOtpRequestDto {
  email: string;
  purpose?: OtpPurpose;
}
