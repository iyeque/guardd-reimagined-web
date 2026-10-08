import { describe, it, expect } from "vitest";
import { evaluateCommitmentRules, type CommitmentLike } from "./commitment-rules";

const base = {
  id: 1,
  title: "No social media after 9pm",
  terms: "We agreed as a family that screens stop at 21:00 on school nights.",
  members: "Amina, Dad",
};

const makeCommitment = (over: Partial<CommitmentLike> = {}): CommitmentLike => ({
  ...base,
  rules: {
    timezone: "UTC",
    entries: [
      {
        domains: ["instagram.com", "tiktok.com"],
        windows: [{ days: [0, 1, 2, 3, 4], start: "21:00", end: "07:00" }],
        appliesTo: [],
        action: "block",
      },
    ],
  },
  ...over,
});

// 2026-10-11 is a Sunday (day 0). 22:00 UTC sits inside the window.
const sunday22 = new Date("2026-10-11T22:00:00Z");
// 2026-10-12 is a Monday (day 1). 20:00 UTC is before the window opens.
const monday20 = new Date("2026-10-12T20:00:00Z");

describe("evaluateCommitmentRules", () => {
  it("blocks a listed domain inside the window", () => {
    const v = evaluateCommitmentRules([makeCommitment()], {
      hostname: "www.instagram.com",
      member: "Amina",
      now: sunday22,
    });
    expect(v.blocked).toBe(true);
  });

  it("allows the same domain outside the window", () => {
    const v = evaluateCommitmentRules([makeCommitment()], {
      hostname: "www.instagram.com",
      member: "Amina",
      now: monday20,
    });
    expect(v.blocked).toBe(false);
  });

  it("does not block a domain that is not listed", () => {
    const v = evaluateCommitmentRules([makeCommitment()], {
      hostname: "wikipedia.org",
      member: "Amina",
      now: sunday22,
    });
    expect(v.blocked).toBe(false);
  });

  it("does not match a domain that merely shares a suffix", () => {
    // Guards against "notinstagram.com" being caught by an endsWith check.
    const v = evaluateCommitmentRules([makeCommitment()], {
      hostname: "notinstagram.com",
      member: "Amina",
      now: sunday22,
    });
    expect(v.blocked).toBe(false);
  });

  it("ignores commitments with null rules", () => {
    const v = evaluateCommitmentRules([makeCommitment({ rules: null })], {
      hostname: "www.instagram.com",
      member: "Amina",
      now: sunday22,
    });
    expect(v.blocked).toBe(false);
  });

  it("blocks a window that wraps past midnight", () => {
    const c = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [{ days: [1], start: "21:00", end: "07:00" }],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    });
    // Monday 23:00 — inside a 21:00→07:00 window that started Monday.
    expect(
      evaluateCommitmentRules([c], {
        hostname: "instagram.com",
        member: null,
        now: new Date("2026-10-12T23:00:00Z"),
      }).blocked,
    ).toBe(true);
    // Tuesday 02:00 — still inside; the window carried over midnight.
    expect(
      evaluateCommitmentRules([c], {
        hostname: "instagram.com",
        member: null,
        now: new Date("2026-10-13T02:00:00Z"),
      }).blocked,
    ).toBe(true);
    // Tuesday 08:00 — the window has closed.
    expect(
      evaluateCommitmentRules([c], {
        hostname: "instagram.com",
        member: null,
        now: new Date("2026-10-13T08:00:00Z"),
      }).blocked,
    ).toBe(false);
  });

  it("honours appliesTo when a member is named", () => {
    const c = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [{ days: [0, 1, 2, 3, 4], start: "21:00", end: "07:00" }],
            appliesTo: ["Amina"],
            action: "block",
          },
        ],
      },
    });
    expect(
      evaluateCommitmentRules([c], {
        hostname: "instagram.com",
        member: "Amina",
        now: sunday22,
      }).blocked,
    ).toBe(true);
    expect(
      evaluateCommitmentRules([c], {
        hostname: "instagram.com",
        member: "Dad",
        now: sunday22,
      }).blocked,
    ).toBe(false);
  });

  it("does not apply a member-scoped rule when the member is unknown", () => {
    const c = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [{ days: [0, 1, 2, 3, 4], start: "21:00", end: "07:00" }],
            appliesTo: ["Amina"],
            action: "block",
          },
        ],
      },
    });
    expect(
      evaluateCommitmentRules([c], {
        hostname: "instagram.com",
        member: null,
        now: sunday22,
      }).blocked,
    ).toBe(false);
  });

  it("evaluates in the rule's timezone, not the browser's", () => {
    // 21:00 Asia/Dubai (UTC+4). At 19:00 UTC it is 23:00 local, so blocked.
    const c = makeCommitment({
      rules: {
        timezone: "Asia/Dubai",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [{ days: [0], start: "21:00", end: "23:59" }],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    });
    expect(
      evaluateCommitmentRules([c], {
        hostname: "instagram.com",
        member: null,
        now: new Date("2026-10-11T19:00:00Z"),
      }).blocked,
    ).toBe(true);
    // At 13:00 UTC it is 17:00 local, so allowed.
    expect(
      evaluateCommitmentRules([c], {
        hostname: "instagram.com",
        member: null,
        now: new Date("2026-10-11T13:00:00Z"),
      }).blocked,
    ).toBe(false);
  });

  it("ignores a malformed time window instead of blocking everything", () => {
    const c = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "9pm", end: "07:00" }],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    });
    expect(
      evaluateCommitmentRules([c], {
        hostname: "instagram.com",
        member: null,
        now: sunday22,
      }).blocked,
    ).toBe(false);
  });

  it("returns the agreement text so the overlay can quote it", () => {
    const v = evaluateCommitmentRules([makeCommitment()], {
      hostname: "instagram.com",
      member: "Amina",
      now: sunday22,
    });
    expect(v.blocked).toBe(true);
    if (v.blocked) {
      expect(v.title).toContain("No social media");
      expect(v.terms).toContain("agreed as a family");
      expect(v.agreedBy).toBe("Amina, Dad");
      expect(v.commitmentId).toBe(1);
    }
  });
});
