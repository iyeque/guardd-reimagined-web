import { describe, it, expect } from "vitest";
import {
  SOCIAL_NAVIGATOR_SCENARIOS,
  isSafeChoice,
  type SocialOption,
} from "./social-navigator";

/**
 * Guards the bug this data used to have.
 *
 * The result panel was coloured by matching English words in the copy:
 *
 *   outcome.includes("Great") || outcome.includes("Perfect")
 *     || outcome.includes("Honorable") || outcome.includes("Consent")
 *
 * Two failures followed from that, and both are silent:
 *
 *  1. An unsafe answer whose wording happened to contain one of those words was
 *     coloured green. Scenario 4's unsafe option reads "Disrespectful. Always
 *     ask for consent before posting others." — it contains "consent". It only
 *     escaped because the match was case-sensitive and the copy says lowercase
 *     "consent". One edit to capitalise it and a wrong answer turns green.
 *
 *  2. Any edit to the safe answers' wording could stop them matching, turning
 *     correct answers red.
 *
 * The verdict now comes from `ok` alone, so the copy can change freely. These
 * tests hold the data to that contract.
 */
describe("Social Navigator verdict", () => {
  it("reads the verdict from `ok` and never from the wording", () => {
    // Same wording as a real unsafe option, but flagged safe: wording must not win.
    const wordingSaysBadButFlaggedSafe: SocialOption = {
      text: "…",
      result: "Disrespectful. Always ask for consent before posting others.",
      ok: true,
    };
    expect(isSafeChoice(wordingSaysBadButFlaggedSafe)).toBe(true);

    // And the reverse: wording that would have matched the old English check.
    const wordingSaysGoodButFlaggedUnsafe: SocialOption = {
      text: "…",
      result: "Great choice! Perfect. Honorable. Consent.",
      ok: false,
    };
    expect(isSafeChoice(wordingSaysGoodButFlaggedUnsafe)).toBe(false);
  });

  it("every scenario has at least one safe option", () => {
    for (const [i, scenario] of SOCIAL_NAVIGATOR_SCENARIOS.entries()) {
      const safe = scenario.options.filter(isSafeChoice);
      expect(safe.length, `scenario ${i + 1} has no safe option`).toBeGreaterThan(0);
    }
  });

  it("no scenario has every option marked safe", () => {
    // A scenario with no wrong answer teaches nothing and cannot be scored.
    for (const [i, scenario] of SOCIAL_NAVIGATOR_SCENARIOS.entries()) {
      const unsafe = scenario.options.filter((o) => !isSafeChoice(o));
      expect(unsafe.length, `scenario ${i + 1} has no unsafe option`).toBeGreaterThan(0);
    }
  });

  it("every option has non-empty wording and a verdict", () => {
    for (const scenario of SOCIAL_NAVIGATOR_SCENARIOS) {
      for (const option of scenario.options) {
        expect(option.text.trim().length).toBeGreaterThan(0);
        expect(option.result.trim().length).toBeGreaterThan(0);
        expect(typeof option.ok).toBe("boolean");
      }
    }
  });
});
