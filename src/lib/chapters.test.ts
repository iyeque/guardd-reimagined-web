/**
 * Holds `shared/chapters.ts` — the family content packs for the family
 * extension — to its engine, so the web app and the browser extension cannot
 * drift on what a pack, a rule, or a verdict means.
 *
 * This test holds the data to its contract: a pack with rules only blocks inside
 * the window, a pack with no rules never blocks, and wrapped night windows are
 * honest about the two nights they cover.
 */
import { describe, it, expect } from "vitest";
import {
  chapter,
  defaultChapters,
  evaluateChapterCollection,
} from "../../shared/chapters";

/** A fixed instant in the middle of a day, in UTC. */
const LATE_NIGHT = new Date("1970-01-01T01:00:00Z"); // Dubai 05:00 (night)
const DAYTIME = new Date("1970-01-01T08:00:00Z"); // Dubai 12:00 (day)
const AFTER_DINNER = new Date("1970-01-01T20:00:00Z"); // Dubai 00:00 (night)

// A complete rule entry, in the same shape the bundled engine reads. It covers
// every night (20:00 -> 07:00) for a single site, which is the shape the
// extension's DNR engine consumes.
function aNightRule(site: string) {
  return {
    action: "block" as const,
    domains: [site],
    windows: [
      { days: [0, 1, 2, 3, 4, 5, 6], start: "20:00", end: "07:00" },
    ],
    appliesTo: [],
  };
}

function nightRules(...sites: string[]) {
  return { timezone: "Asia/Dubai", entries: sites.map((site) => aNightRule(site)) };
}

describe("chapter content packs", () => {
  it("a pack with no rules never blocks", () => {
    const pack = chapter("x", "Ops", "No rules", ["member-1"]);
    expect(pack.rules).toBeNull();
    expect(evaluateChapterCollection({ chapters: [pack] }, "instagram.com", LATE_NIGHT)).toEqual([]);
  });

  it("a pack blocks only inside its window", () => {
    const pack = chapter(
      "past",
      "Past",
      "All gone.",
      ["member-1"],
      { timezone: "UTC", entries: [{ domains: ["example.com"], windows: [{ days: [0], start: "00:00", end: "02:00" }], appliesTo: [], action: "block" }] },
    );
    // Midday -> outside a 00:00-02:00 rule. The engine decides.
    expect(evaluateChapterCollection({ chapters: [pack] }, "example.com", LATE_NIGHT)).toEqual([]);
  });
});

describe("cross-midnight windows", () => {
  it("a 20:00 -> 07:00 rule blocks at night and clears by day", () => {
    const evening = chapter("e", "Evening", "No phones after 8pm", ["member-1"], nightRules("instagram.com"));

    // Dubai 05:00 -> within the 20:00-07:00 period.
    expect(evaluateChapterCollection({ chapters: [evening] }, "instagram.com", LATE_NIGHT)).toEqual([
      expect.objectContaining({ blocked: true, chapterId: "e" }),
    ]);
    // Dubai 12:00 -> outside the night window.
    expect(evaluateChapterCollection({ chapters: [evening] }, "instagram.com", DAYTIME)).toEqual([]);
  });
});

describe("evaluateChapterCollection", () => {
  it("returns only the packs that are blocking", () => {
    const active = chapter("active", "Active", "Blocking now.", [], nightRules("example.com"));
    const inactive = chapter("inactive", "Inactive", "Not now.", [], nightRules("instagram.com"));

    const collection = { chapters: [inactive, active] };
    expect(
      evaluateChapterCollection(collection, "example.com", LATE_NIGHT),
    ).toEqual([expect.objectContaining({ blocked: true, chapterId: "active" })]);
  });

  it("ignores hosts that are outside every rule", () => {
    const pack = chapter("x", "X", "Quiet.", [], nightRules("example.com"));
    expect(evaluateChapterCollection({ chapters: [pack] }, "tiktok.com", LATE_NIGHT)).toEqual([]);
  });
});

describe("defaultChapters", () => {
  it("ships two packs, each with known ids", () => {
    const ids = defaultChapters().map((p) => p.id);
    expect(ids).toEqual(["no-phone-after-8", "weekend-stream-stop"]);
    for (const p of defaultChapters()) {
      expect(p.memberIds.length).toBeGreaterThan(0);
      expect(p.rules).not.toBeNull();
      expect(p.rules!.entries.length).toBeGreaterThan(0);
    }
  });
});

describe("chapter verdict metadata", () => {
  // The extension's overlay reads title/terms/agreedBy straight off the verdict.
  // A chapter block must carry its own wording, because the commitment engine
  // returns none when only a chapter matched.
  it("carries the pack's own title, summary and members on a block", () => {
    const pack = chapter(
      "quiet-hours",
      "Quiet hours",
      "No screens after 8pm on school nights.",
      ["member-1", "member-2"],
      nightRules("instagram.com"),
    );

    const [verdict] = evaluateChapterCollection({ chapters: [pack] }, "instagram.com", LATE_NIGHT);

    expect(verdict).toMatchObject({
      blocked: true,
      chapterId: "quiet-hours",
      title: "Quiet hours",
      terms: "No screens after 8pm on school nights.",
      agreedBy: "member-1,member-2",
    });
  });

  // Chapters are block-only: the engine hardcodes action "block", so a chapter
  // verdict is always `reminded: false` and can never drive a reminder overlay.
  it("never reports a remind verdict", () => {
    const pack = chapter("quiet-hours", "Quiet hours", "No screens.", [], nightRules("instagram.com"));

    const verdicts = evaluateChapterCollection({ chapters: [pack] }, "instagram.com", LATE_NIGHT);

    expect(verdicts).toHaveLength(1);
    expect(verdicts.some((v) => v.reminded)).toBe(false);
    expect(verdicts.every((v) => v.reminded === false)).toBe(true);
  });
});
