import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRY: number;
  JWT_REFRESH_EXPIRY: number;
  OTP_EXPIRY_MINUTES: number;
  CORS_ORIGIN: string;
  NODE_ENV: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_FROM_NUMBER: string;
}

function getEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, fallback: string = ""): string {
  return process.env[key] || fallback;
}

export const env: EnvConfig = {
  PORT: parseInt(getEnv("PORT"), 10),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
  JWT_ACCESS_EXPIRY: parseInt(getEnv("JWT_ACCESS_EXPIRY"), 10),
  JWT_REFRESH_EXPIRY: parseInt(getEnv("JWT_REFRESH_EXPIRY"), 10),
  OTP_EXPIRY_MINUTES: parseInt(getEnv("OTP_EXPIRY_MINUTES"), 10),
  CORS_ORIGIN: getEnv("CORS_ORIGIN"),
  NODE_ENV: process.env["NODE_ENV"] || "development",
  TWILIO_ACCOUNT_SID: getOptionalEnv("TWILIO_ACCOUNT_SID"),
  TWILIO_AUTH_TOKEN: getOptionalEnv("TWILIO_AUTH_TOKEN"),
  TWILIO_FROM_NUMBER: getOptionalEnv("TWILIO_FROM_NUMBER"),
};
