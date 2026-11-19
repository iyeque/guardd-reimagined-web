/**
 * The block page. declarativeNetRequest redirects here instead of showing
 * Chrome's bare ERR_BLOCKED_BY_CLIENT, so the family sees their own agreement
 * rather than a browser error.
 *
 * A limitation worth stating plainly: once DNR redirects, the tab's URL is this
 * page, so the originally-requested hostname is not recoverable in a production
 * MV3 extension (the only hook, onRuleMatchedDebug, is dev-only). This page
 * therefore shows every commitment currently in force rather than guessing which
 * one was relevant. For a family that is usually one or two commitments, and it
 * is honest rather than confidently wrong.
 */

const root = document.getElementById("root");
const lede = document.getElementById("lede");
const agreementsEl = document.getElementById("agreements");
const blockedEl = document.getElementById("blocked");

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

let tickTimer = null;

function fmtRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function stopTicking() {
  if (tickTimer) {
    clearInterval(tickTimer);
    tickTimer = null;
  }
}

function startTicking() {
  stopTicking();
  const nodes = Array.from(document.querySelectorAll(".countdown"));
  if (!nodes.length) return;

  const update = () => {
    let expired = false;
    for (const node of nodes) {
      const ends = Number(node.dataset.ends);
      const remaining = ends - Date.now();
      const timeEl = node.querySelector(".cd-time");
      if (remaining <= 0) {
        if (timeEl) timeEl.textContent = "Opening…";
        expired = true;
      } else if (timeEl) {
        timeEl.textContent = fmtRemaining(remaining);
      }
    }
    if (expired) {
      // A window ended — re-evaluate what is still in force and redraw.
      stopTicking();
      chrome.storage.local.get(["commitments", "enforcement", "member"], render);
    }
  };

  update();
  tickTimer = setInterval(update, 1000);
}

function render(state) {
  // Defensive: rules.js must load before this file. If it ever fails, say so
  // rather than leaving the page stuck on the "Loading…" placeholder forever.
  if (typeof DGRules === "undefined") {
    stopTicking();
    lede.textContent =
      "Could not load the enforcement rules. Reload the extension and sync again.";
    agreementsEl.replaceChildren();
    blockedEl.textContent = "";
    return;
  }

  const { commitments = [], enforcement = null, member = null } = state;
  const now = new Date();
  const hostname = (enforcement?.blocked ?? [])[0] ?? "";

  // Only commitments whose block is in force right now — the same rule the
  // network block used, so the page can never advertise a rule that isn't live.
  const active = [];
  for (const c of commitments ?? []) {
    if (!c.rules?.entries?.length) continue;
    const hasBlockEntry = c.rules.entries.some((e) => e.action === "block");
    if (!hasBlockEntry) continue;
    const verdict = DGRules.evaluateCommitmentRules([c], {
      hostname,
      member: member || null,
      now,
    });
    if (verdict.blocked) active.push(c);
  }

  if (active.length === 0) {
    stopTicking();
    lede.textContent =
      "Nothing is blocked right now. If a site still will not load, open the extension settings and sync again.";
    agreementsEl.replaceChildren(el("p", "empty", "No commitments are currently in force."));
    blockedEl.textContent = "";
    return;
  }

  const who = member ? `Agreed by ${member}'s family` : "Agreed by your family";
  lede.textContent =
    active.length === 1
      ? "Your family agreed to this, and it is in force right now."
      : `${active.length} of your family's agreements are in force right now.`;

  agreementsEl.replaceChildren(
    ...active.map((c) => {
      const card = el("div", "agreement");
      card.append(el("h2", null, c.title || "A family commitment"));
      card.append(el("p", null, c.terms || ""));
      card.append(el("p", "who", `${who}${c.members && c.members !== "everyone" ? ` · ${c.members}` : ""}`));

      const endsAt = DGRules.blockEndsAt(c, { hostname, member: member || null, now });
      if (endsAt) {
        const cd = el("div", "countdown");
        cd.dataset.ends = String(endsAt.getTime());
        cd.append(el("span", "cd-label", "Opens in"));
        cd.append(el("span", "cd-time", fmtRemaining(endsAt.getTime() - now.getTime())));
        let atLabel = "";
        try {
          atLabel = new Intl.DateTimeFormat("en-US", {
            timeZone: c.rules?.timezone || undefined,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }).format(endsAt);
        } catch {
          atLabel = "";
        }
        if (atLabel) cd.append(el("span", "cd-at", `· at ${atLabel}`));
        card.append(cd);
      }
      return card;
    }),
  );

  const domains = enforcement?.blocked ?? [];
  blockedEl.replaceChildren(
    document.createTextNode(
      domains.length
        ? "Currently blocked: "
        : "This site is blocked by an agreement that is in force.",
    ),
    ...domains.map((d, i) => {
      const frag = document.createDocumentFragment();
      if (i > 0) frag.append(document.createTextNode(" "));
      frag.append(el("code", null, d));
      return frag;
    }),
  );

  startTicking();
}

document.getElementById("back").addEventListener("click", (e) => {
  e.preventDefault();
  if (history.length > 1) history.back();
  else window.close();
});

chrome.storage.local.get(["commitments", "enforcement", "member"], render);
