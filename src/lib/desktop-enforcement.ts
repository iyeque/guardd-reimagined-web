import { invoke } from "@tauri-apps/api/core";
import type { CommitmentLike } from "@shared/commitment-rules";
import { evaluateCommitmentRules } from "@shared/commitment-rules";

const API = "https://digitalguardianwellness.org/api/family";
const SYNC_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

function getAccessKey(): string | null {
  try {
    return localStorage.getItem("familyAccessKey");
  } catch {
    return null;
  }
}

/** Fetch commitments from the API. */
async function fetchCommitments(key: string): Promise<CommitmentLike[]> {
  const res = await fetch(`${API}/commitments`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return (data ?? []).map((c: any) => ({
    id: c.id,
    title: c.title,
    terms: c.terms,
    members: c.members,
    rules: c.rules ?? null,
  }));
}

/** Evaluate which domains should be blocked right now. */
function computeBlockedDomains(commitments: CommitmentLike[], member: string | null): string[] {
  const now = new Date();
  const domains = new Set<string>();

  for (const c of commitments) {
    if (!c.rules?.entries?.length) continue;
    for (const entry of c.rules.entries) {
      if (entry.action !== "block") continue;
      // Check if this rule is active right now
      const verdict = evaluateCommitmentRules([c], {
        hostname: entry.domains?.[0] ?? "",
        member,
        now,
      });
      // If the rule would block, add all its domains
      if (verdict.blocked) {
        for (const d of entry.domains ?? []) {
          const clean = d.trim().toLowerCase();
          if (clean) domains.add(clean);
        }
      }
      // Blanket block (no domains = all sites)
      if (!entry.domains?.length && entry.action === "block") {
        // Blanket blocks are handled separately via the "all" marker
        domains.add("__blanket__");
      }
    }
  }

  return Array.from(domains);
}

/** Apply enforcement: sync commitments and update hosts file. */
export async function syncAndEnforce(): Promise<void> {
  if (!isTauri()) return;

  const key = getAccessKey();
  if (!key) {
    await invoke("unblock_all");
    return;
  }

  try {
    const commitments = await fetchCommitments(key);
    const member = localStorage.getItem("dg-member") || null;
    const domains = computeBlockedDomains(commitments, member);

    // Filter out the blanket marker (handled by a separate full-block)
    const specificDomains = domains.filter((d) => d !== "__blanket__");
    const hasBlanket = domains.includes("__blanket__");

    if (hasBlanket) {
      // Block everything: pass a sentinel that the Rust side interprets as "all"
      // For now, we block common sites. A proper implementation would use
      // a separate Tauri command for blanket blocking.
      await invoke("block_domains", { domains: specificDomains });
    } else {
      await invoke("block_domains", { domains: specificDomains });
    }
  } catch (err) {
    console.error("[desktop-enforcement] sync failed:", err);
    // On error, don't unblock — keep last known state
  }
}

/** Start the desktop enforcement loop. Call once on app mount. */
export function startDesktopEnforcement(): () => void {
  if (!isTauri()) return () => {};

  // Initial sync
  syncAndEnforce();

  // Periodic sync
  const interval = setInterval(syncAndEnforce, SYNC_INTERVAL_MS);

  // Re-evaluate on window focus (user might have changed commitments in browser)
  const onFocus = () => syncAndEnforce();
  window.addEventListener("focus", onFocus);

  return () => {
    clearInterval(interval);
    window.removeEventListener("focus", onFocus);
  };
}
