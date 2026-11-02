import type { CommitmentRules } from "./schema";

export type CommitmentLike = {
  id: number;
  title: string;
  terms: string;
  members: string;
  rules: CommitmentRules | null;
};

export type RuleVerdict =
  | { blocked: false; reminded: false }
  | {
      blocked: true;
      reminded: false;
      commitmentId: number;
      title: string;
      terms: string;
      agreedBy: string;
    }
  | {
      blocked: false;
      reminded: true;
      commitmentId: number;
      title: string;
      terms: string;
      agreedBy: string;
    };

/** "21:00" -> minutes since midnight. Returns null for malformed input. */
function parseClock(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

const WEEKDAYS: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/**
 * Local day-of-week and minutes-since-midnight in the rule's own timezone.
 *
 * Deliberately not the browser's clock: a family in Dubai must have "21:00"
 * mean 21:00 in Dubai, including when a child travels or the device zone is
 * wrong.
 */
function zonedParts(now: Date, timezone: string): { day: number; minutes: number } {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);
  } catch {
    // Unknown IANA zone — refuse to guess. Blocking nothing beats blocking
    // everything on a typo.
    return { day: -1, minutes: -1 };
  }
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  // Some environments render midnight as "24"; normalise it.
  const hour = Number(get("hour")) % 24;
  const minute = Number(get("minute"));
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return { day: -1, minutes: -1 };
  }
  return {
    day: WEEKDAYS[get("weekday")] ?? -1,
    minutes: hour * 60 + minute,
  };
}

function windowCovers(
  window: { days: number[]; start: string; end: string },
  day: number,
  minutes: number,
): boolean {
  const start = parseClock(window.start);
  const end = parseClock(window.end);
  if (start === null || end === null) return false;

  if (start <= end) {
    // Same-day window: only the listed day, between start and end.
    return window.days.includes(day) && minutes >= start && minutes < end;
  }

  // Wraps past midnight. `days` names the day the window OPENS on, so a
  // 21:00→07:00 window on Monday also covers Tuesday 02:00 — even though
  // Tuesday itself is not in `days`. Checking membership first would make the
  // carry-over half unreachable.
  if (window.days.includes(day) && minutes >= start) return true;
  const prevDay = (day + 6) % 7;
  return window.days.includes(prevDay) && minutes < end;
}

/**
 * Does `rule` cover `hostname`? Exported so the extension's blanket-window
 * check uses the same matcher as the per-site engine instead of a second one
 * that could drift.
 */
/**
 * Escalation check: given a remind rule with a `dismissalsBeforeBlock` threshold
 * and the number of times it has been dismissed today, should it escalate to a
 * hard block?
 *
 * Pure function — no side effects, no storage access. The caller (extension,
 * desktop app, mobile app) is responsible for tracking the dismissal count and
 * passing it in. This keeps the escalation logic platform-agnostic.
 */
export function shouldEscalate(
  entry: { action: "block" | "remind"; dismissalsBeforeBlock?: number | null },
  dismissalCount: number,
): boolean {
  if (entry.action !== "remind") return false;
  if (!entry.dismissalsBeforeBlock || entry.dismissalsBeforeBlock <= 0) return false;
  return dismissalCount >= entry.dismissalsBeforeBlock;
}
export function hostMatches(rule: string, hostname: string): boolean {
  const clean = rule.trim().toLowerCase().replace(/^www\./, "");
  const host = hostname.toLowerCase().replace(/^www\./, "");
  if (!clean) return false;
  return host === clean || host.endsWith(`.${clean}`);
}

/**
 * Single source of truth for "is this blocked right now", shared by the web app
 * and the Commitment Extension so the two can never disagree.
 *
 * First matching commitment wins. A commitment with null rules (every
 * pre-existing row) enforces nothing.
 */
export function evaluateCommitmentRules(
  commitments: CommitmentLike[],
  input: { hostname: string; member: string | null; now: Date },
): RuleVerdict {
  for (const commitment of commitments) {
    const rules = commitment.rules;
    if (!rules?.entries?.length) continue;
    if (!rules.timezone) continue;

    const { day, minutes } = zonedParts(input.now, rules.timezone);
    if (day < 0) continue;

    for (const entry of rules.entries) {
      if (!entry.domains.some((d) => hostMatches(d, input.hostname))) continue;

      if (entry.appliesTo.length > 0) {
        // Unknown user: a member-scoped rule must not apply, or a shared
        // browser would block the parent by mistake.
        if (!input.member) continue;
        const names = entry.appliesTo.map((n) => n.trim().toLowerCase());
        if (!names.includes(input.member.trim().toLowerCase())) continue;
      }

      if (!entry.windows.some((w) => windowCovers(w, day, minutes))) continue;

      if (entry.action === "block") {
        return {
          blocked: true,
          reminded: false,
          commitmentId: commitment.id,
          title: commitment.title,
          terms: commitment.terms,
          agreedBy: commitment.members,
        };
      }

      // "remind" — let the page load, show the family's wording as an overlay.
      return {
        blocked: false,
        reminded: true,
        commitmentId: commitment.id,
        title: commitment.title,
        terms: commitment.terms,
        agreedBy: commitment.members,
      };
    }
  }
  return { blocked: false, reminded: false };
}
