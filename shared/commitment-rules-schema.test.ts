/**
 * Holds the server-side validator for a commitment's enforcement rules to its
 * contract. The authoring UI already blocks these shapes, but the API is the
 * last line of defence — a rule that reaches the database in a contradictory
 * shape is enforced by the extension exactly as written.
 */
import { describe, it, expect } from "vitest";
import { commitmentRulesSchema } from "./commitment-rules-schema";

const window_ = { days: [0, 1, 2, 3, 4], start: "21:00", end: "07:00" };

const rules = (entry: Record<string, unknown>) => ({
  timezone: "Asia/Dubai",
  entries: [{ windows: [window_], appliesTo: [], action: "block", ...entry }],
});

describe("commitmentRulesSchema", () => {
  it("accepts a specific-scope rule that names its sites", () => {
    const parsed = commitmentRulesSchema.safeParse(
      rules({ scope: "specific", domains: ["instagram.com"] }),
    );
    expect(parsed.success).toBe(true);
  });

  it("accepts an all-sites rule that names none", () => {
    const parsed = commitmentRulesSchema.safeParse(rules({ scope: "all", domains: [] }));
    expect(parsed.success).toBe(true);
  });

  it("accepts an all-sites-except rule that names what to leave open", () => {
    const parsed = commitmentRulesSchema.safeParse(
      rules({ scope: "all-except", domains: [], exceptDomains: ["school.example.edu"] }),
    );
    expect(parsed.success).toBe(true);
  });

  // "All sites except" with nothing to except is just "All sites" — and an
  // empty list would silently block the very sites the parent meant to leave
  // open, so it must not be storable.
  it("rejects an all-sites-except rule with nothing to leave open", () => {
    const parsed = commitmentRulesSchema.safeParse(
      rules({ scope: "all-except", domains: [], exceptDomains: [] }),
    );
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toMatch(/must list the sites to leave open/i);
    }
  });

  // An except list alongside named sites is never consulted by the engine, so
  // storing it would quietly ignore what the parent typed.
  it("rejects an except list on a rule that names its sites", () => {
    const parsed = commitmentRulesSchema.safeParse(
      rules({ scope: "specific", domains: ["instagram.com"], exceptDomains: ["school.example.edu"] }),
    );
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toMatch(/only applies to a rule that covers all sites/i);
    }
  });

  it("accepts a rule with no scope, which the extension reads from its domains", () => {
    expect(commitmentRulesSchema.safeParse(rules({ domains: ["tiktok.com"] })).success).toBe(true);
    expect(commitmentRulesSchema.safeParse(rules({ domains: [] })).success).toBe(true);
  });

  // The extension treats an empty domain list as "every site". A specific-scope
  // rule that names nothing would therefore blanket-block the whole household —
  // the opposite of what was authored.
  it("rejects a specific-scope rule with no sites", () => {
    const parsed = commitmentRulesSchema.safeParse(rules({ scope: "specific", domains: [] }));
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toMatch(/must name at least one site/i);
    }
  });

  // The mirror image: sites are named but the scope says "every site", so the
  // extension would silently narrow to just those domains.
  it("rejects an all-sites rule that still names sites", () => {
    const parsed = commitmentRulesSchema.safeParse(
      rules({ scope: "all", domains: ["instagram.com"] }),
    );
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toMatch(/must not name sites/i);
    }
  });

  it("still rejects an empty domain string and an empty entry list", () => {
    expect(commitmentRulesSchema.safeParse(rules({ domains: [""] })).success).toBe(false);
    expect(commitmentRulesSchema.safeParse({ timezone: "UTC", entries: [] }).success).toBe(false);
  });

  it("keeps null meaning 'enforce nothing'", () => {
    expect(commitmentRulesSchema.safeParse(null).success).toBe(true);
  });
});
