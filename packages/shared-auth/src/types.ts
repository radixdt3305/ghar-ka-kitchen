/**
 * Shared auth types for Ghar Ka Kitchen microservices.
 * Import this in any service that needs JWT validation or role-based access.
 */

export enum UserRole {
  BUYER = "buyer",
  COOK = "cook",
  ADMIN = "admin",
  DELIVERY = "delivery",
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

// Augment Express Request to include decoded token fields
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      userRole?: string;
    }
  }
}
