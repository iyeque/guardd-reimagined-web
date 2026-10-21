/**
 * When a community event stops being shown.
 *
 * This lives outside `server/community-sync.ts` on purpose: that module pulls in
 * the database client, which throws at import when `DATABASE_URL` is unset. A
 * pure date rule has no business requiring a database connection to be tested.
 */

/**
 * An event is expired once its date has passed.
 *
 * Only a full date counts as evidence. The live feeds also return free-text
 * dates ("Upcoming", "TBD", "2026"), and guessing at those would hide events a
 * family has not attended yet — the failure mode is invisible and only fixable
 * by a resync.
 *
 * Two formats are recognised:
 *   - `YYYY-MM-DD`, used by the curated list and the generated local events
 *   - `M/D/YYYY`, which is what `toLocaleDateString()` produces on an en-US host
 *     and therefore what the RSS normaliser stores
 *
 * Curated entries carry the event's LAST day, so an event disappears the day
 * after it ends.
 */
export function isEventExpired(event: { date?: string } | null | undefined): boolean {
  const raw = String(event?.date ?? "").trim();
  if (!raw) return false;

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  if (!iso && !us) return false;

  // The two formats order their fields differently: ISO is year-month-day, the
  // locale form is month-day-year.
  const [y, m, d] = iso
    ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    : [Number(us![3]), Number(us![1]), Number(us![2])];

  // Reject impossible dates like 2026-13-40, which Date.UTC would roll over
  // into a different day rather than refuse.
  const endOfDay = Date.UTC(y, m - 1, d, 23, 59, 59, 999);
  const parsed = new Date(endOfDay);
  if (parsed.getUTCFullYear() !== y || parsed.getUTCMonth() !== m - 1 || parsed.getUTCDate() !== d) {
    return false;
  }

  const now = new Date();
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return endOfDay < startOfToday;
}
