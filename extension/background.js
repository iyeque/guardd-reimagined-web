/**
 * Background service worker: keeps the family's commitments cached locally and
 * re-evaluates the rule set, so blocking works offline and survives a restart.
 *
 * Auth: the extension sends the family access key as a bearer token and nothing
 * else. The server derives the family from the key, so there is no familyId to
 * store, configure, or get wrong.
 */

const API = "https://digitalguardianwellness.org/api/family";
const ALARM = "dg-sync-commitments";
const SYNC_PERIOD_MINUTES = 30;

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM, { periodInMinutes: SYNC_PERIOD_MINUTES });
});
chrome.runtime.onStartup.addListener(sync);
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) sync();
});

/** Options page asks for an immediate sync and wants the outcome back. */
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "dg-sync-now") return false;
  sync()
    .then(() => sendResponse({ ok: true, result: true }))
    .catch((err) => sendResponse({ ok: false, error: String(err?.message ?? err) }));
  return true; // keep the channel open for the async response
});

async function sync() {
  const { familyAccessKey } = await chrome.storage.sync.get("familyAccessKey");
  if (!familyAccessKey) {
    await chrome.storage.local.set({ syncError: "No family access key saved." });
    return;
  }

  try {
    const res = await fetch(`${API}/commitments`, {
      headers: { Authorization: `Bearer ${familyAccessKey}` },
    });

    if (res.status === 401) {
      // A rejected key is a pairing problem, not a transient one — surface it
      // plainly instead of retrying every 30 minutes.
      await chrome.storage.local.set({
        syncError: "The family access key was rejected. Re-paste it in settings.",
      });
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

    applyRules(commitments);
  } catch (err) {
    await chrome.storage.local.set({ syncError: String(err?.message ?? err) });
    throw err;
  }
}

/**
 * Decide what should be blocked right now and push it to declarativeNetRequest.
 *
 * `evaluateCommitmentRules` is the single decision point shared with the web app,
 * bundled from shared/commitment-rules.ts by `npm run build:extension` — the
 * extension must never grow a second copy of the rule logic.
 */
async function applyRules(commitments) {
  const { member } = await chrome.storage.local.get("member");
  const verdict = DGRules.evaluateCommitmentRules(commitments, {
    hostname: "",
    member: member || null,
    now: new Date(),
  });

  // Phase 4 replaces this with per-domain dynamic rules. For now the verdict is
  // recorded so the enforcement work has something to build against.
  await chrome.storage.local.set({ lastVerdict: verdict });

  // Re-arm for the next window boundary: declarativeNetRequest rules are static,
  // so a block would otherwise stay active outside its agreed hours. The
  // boundary is the smallest detail here, but it is the single most likely bug
  // in this feature — skipping it silently breaks every schedule.
  const nextBoundary = nextWindowBoundary(commitments, member || null);
  if (nextBoundary) {
    const delayMinutes = Math.max(1, Math.round((nextBoundary - Date.now()) / 60000));
    chrome.alarms.create("dg-rule-boundary", {
      when: Date.now() + delayMinutes * 60000,
    });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "dg-rule-boundary") sync();
    });
  }
}

/** Earliest upcoming window edge across all rules, or null if none are scheduled. */
function nextWindowBoundary(commitments, member) {
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
