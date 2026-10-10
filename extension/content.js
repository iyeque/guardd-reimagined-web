/**
 * Content script: the "remind" path.
 *
 * A "block" rule never reaches here — declarativeNetRequest redirects to
 * blocked.html before the page loads, so there is nothing for a content script
 * to touch. "remind" rules deliberately let the page load and show the family's
 * agreement as an overlay instead, which is why this file exists at all.
 *
 * The verdict comes from the background worker's cache rather than a fresh
 * fetch, so the overlay and the network rules can never disagree.
 */

chrome.runtime.sendMessage({ type: "dg:evaluate", hostname: location.hostname }, (res) => {
  const verdict = res?.verdict;
  if (!verdict?.blocked) return;

  const style = document.createElement("style");
  style.textContent = `
    .dg-commitment-overlay {
      position: fixed; inset: 0; z-index: 2147483647;
      background: rgba(15, 23, 42, 0.94); color: #F8FAFC;
      display: flex; align-items: center; justify-content: center;
      padding: 24px; font-family: ui-sans-serif, system-ui, sans-serif;
      backdrop-filter: blur(3px);
    }
    .dg-card { max-width: 34rem; text-align: center; }
    .dg-eyebrow {
      font-size: 10px; font-weight: 800; letter-spacing: 0.16em;
      text-transform: uppercase; color: #4FD1C5; margin-bottom: 14px;
    }
    .dg-title { font-size: 1.5rem; font-weight: 800; margin: 0 0 12px; }
    .dg-terms { font-size: 0.95rem; line-height: 1.65; color: #CBD5E1; margin: 0 0 16px; white-space: pre-wrap; }
    .dg-meta { font-size: 0.8rem; color: #64748B; margin: 0 0 22px; }
    .dg-continue {
      height: 44px; padding: 0 22px; border: 0; border-radius: 10px;
      background: #4FD1C5; color: #062E2B; cursor: pointer;
      font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase;
      font-family: inherit;
    }
    .dg-continue:hover { filter: brightness(1.06); }`;
  (document.head ?? document.documentElement).appendChild(style);

  const overlay = document.createElement("div");
  overlay.className = "dg-commitment-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  const card = document.createElement("div");
  card.className = "dg-card";

  const eyebrow = document.createElement("div");
  eyebrow.className = "dg-eyebrow";
  eyebrow.textContent = "Digital Guardian";

  const title = document.createElement("h2");
  title.className = "dg-title";
  title.textContent = verdict.title || "A family commitment is in force";

  const terms = document.createElement("p");
  terms.className = "dg-terms";
  terms.textContent = verdict.terms || "";

  const meta = document.createElement("p");
  meta.className = "dg-meta";
  meta.textContent = verdict.agreedBy ? `Agreed by ${verdict.agreedBy}` : "Agreed by your family";

  const button = document.createElement("button");
  button.className = "dg-continue";
  button.type = "button";
  button.textContent = "I've read it — continue";
  // Dismissing is a reminder, not a gate: the page loaded, so the family chose
  // to be reminded rather than blocked.
  button.addEventListener("click", () => overlay.remove());

  card.append(eyebrow, title, terms, meta, button);
  overlay.append(card);

  // document_start means the body may not exist yet, so wait for it rather than
  // assuming the DOM is ready.
  const mount = () => (document.body ?? document.documentElement).appendChild(overlay);
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount, { once: true });
});
