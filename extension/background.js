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
    await applyRules([]);
    return;
  }

  try {
    const res = await fetch(`${API}/commitments`, {
      headers: { Authorization: `Bearer ${familyAccessKey}` },
    });

    if (res.status === 401) {
      // A rejected key is a pairing problem, not a transient one — surface it
      // plainly instead of retrying every 30 minutes. Clear the rules too, so a
      // stale key cannot keep blocking sites forever.
      await chrome.storage.local.set({
        syncError: "The family access key was rejected. Re-paste it in settings.",
      });
      await applyRules([]);
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const commitments = await res.json();
    const who = await fetch(`${API}/access/whoami`, {
      headers: { Authorization: `Bearer ${familyAccessKey}` },
    }).catch(() => null);

    await chrome.storage.local.set({
      commitments,
      syncedAt: Date.now(),
      syncError: null,
      ...(who?.ok ? { familyId: who.familyId, deviceLabel: who.deviceLabel } : {}),
    });

    await applyRules(commitments);
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
  const { commitments, member } = await chrome.storage.local.get(["commitments", "member"]);
  if (!commitments) return { blocked: false };
  return DGRules.evaluateCommitmentRules(commitments, {
    hostname: String(hostname ?? "").toLowerCase(),
    member: member || null,
    now: new Date(),
  });
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
async function applyRules(commitments) {
  const { member } = await chrome.storage.local.get("member");
  const now = new Date();

  const domains = new Set();
  for (const c of commitments ?? []) {
    for (const entry of c.rules?.entries ?? []) {
      // "remind" shows the overlay without blocking, so it is not a DNR rule.
      if (entry.action !== "block") continue;
      for (const d of entry.domains ?? []) {
        const domain = String(d).trim().toLowerCase();
        if (domain) domains.add(domain);
      }
    }
  }

  const addRules = [];
  let id = 1;
  for (const domain of [...domains].sort()) {
    const verdict = DGRules.evaluateCommitmentRules(commitments, {
      hostname: domain,
      member: member || null,
      now,
    });
    if (!verdict.blocked) continue;
    addRules.push({
      id: id++,
      priority: 1,
      // Redirect rather than block: a blocked request never loads a page, so no
      // content script could run on it and the family would see Chrome's bare
      // ERR_BLOCKED_BY_CLIENT. Redirecting to our own page is what lets the
      // block explain itself in the family's own words.
      action: { type: "redirect", redirect: { extensionPath: "/blocked.html" } },
      // requestDomains matches the domain and its subdomains. main_frame covers
      // the navigation itself; sub_frame covers an embed on another site.
      condition: {
        requestDomains: [domain],
        resourceTypes: ["main_frame", "sub_frame"],
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
      blocked: addRules.map((r) => r.condition.requestDomains[0]),
    },
  });

  armNextBoundary(commitments);
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
