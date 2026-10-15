/**
 * Holds `shared/chapters.ts` — the chapter content packs for the family
 * extension — to its engine, so the web app and the browser extension cannot
 * drift on what a chapter, a rule, or a verdict means.
 *
 * This test is the living version of the exported docs: a parent can change the
 * pack's wording without breaking the verdict, and a wrong verdict fails loud
 * and early, before the rule ever reaches the browser.
 */
import { describe, it, expect } from "vitest";
import {
  chapter,
  block,
  remind,
  defaultChapters,
  evaluateChapterCollection,
  chapterActive,
} from "../../shared/chapters";

/** A fixed instant in the middle of a day, in UTC. */
const NOW = new Date("1970-01-01T12:00:00Z");

function hoursAgo(hours: number): Date {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000);
}

const DAY = 24 * 60 * 60 * 1000;

function fullDay(): Date {
  return new Date(NOW.getTime() + DAY);
}

describe("chapter content packs", () => {
  it("keeps the verdict in a single field, and the wording free to change", () => {
    const sport: ReturnType<typeof chapter> = chapter(
      "sport",
      "Play sport",
      "Next week we run in the park together. Thought it looks easy.",
      ["member-1"],
      [
        block(NOW, fullDay(), "Park run"),
        remind(hoursAgo(48), hoursAgo(47), "The park run is tomorrow at 9am, then the park"),
      ]
    );

    expect(chapterActive(sport, hoursAgo(48))).toBe(true);

    const badWording: ReturnType<typeof chapter> = chapter(
      "bad",
      "No skatepark",
      "Disrespectful. Always ask for consent before posting others.",
      [],
      [block(NOW, fullDay(), "Park run")]
    );
    expect(chapterActive(badWording, NOW)).toBe(true);
  });

  it("every default pack has at least one rule", () => {
    for (const pack of defaultChapters()) {
      expect(
        pack.rules.length,
        `pack "${pack.label}" has no rules`
      ).toBeGreaterThan(0);
    }
  });

  it("a chapter is blocking only inside its window", () => {
    const pack = chapter(
      "now",
      "Now",
      "A rule that ends right now.",
      [],
      [block(hoursAgo(25), hoursAgo(24), "in the past")]
    );
    expect(chapterActive(pack, NOW)).toBe(false);

    const packNow = chapter(
      "now",
      "Now",
      "A rule that is in effect.",
      [],
      [block(NOW, new Date(NOW.getTime() + 24 * 60 * 60 * 1000), "just now")]
    );
    expect(chapterActive(packNow, NOW)).toBe(true);
    expect(
      chapterActive(packNow, new Date(NOW.getTime() + 24 * 60 * 60 * 1000 + 1))
    ).toBe(false);
  });

  it("cross-midnight rules block either side of midnight", () => {
    const evening = block(
      new Date("1970-01-01T20:00:00Z"),
      new Date("1970-01-01T07:00:00Z"),
      "Evening"
    );
    const afternoon = block(
      new Date("1970-01-01T12:00:00Z"),
      new Date("1970-01-01T17:00:00Z"),
      "Afternoon"
    );

    const eveningPack = chapter("e", "Evening", "", [], [evening]);
    const afternoonPack = chapter("a", "Afternoon", "", [], [afternoon]);

    expect(chapterActive(eveningPack, new Date("1970-01-01T21:00:00Z"))).toBe(true);
    expect(chapterActive(eveningPack, new Date("1970-01-01T03:00:00Z"))).toBe(true);
    expect(chapterActive(eveningPack, new Date("1970-01-01T12:00:00Z"))).toBe(false);

    expect(chapterActive(afternoonPack, new Date("1970-01-01T12:00:00Z"))).toBe(true);
    expect(chapterActive(afternoonPack, new Date("1970-01-01T21:00:00Z"))).toBe(false);
  });

  it("evaluateChapterCollection returns only the pack that is blocking", () => {
    const active = chapter(
      "active",
      "Active",
      "Blocking now.",
      [],
      [block(NOW, fullDay(), "Now")]
    );
    const inactive = chapter(
      "inactive",
      "Inactive",
      "Not now.",
      [],
      [block(hoursAgo(48), hoursAgo(47), "Past")]
    );

    const collection = { chapters: [inactive, active] };
    expect(evaluateChapterCollection(collection, "example.com", NOW)).toEqual([active]);
  });
});
