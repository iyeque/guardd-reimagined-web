import { describe, it, expect } from "vitest";
import { evaluateCommitmentRules, blockEndsAt, commitmentBlockEndsAt, type CommitmentLike } from "./commitment-rules";

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
  // A blanket rule names no domains. The engine must NOT match it, because an
  // empty domain list matches nothing — blanket enforcement lives in the
  // extension's own blanketVerdict (a DNR rule for block, an overlay for
  // remind). Pinned so nobody "fixes" the engine into claiming it.
  it("never matches a blanket entry, which names no domains", () => {
    const blanket = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            scope: "all",
            domains: [],
            windows: [{ days: [0, 1, 2, 3, 4], start: "21:00", end: "07:00" }],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    });
    const v = evaluateCommitmentRules([blanket], {
      hostname: "instagram.com",
      member: "Amina",
      now: sunday22,
    });
    expect(v.blocked).toBe(false);
    expect(v.reminded).toBe(false);
  });

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

describe("blockEndsAt", () => {
  const input = (now: Date, over: Partial<{ hostname: string; member: string | null }> = {}) => ({
    hostname: "instagram.com",
    member: null as string | null,
    now,
    ...over,
  });

  it("ends an overnight window at its end time the next morning (opening half)", () => {
    // Sunday 22:00 inside 21:00→07:00 → opens Monday 07:00 (9h later).
    const ends = blockEndsAt(makeCommitment(), input(sunday22));
    expect(ends?.toISOString()).toBe("2026-10-12T07:00:00.000Z");
  });

  it("ends an overnight window the same morning in the carry-over half", () => {
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
    // Tuesday 02:00, carried over from Monday's window → opens Tuesday 07:00 (5h).
    const ends = blockEndsAt(c, input(new Date("2026-10-13T02:00:00Z")));
    expect(ends?.toISOString()).toBe("2026-10-13T07:00:00.000Z");
  });

  it("ends a same-day window at its end time today", () => {
    const c = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [{ days: [0], start: "09:00", end: "17:00" }],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    });
    // Sunday 12:00 inside 09:00→17:00 → opens 17:00 (5h).
    const ends = blockEndsAt(c, input(new Date("2026-10-11T12:00:00Z")));
    expect(ends?.toISOString()).toBe("2026-10-11T17:00:00.000Z");
  });

  it("measures remaining time on the rule's timezone, not the browser's", () => {
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
    // 19:00 UTC = 23:00 Dubai; window ends 23:59 Dubai = 19:59 UTC (59 min).
    const ends = blockEndsAt(c, input(new Date("2026-10-11T19:00:00Z")));
    expect(ends?.toISOString()).toBe("2026-10-11T19:59:00.000Z");
  });

  it("takes the furthest end when windows overlap", () => {
    const c = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [
              { days: [0], start: "21:00", end: "23:00" },
              { days: [0], start: "22:00", end: "07:00" },
            ],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    });
    // Sunday 22:30: first window ends in 30 min, second carries to 07:00 → 07:00.
    const ends = blockEndsAt(c, input(new Date("2026-10-11T22:30:00Z")));
    expect(ends?.toISOString()).toBe("2026-10-12T07:00:00.000Z");
  });

  it("returns null when the commitment is not blocking right now", () => {
    expect(blockEndsAt(makeCommitment(), input(monday20))).toBeNull();
  });

  it("returns null for an unlisted domain", () => {
    expect(blockEndsAt(makeCommitment(), input(sunday22, { hostname: "wikipedia.org" }))).toBeNull();
  });

  it("returns null when a member-scoped rule does not apply to this member", () => {
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
    expect(blockEndsAt(c, input(sunday22, { member: "Dad" }))).toBeNull();
    expect(blockEndsAt(c, input(sunday22, { member: "Amina" }))?.toISOString()).toBe(
      "2026-10-12T07:00:00.000Z",
    );
  });

  it("returns null for null rules", () => {
    expect(blockEndsAt(makeCommitment({ rules: null }), input(sunday22))).toBeNull();
  });
});

describe("commitmentBlockEndsAt (page overview)", () => {
  it("reports the end of the current block spell regardless of site/member", () => {
    // Sunday 22:00 inside the default 21:00→07:00 window → Monday 07:00.
    expect(commitmentBlockEndsAt(makeCommitment(), sunday22)?.toISOString()).toBe(
      "2026-10-12T07:00:00.000Z",
    );
  });

  it("detects a blanket block that names no sites (which blockEndsAt cannot)", () => {
    const blanket = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            domains: [],
            windows: [{ days: [0, 1, 2, 3, 4], start: "21:00", end: "07:00" }],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    });
    expect(commitmentBlockEndsAt(blanket, sunday22)?.toISOString()).toBe(
      "2026-10-12T07:00:00.000Z",
    );
  });

  it("returns null outside the window", () => {
    expect(commitmentBlockEndsAt(makeCommitment(), monday20)).toBeNull();
  });

  it("returns null for a remind-only commitment", () => {
    const remind = makeCommitment({
      rules: {
        timezone: "UTC",
        entries: [
          {
            domains: ["instagram.com"],
            windows: [{ days: [0, 1, 2, 3, 4], start: "21:00", end: "07:00" }],
            appliesTo: [],
            action: "remind",
          },
        ],
      },
    });
    expect(commitmentBlockEndsAt(remind, sunday22)).toBeNull();
  });

  it("returns null for null rules", () => {
    expect(commitmentBlockEndsAt(makeCommitment({ rules: null }), sunday22)).toBeNull();
  });
});
