import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_PUBLISHABLE_KEY: string;
  PLATFORM_COMMISSION_RATE: number;
  MIN_COMMISSION: number;
  PAYOUT_SCHEDULE: string;
  PAYOUT_DAY: string;
  MIN_PAYOUT_AMOUNT: number;
  ORDER_SERVICE_URL: string;
  KITCHEN_SERVICE_URL: string;
  AUTH_SERVICE_URL: string;
  CORS_ORIGIN: string;
  NODE_ENV: string;
}

function getEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env: EnvConfig = {
  PORT: parseInt(getEnv("PORT"), 10),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  STRIPE_SECRET_KEY: getEnv("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: getEnv("STRIPE_WEBHOOK_SECRET"),
  STRIPE_PUBLISHABLE_KEY: getEnv("STRIPE_PUBLISHABLE_KEY"),
  PLATFORM_COMMISSION_RATE: parseFloat(process.env.PLATFORM_COMMISSION_RATE || "0.15"),
  MIN_COMMISSION: parseInt(process.env.MIN_COMMISSION || "10", 10),
  PAYOUT_SCHEDULE: process.env.PAYOUT_SCHEDULE || "weekly",
  PAYOUT_DAY: process.env.PAYOUT_DAY || "friday",
  MIN_PAYOUT_AMOUNT: parseInt(process.env.MIN_PAYOUT_AMOUNT || "500", 10),
  ORDER_SERVICE_URL: getEnv("ORDER_SERVICE_URL"),
  KITCHEN_SERVICE_URL: getEnv("KITCHEN_SERVICE_URL"),
  AUTH_SERVICE_URL: getEnv("AUTH_SERVICE_URL"),
  CORS_ORIGIN: getEnv("CORS_ORIGIN"),
  NODE_ENV: process.env.NODE_ENV || "development",
};
