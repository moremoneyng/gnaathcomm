/**
 * Shared In-Memory User & OTP Store
 * 
 * This is a fallback store used when the PostgreSQL database is temporarily unavailable.
 * Data is shared across all API route handlers within the same Node.js process via module-level state.
 * 
 * NOTE: This store is reset when the dev server restarts. It is NOT a persistent database.
 * Once the DB is healthy, all routes will prefer the DB. This store only guarantees
 * that users can register & log in within the same server session even if DB is offline.
 */

export interface MemoryUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  phone?: string;
  address?: string;
  city?: string;
  preferredBranch?: string;
  isVerified: boolean;
  createdAt: number;
}

export interface MemoryOtp {
  code: string;
  expiresAt: number;
  passwordHash: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  preferredBranch?: string;
}

// Global singletons (persisted as long as the Node.js process lives)
export const memoryUserStore = new Map<string, MemoryUser>(); // key: email
export const memoryOtpStore = new Map<string, MemoryOtp>();   // key: email
