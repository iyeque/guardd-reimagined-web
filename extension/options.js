/**
 * Options page: pairs this browser with a family access key.
 *
 * The key is the only credential. It identifies the family on the server, so the
 * extension never has to store or guess a familyId — ask the API who a key
 * belongs to instead of asking the user to type one.
 */

const API = "https://digitalguardianwellness.org/api/family";

const el = (id) => document.getElementById(id);
const keyInput = el("key");
const statusBox = el("status");

function showStatus(message, kind) {
  statusBox.textContent = message;
  statusBox.className = `status ${kind}`;
}

function hideStatus() {
  statusBox.className = "status info";
  statusBox.textContent = "";
}

function fmtAgo(ts) {
  if (!ts) return "—";
  const secs = Math.round((Date.now() - ts) / 1000);
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.round(secs / 60)} min ago`;
  return `${Math.round(secs / 3600)} h ago`;
}

/** Who does this key belong to? Returns null when the API rejects it. */
async function whoami(key) {
  const res = await fetch(`${API}/access/whoami`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Ask the background worker to re-sync and report what it stored. */
function requestSync() {
  return new Promise((resolve) => {
    const done = (msg) => {
      chrome.runtime.onMessage.removeListener(done);
      resolve(msg?.result ?? null);
    };
    chrome.runtime.onMessage.addListener(done);
    chrome.runtime.sendMessage({ type: "dg-sync-now" });
  });
}

async function render() {
  const { familyAccessKey } = await chrome.storage.sync.get("familyAccessKey");
  const cache = await chrome.storage.local.get([
    "familyId",
    "deviceLabel",
    "commitments",
    "syncedAt",
    "syncError",
  ]);

  keyInput.value = familyAccessKey ?? "";

  el("s-status").textContent = familyAccessKey
    ? cache.syncError
      ? `Sync failed — ${cache.syncError}`
      : "Connected"
    : "Not paired";
  el("s-family").textContent = cache.familyId ?? "—";
  el("s-device").textContent = cache.deviceLabel ?? "—";
  el("s-count").textContent = cache.commitments ? `${cache.commitments.length}` : "—";
  el("s-synced").textContent = fmtAgo(cache.syncedAt);

  // Members come from the commitments themselves, so the list only exists once
  // a sync has landed. "Everyone" always means no member filter.
  const select = el("member");
  const { member } = await chrome.storage.local.get("member");
  const names = new Set();
  for (const c of cache.commitments ?? []) {
    for (const part of String(c.members ?? "").split(",")) {
      const name = part.trim();
      if (name) names.add(name);
    }
  }
  select.innerHTML = "";
  const everyone = document.createElement("option");
  everyone.value = "";
  everyone.textContent = "Everyone";
  select.appendChild(everyone);
  for (const name of [...names].sort()) {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  }
  select.value = member ?? "";

  if (familyAccessKey && !cache.commitments) {
    showStatus("Key saved. Syncing commitments…", "info");
  } else if (familyAccessKey && cache.syncError) {
    showStatus(`Connected, but the sync failed: ${cache.syncError}`, "bad");
  } else if (familyAccessKey) {
    showStatus(
      `Connected — ${cache.commitments?.length ?? 0} commitment(s) loaded for ${cache.familyId}.`,
      "ok",
    );
  } else {
    hideStatus();
  }
}

el("save").addEventListener("click", async () => {
  const key = keyInput.value.trim();
  if (!key) return showStatus("Paste the key first.", "bad");

  el("save").disabled = true;
  showStatus("Checking the key…", "info");
  try {
    const who = await whoami(key);
    if (!who) {
      showStatus(
        "That key was not recognised. Check it was copied in full, or ask an administrator to reissue it.",
        "bad",
      );
      return;
    }
    await chrome.storage.sync.set({ familyAccessKey: key });
    await chrome.storage.local.set({ familyId: who.familyId, deviceLabel: who.deviceLabel });
    showStatus(`Connected to ${who.deviceLabel}.`, "ok");
    await requestSync();
    await render();
  } catch (err) {
    showStatus(`Could not reach Digital Guardian: ${err.message}`, "bad");
  } finally {
    el("save").disabled = false;
  }
});

el("sync").addEventListener("click", async () => {
  showStatus("Syncing…", "info");
  try {
    await requestSync();
  } catch (err) {
    showStatus(`Sync failed: ${err.message}`, "bad");
  }
  await render();
});

el("forget").addEventListener("click", async () => {
  if (!confirm("Forget this key? This browser will stop enforcing commitments.")) return;
  await chrome.storage.sync.remove("familyAccessKey");
  await chrome.storage.local.remove([
    "familyId",
    "deviceLabel",
    "commitments",
    "syncedAt",
    "syncError",
  ]);
  await render();
});

el("member").addEventListener("change", async (e) => {
  await chrome.storage.local.set({ member: e.target.value });
  await requestSync();
});

render();
