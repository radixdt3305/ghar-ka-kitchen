import { isValidEmail, isValidPhone } from "./common.validator.js";
import { validatePassword } from "./password.validator.js";
import { UserRole, OtpPurpose } from "../constants/enums.js";

export function validateRegisterRequest(body: unknown): string[] {
  const errors: string[] = [];
  const dto = body as Record<string, unknown>;

  if (
    !dto["name"] ||
    typeof dto["name"] !== "string" ||
    dto["name"].trim().length < 2
  ) {
    errors.push("Name is required and must be at least 2 characters");
  }

  if (
    !dto["email"] ||
    typeof dto["email"] !== "string" ||
    !isValidEmail(dto["email"])
  ) {
    errors.push("Valid email is required");
  }

  if (
    !dto["phone"] ||
    typeof dto["phone"] !== "string" ||
    !isValidPhone(dto["phone"])
  ) {
    errors.push("Valid 10-digit Indian phone number is required");
  }

  // Password is optional for phone+OTP registration
  if (dto["password"] !== undefined && dto["password"] !== null) {
    if (typeof dto["password"] !== "string") {
      errors.push("Password must be a string");
    } else {
      const pwResult = validatePassword(dto["password"]);
      errors.push(...pwResult.errors);
    }
  }

  if (dto["role"] !== undefined) {
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(dto["role"] as UserRole)) {
      errors.push(`Role must be one of: ${validRoles.join(", ")}`);
    }
  }

  if (dto["addresses"] !== undefined) {
    if (!Array.isArray(dto["addresses"])) {
      errors.push("Addresses must be an array");
    } else {
      (dto["addresses"] as unknown[]).forEach((addr, i) => {
        const a = addr as Record<string, unknown>;
        const prefix = `addresses[${i}]`;
        if (!a["label"] || typeof a["label"] !== "string") {
          errors.push(`${prefix}.label is required`);
        }
        if (!a["street"] || typeof a["street"] !== "string") {
          errors.push(`${prefix}.street is required`);
        }
        if (!a["city"] || typeof a["city"] !== "string") {
          errors.push(`${prefix}.city is required`);
        }
        if (!a["pincode"] || typeof a["pincode"] !== "string" || !/^\d{6}$/.test(a["pincode"] as string)) {
          errors.push(`${prefix}.pincode must be a 6-digit number`);
        }
        if (typeof a["lat"] !== "number") {
          errors.push(`${prefix}.lat must be a number`);
        }
        if (typeof a["lng"] !== "number") {
          errors.push(`${prefix}.lng must be a number`);
        }
      });
    }
  }

  return errors;
}

export function validateLoginRequest(body: unknown): string[] {
  const errors: string[] = [];
  const dto = body as Record<string, unknown>;

  if (!dto["email"] || typeof dto["email"] !== "string") {
    errors.push("Email is required");
  }
  if (!dto["password"] || typeof dto["password"] !== "string") {
    errors.push("Password is required");
  }

  return errors;
}

export function validateSendOtpRequest(body: unknown): string[] {
  const errors: string[] = [];
  const dto = body as Record<string, unknown>;

  if (
    !dto["phone"] ||
    typeof dto["phone"] !== "string" ||
    !isValidPhone(dto["phone"])
  ) {
    errors.push("Valid 10-digit Indian phone number is required");
  }

  return errors;
}

export function validateVerifyOtpRequest(body: unknown): string[] {
  const errors: string[] = [];
  const dto = body as Record<string, unknown>;

  const hasPhone =
    dto["phone"] && typeof dto["phone"] === "string" && isValidPhone(dto["phone"]);
  const hasEmail =
    dto["email"] && typeof dto["email"] === "string" && isValidEmail(dto["email"]);

  if (!hasPhone && !hasEmail) {
    errors.push("Valid phone number or email is required");
  }

  if (
    !dto["otp"] ||
    typeof dto["otp"] !== "string" ||
    dto["otp"].length !== 6
  ) {
    errors.push("Valid 6-digit OTP is required");
  }

  return errors;
}

export function validateVerifyLoginOtpRequest(body: unknown): string[] {
  const errors: string[] = [];
  const dto = body as Record<string, unknown>;

  if (
    !dto["phone"] ||
    typeof dto["phone"] !== "string" ||
    !isValidPhone(dto["phone"])
  ) {
    errors.push("Valid 10-digit Indian phone number is required");
  }

  if (
    !dto["otp"] ||
    typeof dto["otp"] !== "string" ||
    dto["otp"].length !== 6
  ) {
    errors.push("Valid 6-digit OTP is required");
  }

  return errors;
}

export function validateRefreshTokenRequest(body: unknown): string[] {
  const errors: string[] = [];
  const dto = body as Record<string, unknown>;

  if (!dto["refreshToken"] || typeof dto["refreshToken"] !== "string") {
    errors.push("Refresh token is required");
  }

  return errors;
}

export function validateResendOtpRequest(body: unknown): string[] {
  const errors: string[] = [];
  const dto = body as Record<string, unknown>;

  const hasPhone =
    dto["phone"] && typeof dto["phone"] === "string" && isValidPhone(dto["phone"]);
  const hasEmail =
    dto["email"] && typeof dto["email"] === "string" && isValidEmail(dto["email"]);

  if (!hasPhone && !hasEmail) {
    errors.push("Valid phone number or email is required");
  }

  if (dto["purpose"] !== undefined) {
    const validPurposes = Object.values(OtpPurpose);
    if (!validPurposes.includes(dto["purpose"] as OtpPurpose)) {
      errors.push(`Purpose must be one of: ${validPurposes.join(", ")}`);
    }
  }

  return errors;
}
