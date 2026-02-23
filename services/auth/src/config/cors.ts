import type { CorsOptions } from "cors";
import { env } from "./env.js";

export const corsOptions: CorsOptions = {
  origin: env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
