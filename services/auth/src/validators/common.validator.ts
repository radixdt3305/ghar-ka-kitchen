import {
  EMAIL_REGEX,
  PHONE_REGEX,
  PINCODE_REGEX,
} from "../constants/app.constants.js";

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone);
}

export function isValidPincode(pincode: string): boolean {
  return PINCODE_REGEX.test(pincode);
}
