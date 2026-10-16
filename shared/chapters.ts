/**
 * Chapter content packs for the family extension.
 *
 * A chapter is a named group of the games and rules a family has agreed on, for
 * a specific member. It is content, not code: the parent adds the pack in the web
 * app, and the extension enforces the rule it carries.
 *
 * A chapter carries the same `CommitmentRules` object the bundled engine already
 * evaluates, so there is only one rule shape in the project and the web app and
 * the browser extension can never disagree about what a window means.
 */

import type { CommitmentRules } from "./schema";
import { evaluateCommitmentRules } from "./commitment-rules";
export { evaluateCommitmentRules };

/** One content pack a family has agreed on. */
export interface Chapter {
  id: string;
  title: string;
  summary: string;
  memberIds: string[];
  rules: CommitmentRules | null;
}

/** A bundle of chapters, in play order. */
export interface ChapterCollection {
  chapters: Chapter[];
}

/** The verdict the bundled engine returns for a chapter. */
export type ChapterVerdict = {
  blocked: boolean;
  chapterId: string;
  title: string;
  terms: string;
  agreedBy: string;
};

// --- builders ---------------------------------------------------------------

/** A chapter with `rules: null` carries nothing to enforce. */
export function chapter(
  id: string,
  title: string,
  summary: string,
  memberIds: string[],
  rules: CommitmentRules | null = null,
): Chapter {
  return { id, title, summary, memberIds, rules: rules ?? null };
}

// --- evaluation -------------------------------------------------------------

/**
 * Evaluate every chapter in `collection` against `hostname` at `now`. The bundled
 * engine is the single source of truth for window math, so this never drifts.
 */
export function evaluateChapterCollection(
  collection: ChapterCollection,
  hostname: string,
  now: Date,
): ChapterVerdict[] {
  const verdicts: ChapterVerdict[] = [];
  for (const chapter of collection.chapters) {
    if (!chapter.rules) continue;
    const commitments = [
      {
        id: 0,
        title: chapter.title,
        terms: chapter.summary,
        members: chapter.memberIds.join(","),
        rules: chapter.rules,
      },
    ];
    const result = evaluateCommitmentRules(commitments, {
      hostname: String(hostname ?? "").toLowerCase(),
      member: null,
      now,
    });
    if (result.blocked) {
      verdicts.push({ ...result, chapterId: chapter.id });
    }
  }
  return verdicts;
}

/**
 * Build a handful of default content packs. Pure content - a parent can edit a
 * pack's title, summary and windows in the web app, and no bundle rebuild is
 * needed for ordinary edits.
 */
export function defaultChapters(): Chapter[] {
  return [
    chapter(
      "no-phone-after-8",
      "No phones after 8",
      "We keep our phones off after 8pm so everyone can rest.",
      ["member-1"],
      {
        timezone: "Asia/Dubai",
        entries: [
          {
            domains: ["instagram.com", "m.instagram.com"],
            windows: [{ days: [0, 1, 2, 3, 4], start: "20:00", end: "07:00" }],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    ),
    chapter(
      "weekend-stream-stop",
      "Stop the stream at 6pm",
      "When the weekend stream ends, the family does something else together.",
      ["member-1", "member-2"],
      {
        timezone: "Asia/Dubai",
        entries: [
          {
            domains: ["youtube.com", "tiktok.com"],
            windows: [{ days: [0, 1, 2, 3, 4, 5, 6], start: "18:00", end: "00:00" }],
            appliesTo: [],
            action: "block",
          },
        ],
      },
    ),
  ];
}
