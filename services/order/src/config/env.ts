import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || "5003",
  MONGO_URI: process.env.MONGO_URI!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  KITCHEN_SERVICE_URL: process.env.KITCHEN_SERVICE_URL!,
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL!,
};
