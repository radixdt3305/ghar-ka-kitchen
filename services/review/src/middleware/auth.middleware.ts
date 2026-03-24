import { createAuthMiddleware, authorize, UserRole } from "@gharkakitchen/shared-auth";
import { env } from "../config/env.js";

export const authMiddleware = createAuthMiddleware(env.JWT_ACCESS_SECRET);

export const buyerOnly = authorize(UserRole.BUYER);

export const cookOnly = authorize(UserRole.COOK);
