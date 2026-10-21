/**
 * Guards the curated event list, which lives in this module alongside the sync
 * logic.
 *
 * Every curated event must carry a full ISO date, because that is the only thing
 * the expiry rule can read. A prose date ("TBD", "Spring 2027") would compile
 * fine, ship fine, and then silently never expire — the event would sit on the
 * community page forever. That is worth a test.
 *
 * The import is dynamic on purpose: `community-sync` pulls in the database
 * client, which throws at module load when DATABASE_URL is unset. A pure data
 * check should not require a database, so a placeholder is set first and the
 * module is loaded afterwards. Nothing here queries.
 */
import { describe, expect, it } from "vitest";

process.env.DATABASE_URL ||= "postgresql://placeholder:placeholder@localhost:5432/placeholder";

const { CURATED_EVENTS } = await import("./community-sync.js");

describe("CURATED_EVENTS dates", () => {
  it("are all full ISO dates so they can expire", () => {
    for (const event of CURATED_EVENTS) {
      expect(event.date, `${event.title} should use an ISO date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("parses to a real calendar date", () => {
    for (const event of CURATED_EVENTS) {
      const parsed = new Date(`${event.date}T00:00:00Z`);
      expect(Number.isNaN(parsed.getTime()), `${event.title} has an unparseable date`).toBe(false);
      expect(parsed.toISOString().split("T")[0]).toBe(event.date);
    }
  });
});
