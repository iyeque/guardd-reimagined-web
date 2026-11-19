import { describe, it, expect } from "vitest";
import {
  hashSecret,
  verifySecret,
  generateRecoveryCode,
  isLocked,
  nextFailure,
  PIN_REGEX,
  MAX_FAILED_ATTEMPTS,
  LOCK_MS,
} from "./pin-crypto";

describe("pin-crypto", () => {
  it("hashes a PIN and verifies it, rejecting a wrong one", () => {
    const { hash, salt } = hashSecret("1234");
    expect(hash).toBeTruthy();
    expect(salt).toBeTruthy();
    expect(verifySecret("1234", hash, salt)).toBe(true);
    expect(verifySecret("4321", hash, salt)).toBe(false);
  });

  it("uses a fresh salt each time, so identical PINs hash differently", () => {
    const a = hashSecret("1234");
    const b = hashSecret("1234");
    expect(a.salt).not.toBe(b.salt);
    expect(a.hash).not.toBe(b.hash);
    // A supplied salt is deterministic.
    const c = hashSecret("1234", a.salt);
    expect(c.hash).toBe(a.hash);
  });

  it("rejects a tampered hash or salt without throwing", () => {
    const { hash, salt } = hashSecret("9999");
    expect(verifySecret("9999", "zz" + hash.slice(2), salt)).toBe(false);
    expect(verifySecret("9999", hash, "")).toBe(false);
  });

  it("generates a non-trivial recovery code", () => {
    const code = generateRecoveryCode();
    expect(code.length).toBeGreaterThanOrEqual(16);
    expect(generateRecoveryCode()).not.toBe(code);
  });

  it("accepts only 4–6 digit PINs", () => {
    expect(PIN_REGEX.test("1234")).toBe(true);
    expect(PIN_REGEX.test("123456")).toBe(true);
    expect(PIN_REGEX.test("123")).toBe(false);
    expect(PIN_REGEX.test("1234567")).toBe(false);
    expect(PIN_REGEX.test("12a4")).toBe(false);
    expect(PIN_REGEX.test("")).toBe(false);
  });

  it("isLocked only while lockedUntil is in the future", () => {
    const now = Date.parse("2026-10-19T17:00:00Z");
    expect(isLocked(null, now)).toBe(false);
    expect(isLocked(new Date(now - 1000), now)).toBe(false);
    expect(isLocked(new Date(now + 1000), now)).toBe(true);
  });

  it("locks out once the failure threshold is reached", () => {
    const now = Date.parse("2026-10-19T17:00:00Z");
    // Below threshold: increments, no lock.
    const first = nextFailure(0, now);
    expect(first.failedAttempts).toBe(1);
    expect(first.lockedUntil).toBeNull();
    // Reaching threshold: locks for LOCK_MS.
    const last = nextFailure(MAX_FAILED_ATTEMPTS - 1, now);
    expect(last.failedAttempts).toBe(MAX_FAILED_ATTEMPTS);
    expect(last.lockedUntil?.getTime()).toBe(now + LOCK_MS);
  });
});
