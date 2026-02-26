/**
 * @gharkakitchen/shared-auth
 *
 * Shared JWT authentication and role-based authorization middleware
 * for Ghar Ka Kitchen microservices.
 *
 * Usage in any service:
 *
 *   // 1. Install (from the service's package.json):
 *   //    "dependencies": { "@gharkakitchen/shared-auth": "file:../../packages/shared-auth" }
 *
 *   // 2. Create middleware bound to your JWT secret:
 *   import { createAuthMiddleware, authorize, UserRole } from "@gharkakitchen/shared-auth";
 *   const authenticate = createAuthMiddleware(process.env.JWT_ACCESS_SECRET!);
 *
 *   // 3. Protect routes:
 *   router.get("/orders", authenticate, handler);
 *   router.delete("/users/:id", authenticate, authorize(UserRole.ADMIN), handler);
 */

export { createAuthMiddleware } from "./auth.middleware.js";
export { authorize } from "./role.middleware.js";
export { verifyAccessToken } from "./token.util.js";
export { UserRole } from "./types.js";
export type { AccessTokenPayload } from "./types.js";
