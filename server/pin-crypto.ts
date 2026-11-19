/**
 * Parent-PIN cryptography and rate-limit policy — pure functions over node:crypto
 * so they are unit-testable without a database or an HTTP request.
 *
 * The PIN is an OPTIONAL, opt-in gate. A family with no row in family_parent_gate
 * stays on the honor system (nothing is gated). Once a PIN is set, sensitive
 * server writes require it. The PIN and the one-time recovery code are stored
 * only as scrypt hashes with a per-secret salt; neither is recoverable from the
 * database, and a forgotten PIN is reset with the recovery code or by an admin.
 */
import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;

/** A parent PIN is 4–6 digits — short enough to type on a shared family device. */
export const PIN_REGEX = /^\d{4,6}$/;

/** Failed attempts before the gate locks, and how long the lock lasts. */
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_MS = 15 * 60 * 1000;

/** Hash a secret (PIN or recovery code) with a fresh or supplied salt. */
export function hashSecret(secret: string, salt?: string): { hash: string; salt: string } {
  const useSalt = salt ?? randomBytes(16).toString("hex");
  const hash = scryptSync(secret, useSalt, KEYLEN).toString("hex");
  return { hash, salt: useSalt };
}

/** Constant-time verification of a secret against its stored hash + salt. */
export function verifySecret(secret: string, hash: string, salt: string): boolean {
  let candidate: Buffer;
  try {
    candidate = scryptSync(secret, salt, KEYLEN);
  } catch {
    return false;
  }
  const stored = Buffer.from(hash, "hex");
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
}

/** A one-time recovery code, shown once at setup/reset and never stored plainly. */
export function generateRecoveryCode(): string {
  return randomBytes(15).toString("base64url");
}

/** Is the gate currently locked out after too many failed attempts? */
export function isLocked(lockedUntil: Date | null | undefined, now: number = Date.now()): boolean {
  return !!lockedUntil && lockedUntil.getTime() > now;
}

/**
 * Next lockout state after a failed attempt. Returns the incremented count and,
 * once the threshold is reached, a lockedUntil timestamp; otherwise null.
 */
export function nextFailure(
  failedAttempts: number,
  now: number = Date.now(),
): { failedAttempts: number; lockedUntil: Date | null } {
  const count = failedAttempts + 1;
  if (count >= MAX_FAILED_ATTEMPTS) {
    return { failedAttempts: count, lockedUntil: new Date(now + LOCK_MS) };
  }
  return { failedAttempts: count, lockedUntil: null };
}
