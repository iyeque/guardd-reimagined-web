/**
 * Chapter content packs for the family extension.
 *
 * A chapter is a named group of the games and rules a family has agreed on, for
 * a specific member. It is content, not code: the parent adds the pack in the web
 * app, and the extension enforces the rule it carries.
 *
 * Rules use the declarativeNetRequest shape (action / start / end, both absolute
 * instants) because that is what this extension pushes to the browser. The web
 * app's schema.ts CommitRules carries a *different* shape (days[] arrays,
 * appliesTo). Those live in the commitment engine, not here.
 */

/** The enforcement rule a chapter carries. */
export type ChapterRule = {
  action: "block" | "remind";
  /** Instant, in UTC. */
  start: Date;
  /** Instant, in UTC. */
  end: Date;
  /** What the family agreed this rule is for. */
  reason: string;
};

/** One content pack a family has agreed on. */
export interface Chapter {
  id: string;
  label: string;
  summary: string;
  memberIds: string[];
  rules: ChapterRule[];
}

/** A bundle of chapters, in play order. */
export interface ChapterCollection {
  chapters: Chapter[];
}

const EMPTY_WINDOW = new Date("1970-01-01T00:00:00Z");

// --- builders ---------------------------------------------------------------

/** A block: stop the site, with the family's own summary as the reason. */
export function block(
  start: Date,
  end: Date,
  reason: string
): ChapterRule {
  return { action: "block", start, end, reason };
}

/** A remind: show the family's own wording, do not block. */
export function remind(
  start: Date,
  end: Date,
  reason: string
): ChapterRule {
  return { action: "remind", start, end, reason };
}

/** A chapter that carries no enforcement rules. */
export function chapter(
  id: string,
  label: string,
  summary: string,
  memberIds: string[],
  rules: ChapterRule[] = []
): Chapter {
  return { id, label, summary, memberIds, rules };
}

// --- evaluation -------------------------------------------------------------

/**
 * The chapters in `collection` that are "blocking now" against `hostname` at
 * `now`. A chapter is blocking only while at least one of its rules is inside
 * its window; the extension uses this verdict to pick which rules to push.
 */
export function evaluateChapterCollection(
  collection: ChapterCollection,
  hostname: string,
  now: Date
): Chapter[] {
  const blocking: Chapter[] = [];
  for (const chapter of collection.chapters) {
    if (chapterActive(chapter, now)) {
      blocking.push(chapter);
    }
  }
  return blocking;
}

/** Whether a chapter has any rule currently in effect. */
export function chapterActive(chapter: Chapter, now: Date): boolean {
  return chapter.rules.some((r) => inWindow(r.start, r.end, now));
}

/** True when `now` falls inside `[start, end]`. Cross-midnight windows are
 * supported by comparing as instants, so a rule from 20:00 to 07:00 blocks
 * between midnight and 07:00 as well as between 20:00 and 12:00. */
export function inWindow(start: Date, end: Date, now: Date): boolean {
  // If start <= end the window is a normal single span. If start > end the
  // window wraps midnight, so `now` is inside it when it is either >= start
  // (evening) or <= end (morning).
  return start <= end
    ? now >= start && now <= end
    : now >= start || now <= end;
}

/**
 * Build a handful of default content packs. Pure content — a parent can edit a
 * pack's label, summary and windows in the web app, and no bundle rebuild is
 * needed for ordinary edits.
 */
export function defaultChapters(): Chapter[] {
  return [
    chapter(
      "no-phone-after-8",
      "No phones after 8",
      "We keep our phones off after 8pm so everyone can rest.",
      ["member-1"],
      [
        block(new Date("1970-01-01T20:00:00Z"), new Date("1970-01-01T07:00:00Z"), "No phones after 8pm"),
        remind(new Date("1970-01-01T07:00:00Z"), new Date("1970-01-01T20:00:00Z"), "Phones are fine before 8pm"),
      ]
    ),
    chapter(
      "weekend-stream-stop",
      "Stop the stream at 6pm",
      "When the weekend stream ends, the family does something else together.",
      ["member-1", "member-2"],
      [block(new Date("1970-01-01T18:00:00Z"), new Date("1970-01-01T00:00:00Z"), "Stream ends at 6pm")]
    ),
  ];
}
