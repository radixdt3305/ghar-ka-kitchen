import dotenv from "dotenv";
dotenv.config();

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing env var: ${key}`);
  return value;
}

export const env = {
  PORT: parseInt(process.env.PORT || "5005", 10),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
  CLOUDINARY_CLOUD_NAME: getEnv("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY: getEnv("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET: getEnv("CLOUDINARY_API_SECRET"),
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL || "http://localhost:5003",
  KITCHEN_SERVICE_URL: process.env.KITCHEN_SERVICE_URL || "http://localhost:5001",
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5006",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
};
