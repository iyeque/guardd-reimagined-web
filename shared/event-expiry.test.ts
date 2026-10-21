/**
 * isEventExpired decides when a community event stops being shown. It must be
 * conservative: the live feeds also return free-text dates ("Upcoming", "TBD",
 * "2026"), and guessing at those would silently hide content the family still
 * needs. Only a full date is treated as evidence that an event has passed.
 */
import { describe, expect, it } from "vitest";
import { isEventExpired } from "./event-expiry.js";

/** Midnight UTC at the start of today, so a fixture can be built from it. */
function startOfTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function isoDaysFromToday(days: number): string {
  const d = startOfTodayUTC();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

describe("isEventExpired", () => {
  it("expires an event whose date is in the past", () => {
    expect(isEventExpired({ date: isoDaysFromToday(-1) })).toBe(true);
    expect(isEventExpired({ date: "2020-01-01" })).toBe(true);
  });

  it("does not expire an event dated today or in the future", () => {
    expect(isEventExpired({ date: isoDaysFromToday(0) })).toBe(false);
    expect(isEventExpired({ date: isoDaysFromToday(1) })).toBe(false);
    expect(isEventExpired({ date: isoDaysFromToday(40) })).toBe(false);
  });

  // The live feeds return prose, not dates. Treating those as expired would
  // disappear events the family has not attended yet, with no way to bring
  // them back short of a resync.
  it("treats a free-text date as still running", () => {
    for (const date of ["Upcoming", "TBD", "Recent", "2026", "3 Days", "Week-Long", ""]) {
      expect(isEventExpired({ date })).toBe(false);
    }
  });

  it("treats a missing or malformed date as still running", () => {
    expect(isEventExpired({})).toBe(false);
    expect(isEventExpired(null)).toBe(false);
    expect(isEventExpired(undefined)).toBe(false);
    expect(isEventExpired({ date: "2026-13-40" })).toBe(false);
    expect(isEventExpired({ date: "  " })).toBe(false);
  });

  // The RSS normaliser stores toLocaleDateString(), which is M/D/YYYY on an
  // en-US host. These are real dates too, and they are the ones actually in the
  // table today — an ISO-only filter let ten past events through.
  it("reads the M/D/YYYY format the RSS normaliser produces", () => {
    expect(isEventExpired({ date: "5/18/2026" })).toBe(true);
    expect(isEventExpired({ date: "12/31/2020" })).toBe(true);
    expect(isEventExpired({ date: "1/1/2099" })).toBe(false);
  });

  it("rejects an impossible M/D/YYYY date instead of rolling it over", () => {
    expect(isEventExpired({ date: "13/40/2026" })).toBe(false);
  });

  // An event listed by its last day should vanish the day after, not the day
  // before it is over.
  it("expires on the day after a listed date, not on the date itself", () => {
    expect(isEventExpired({ date: isoDaysFromToday(0) })).toBe(false);
    expect(isEventExpired({ date: isoDaysFromToday(-1) })).toBe(true);
  });
});
