import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
  JWT_ACCESS_SECRET: string;
  CORS_ORIGIN: string;
  NODE_ENV: string;
  UPLOAD_DIR: string;
}

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env: ${key}`);
  return value;
}

export const env: EnvConfig = {
  PORT: parseInt(getEnv("PORT"), 10),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  CORS_ORIGIN: getEnv("CORS_ORIGIN"),
  NODE_ENV: process.env["NODE_ENV"] || "development",
  UPLOAD_DIR: process.env["UPLOAD_DIR"] || "./uploads",
};
