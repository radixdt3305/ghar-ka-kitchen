import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5002,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/gharkakitchen",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "",
};
