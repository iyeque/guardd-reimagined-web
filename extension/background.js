/**
 * Background service worker: keeps the family's commitments cached locally,
 * pushes the currently-active blocks to declarativeNetRequest, and re-arms
 * itself at every window boundary.
 *
 * Auth: the extension sends the family access key as a bearer token and nothing
 * else. The server derives the family from the key, so there is no familyId to
 * store, configure, or get wrong.
 */

const API = "https://digitalguardianwellness.org/api/family";
const SYNC_ALARM = "dg-sync-commitments";
const BOUNDARY_ALARM = "dg-rule-boundary";
const SYNC_PERIOD_MINUTES = 30;

// Load the bundled rule engine and chapter packs. These are classic IIFE
// scripts, so they declare their globals on the shared global scope that the
// service worker runs in.
importScripts(chrome.runtime.getURL("rules.js"), chrome.runtime.getURL("chapters.js"));

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(SYNC_ALARM, { periodInMinutes: SYNC_PERIOD_MINUTES });
});

// Registered once, here. Registering this inside applyRules() would add a fresh
// listener on every re-apply, so crossing one window boundary would fire the
// handler as many times as rules had been applied before it.
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SYNC_ALARM || alarm.name === BOUNDARY_ALARM) {
    sync().catch(() => {});
  }
});

chrome.runtime.onStartup.addListener(() => {
  sync().catch(() => {});
});

/** Options page asks for an immediate sync and wants the outcome back. */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "dg-sync-now") return false;
  sync()
    .then(() => sendResponse({ ok: true }))
    .catch((err) => sendResponse({ ok: false, error: String(err?.message ?? err) }));
  return true; // keep the channel open for the async response
});

/** Content script asks whether this hostname is blocked, and why. */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "dg:evaluate") return false;
  evaluateHost(msg.hostname)
    .then((verdict) => sendResponse({ ok: true, verdict }))
    .catch((err) => sendResponse({ ok: false, error: String(err?.message ?? err) }));
  return true;
});

async function sync() {
  const { familyAccessKey } = await chrome.storage.sync.get("familyAccessKey");
  if (!familyAccessKey) {
    await chrome.storage.local.set({ syncError: "No family access key saved." });
    // Nothing paired: make sure a previously-blocked site is reachable again.
    await applyRules([], []);
    return;
  }

  try {
    const [commitmentsRes, chaptersRes] = await Promise.all([
      fetch(`${API}/commitments`, {
        headers: { Authorization: `Bearer ${familyAccessKey}` },
      }),
      fetch(`${API}/chapters`, {
        headers: { Authorization: `Bearer ${familyAccessKey}` },
      }),
    ]);

    if (commitmentsRes.status === 401 || chaptersRes.status === 401) {
      // A rejected key is a pairing problem, not a transient one — surface it
      // plainly instead of retrying every 30 minutes. Clear the rules too, so a
      // stale key cannot keep blocking sites forever.
      await chrome.storage.local.set({
        syncError: "The family access key was rejected. Re-paste it in settings.",
      });
      await applyRules([], []);
      return;
    }
    if (!commitmentsRes.ok || !chaptersRes.ok) {
      throw new Error(`HTTP ${commitmentsRes.status}, ${chaptersRes.status}`);
    }

    const commitments = await commitmentsRes.json();
    const chaptersData = await chaptersRes.json();

    // Map the family's content packs into chapter objects.
    const chapters = chaptersData.packs.map((p) => DGRules.chapter(
      p.packId,
      p.title,
      p.summary,
      p.memberIds,
      p.rules ?? null,
    ));

    const who = await fetch(`${API}/access/whoami`, {
      headers: { Authorization: `Bearer ${familyAccessKey}` },
    }).catch(() => null);

    await chrome.storage.local.set({
      commitments,
      chapters,
      syncedAt: Date.now(),
      syncError: null,
      ...(who?.ok ? { familyId: who.familyId, deviceLabel: who.deviceLabel } : {}),
    });

    await applyRules(commitments, chapters);
  } catch (err) {
    await chrome.storage.local.set({ syncError: String(err?.message ?? err) });
    throw err;
  }
}

/**
 * Should this hostname be blocked, and under which commitment?
 *
 * Used by the content script for the reminder overlay. It reads the cached
 * commitments rather than refetching, so the overlay and the network block can
 * never disagree about what is blocked.
 */
async function evaluateHost(hostname) {
  const { commitments, chapters, member } = await chrome.storage.local.get(["commitments", "chapters", "member"]);
  if (!commitments && !chapters) return { blocked: false, reminded: false };
  const domain = String(hostname ?? "").toLowerCase();
  const base = {
    hostname: domain,
    member: member || null,
    now: new Date(),
  };
  const byCommitment = DGRules.evaluateCommitmentRules(commitments, base);
  const chapterResults = chapters
    ? DGRules.evaluateChapterCollection(chapters, domain, base.now)
    : [];
  const byChapterBlocked = chapterResults.some((v) => v.blocked);
  const byChapterReminded = chapterResults.some((v) => v.reminded);
  // A blanket window names no site, so the shared engine can never match it —
  // it has to be resolved here or "all sites" reminders would be silent.
  const blanket = blanketVerdict(commitments, member || null, base.now, domain);
  const chapter = chapterResults[0] ?? null;
  const fromCommitment = byCommitment.blocked || byCommitment.reminded;
  // Most specific source wins for the wording: the site's own rule, then the
  // pack, then the blanket window.
  const source = fromCommitment
    ? {
        id: byCommitment.commitmentId,
        title: byCommitment.title,
        terms: byCommitment.terms,
        agreedBy: byCommitment.agreedBy,
      }
    : chapter
      ? {
          id: chapter.chapterId,
          title: chapter.title,
          terms: chapter.terms,
          agreedBy: chapter.agreedBy,
        }
      : blanket
        ? {
            id: blanket.commitmentId,
            title: blanket.title,
            terms: blanket.terms,
            agreedBy: blanket.agreedBy,
          }
        : null;
  return {
    blocked: byCommitment.blocked || byChapterBlocked || blanket?.action === "block",
    reminded: byCommitment.reminded || byChapterReminded || blanket?.action === "remind",
    commitmentId: source?.id,
    title: source?.title,
    terms: source?.terms,
    agreedBy: source?.agreedBy,
  };
}

/**
 * Push the currently-active blocks to declarativeNetRequest.
 *
 * DNR is not time-aware — it evaluates a static rule set — so this must run
 * again at every window boundary or blocks stay active outside the agreed hours.
 * That re-arm is the single most likely bug in this feature, so it is tested.
 *
 * Each domain is tested on its own through the shared engine rather than
 * re-implementing the window logic here, which is what guarantees the extension
 * blocks exactly what the web app says it will.
 */
async function applyRules(commitments, chapters) {
  const { member } = await chrome.storage.local.get("member");
  const now = new Date();

  // Unique domains we must test, from both commitments and content packs.
  const domains = new Set();
  for (const c of [...(commitments ?? []), ...(chapters ?? [])]) {
    for (const entry of c.rules?.entries ?? []) {
      if (entry.action !== "block") continue;
      for (const d of entry.domains ?? []) {
        const domain = String(d).trim().toLowerCase();
        if (domain) domains.add(domain);
      }
    }
  }

  const addRules = [];
  let id = 1;

  // Specific domains (commitments + content packs) currently blocked.
  for (const domain of [...domains].sort()) {
    const blocked = DGRules.evaluateCommitmentRules(commitments, {
      hostname: domain,
      member: member || null,
      now,
    }).blocked;
    if (!blocked) {
      const blockedByChapter = DGRules.evaluateChapterCollection(chapters, domain, now).some((v) => v.blocked);
      if (!blockedByChapter) continue;
    }

    addRules.push({
      id: id++,
      priority: 1,
      action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
      condition: {
        requestDomains: [domain],
        resourceTypes: ["main_frame", "sub_frame"],
      },
    });
  }

  // Blanket rule: if a committed "no-website window" is active, block every
  // origin so the family's agreed screen-free period is enforced at the browser
  // level. Fire-and-forget only makes sense if host_permissions covers all
  // origins — so this is why manifest.json declares "<all_urls>".
  const blanket = blanketVerdict(commitments, member, now);
  if (blanket?.action === "block") {
    addRules.push({
      id: id++,
      priority: 1,
      action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
      condition: {
        // No urlFilter: per the DNR contract an omitted urlFilter matches every
        // url. "<all_urls>" is a host-permission pattern, not a urlFilter — as a
        // literal it would match nothing and the blanket block would never fire.
        // Schemes are pinned so the redirect target itself is never re-matched.
        resourceTypes: ["main_frame", "sub_frame"],
        schemes: ["http", "https"],
        // Sites the family agreed to leave open, e.g. a school portal. DNR
        // applies these itself, so the engine does not have to be consulted
        // per request.
        ...(blanket.excepts.length ? { excludedRequestDomains: blanket.excepts } : {}),
      },
    });
  }

  // Replace the whole set. A rule that no longer applies must stop blocking,
  // which means removing everything previously added, not just adding on top.
  const old = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: old.map((r) => r.id),
    addRules,
  });

  await chrome.storage.local.set({
    enforcement: {
      at: now.toISOString(),
      domainsTested: domains.size,
      blocked: addRules.map((r) => r.condition.requestDomains?.[0] ?? "all"),
      blanket: blanketVerdict(commitments, member, now)?.action ?? null,
    },
  });

  armNextBoundary(commitments);
}

/** Does `w` cover the given weekday and minute-of-day? Handles windows that
 *  wrap past midnight, where the early hours belong to the previous day. */
function windowCovers(w, day, mins) {
  const start = parseClock(w.start);
  const end = parseClock(w.end);
  if (start === null || end === null) return false;
  if (start <= end) return w.days.includes(day) && mins >= start && mins < end;
  if (w.days.includes(day) && mins >= start) return true;
  const prevDay = (day + 6) % 7;
  return w.days.includes(prevDay) && mins < end;
}

/** Blanket verdict: a committed rule that names no domains whose time window
 *  currently covers `now`. Both actions matter — a blanket *block* becomes a
 *  DNR rule (with host_permissions "<all_urls>", no site is reachable), while a
 *  blanket *remind* has no DNR rule and is surfaced through the overlay on
 *  every site instead. The shared engine cannot express either, because an
 *  empty domain list matches nothing there.
 *
 *  `hostname` is optional: pass it to ask "does this window cover this site",
 *  which skips windows that except it. Omit it when building the DNR rule,
 *  which carries the exception list itself via excludedRequestDomains. */
function blanketVerdict(commitments, member, now, hostname) {
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const me = (member || "").trim().toLowerCase();
  const host = String(hostname ?? "").toLowerCase();
  for (const c of commitments ?? []) {
    for (const entry of c.rules?.entries ?? []) {
      if (entry.domains?.length) continue; // names sites: not blanket
      if (entry.appliesTo?.length && !entry.appliesTo.some((n) => n.trim().toLowerCase() === me)) continue;
      if (!entry.windows?.some((w) => windowCovers(w, day, mins))) continue;
      const excepts = (entry.exceptDomains ?? []).filter(Boolean);
      // A site the family agreed to leave open is never touched by this window.
      if (host && excepts.some((d) => DGRules.hostMatches(d, host))) continue;
      return {
        action: entry.action === "remind" ? "remind" : "block",
        excepts,
        commitmentId: c.id,
        title: c.title,
        terms: c.terms,
        agreedBy: c.members,
      };
    }
  }
  return null;
}

/** Parse a "HH:MM" clock value to minutes since midnight (or null if invalid). */
function parseClock(value) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value).trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Arm an alarm for the next window edge so the rule set is re-applied then. */
function armNextBoundary(commitments) {
  const next = nextWindowBoundary(commitments);
  if (!next) return;
  // Alarms fire no sooner than a minute out. A boundary closer than that would
  // never fire, leaving a stale rule set in place — so clamp it and let the next
  // sync pick up the change.
  const when = Math.max(next, Date.now() + 60 * 1000);
  chrome.alarms.create(BOUNDARY_ALARM, { when });
}

/**
 * Earliest upcoming window edge across all rules, or null if none are scheduled.
 *
 * TimeWindow edges are `start`/`end`. Reading the wrong field names silently
 * finds no boundary, which leaves blocks running outside their agreed hours.
 */
function nextWindowBoundary(commitments) {
  let soonest = null;
  const now = Date.now();
  for (const c of commitments ?? []) {
    for (const entry of c.rules?.entries ?? []) {
      for (const w of entry.windows ?? []) {
        // TimeWindow edges are `start`/`end`, not from/until — using the wrong
        // names silently finds no boundary and leaves blocks running outside
        // their agreed hours.
        for (const edge of [w.start, w.end]) {
          if (!edge) continue;
          const m = /^(\d{1,2}):(\d{2})$/.exec(String(edge).trim());
          if (!m) continue;
          const h = Number(m[1]);
          const min = Number(m[2]);
          if (h > 23 || min > 59) continue;
          // Look a week ahead so a rule with no edge today still gets armed.
          for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
            const d = new Date();
            d.setDate(d.getDate() + dayOffset);
            d.setHours(h, min, 0, 0);
            if (d.getTime() > now && (soonest === null || d.getTime() < soonest)) {
              soonest = d.getTime();
            }
          }
        }
      }
    }
  }
  return soonest;
}

// Reached through a global because a service worker has no module system. Lets
// the rule builders be tested without loading the extension into a browser.
globalThis.__dgTestHooks = { applyRules, nextWindowBoundary, evaluateHost };
