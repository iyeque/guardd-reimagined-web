import { invoke } from "@tauri-apps/api/core";
import { apiFetch } from "@/lib/api-client";
import type { CommitmentLike } from "@shared/commitment-rules";
import { evaluateCommitmentRules } from "@shared/commitment-rules";
import type { PointsLedger, Redemption } from "@shared/gamification";
import { earnPoints, TASK_POINTS } from "@shared/gamification";

// The API also returns a status field, which CommitmentLike does not model.
type CommitmentWithStatus = CommitmentLike & { status?: string };
interface CommitmentApiRow {
  id: number;
  title: string;
  terms: string;
  members: string;
  rules?: CommitmentLike["rules"];
  status?: string;
}

const API = "https://digitalguardianwellness.org/api/family";
const SYNC_INTERVAL_MS = 30 * 60 * 1000;
const COMPLETED_KEY = "dg_completed_commitments";
const REDEMPTIONS_KEY = "dg_gamification_redemptions";

function isTauri(): boolean {
  return typeof window !== "undefined" && ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);
}

export function getAccessKey(): string | null {
  try {
    return localStorage.getItem("familyAccessKey");
  } catch {
    return null;
  }
}

/**
 * Publish a redemption to the server so the browser extension honors it too.
 *
 * The desktop lifts the hosts block locally (syncAndEnforce); this makes the
 * lift cross-layer by recording the redemption where the extension can read it
 * during its sync/poll. Member-scoped: the extension suppresses only this
 * member's block. No-op without an access key (e.g. an unpaired device).
 */
export async function publishRedemption(redemption: Redemption, pin?: string): Promise<void> {
  const key = getAccessKey();
  if (!key) return;
  try {
    const res = await apiFetch(`${API}/redemptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        ...(pin ? { "x-parent-pin": pin } : {}),
      },
      body: JSON.stringify({
        memberId: redemption.memberId,
        pointsSpent: redemption.pointsSpent,
        minutesGranted: redemption.minutesGranted,
        expiresAt: new Date(redemption.expiresAt).toISOString(),
      }),
    });
    if (!res.ok) {
      console.error(`[desktop-enforcement] redemption publish rejected: HTTP ${res.status}`);
    }
  } catch (err) {
    console.error("[desktop-enforcement] failed to publish redemption:", err);
  }
}

function hasActiveRedemption(): boolean {
  try {
    const raw = localStorage.getItem(REDEMPTIONS_KEY);
    if (!raw) return false;
    const redemptions = JSON.parse(raw) as Array<{ expiresAt: number }>;
    return redemptions.some((r) => r.expiresAt > Date.now());
  } catch {
    return false;
  }
}

function getSeenCompleted(): Set<string> {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    // Storage unavailable — treat as no seen commitments.
  }
  return new Set();
}

function saveSeenCompleted(ids: Set<string>) {
  try {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Storage unavailable — points still awarded in-session.
  }
}

/** Fetch commitments from the API. */
async function fetchCommitments(key: string): Promise<CommitmentWithStatus[]> {
  const res = await apiFetch(`${API}/commitments`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: unknown = await res.json();
  const rows = (Array.isArray(data) ? data : []) as CommitmentApiRow[];
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    terms: c.terms,
    members: c.members,
    rules: c.rules ?? null,
    status: c.status ?? "active",
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

function awardCommitmentPoints(commitments: CommitmentWithStatus[]) {
  const seen = getSeenCompleted();
  const newlyCompleted: string[] = [];

  for (const c of commitments) {
    const id = String(c.id);
    if (c.status === "completed" && !seen.has(id)) {
      newlyCompleted.push(id);
    }
  }

  if (newlyCompleted.length > 0) {
    try {
      const raw = localStorage.getItem("dg_gamification_ledger");
      let ledger: PointsLedger = raw ? JSON.parse(raw) : { balance: 0, earned: 0, spent: 0, transactions: [] };
      for (const id of newlyCompleted) {
        const commitment = commitments.find((c) => String(c.id) === id);
        ledger = earnPoints(ledger, TASK_POINTS["commitment-fulfilled"], `Commitment completed: ${commitment?.title ?? id}`);
      }
      localStorage.setItem("dg_gamification_ledger", JSON.stringify(ledger));
    } catch (e) {
      console.error("[desktop-enforcement] failed to award points:", e);
    }

    if (isTauri()) {
      invoke("send_notification", {
        title: "Commitment Completed!",
        body: `${newlyCompleted.length} commitment${newlyCompleted.length > 1 ? "s" : ""} completed - points awarded!`,
      }).catch(() => {});
    }
  }

  for (const c of commitments) {
    if (c.status === "completed") {
      seen.add(String(c.id));
    }
  }
  saveSeenCompleted(seen);
}

/** Apply enforcement: sync commitments and update hosts file. */
export async function syncAndEnforce(): Promise<void> {
  if (!isTauri()) return;

  const key = getAccessKey();
  if (!key) {
    try {
      await invoke("unblock_all");
    } catch {
      // ignore
    }
    return;
  }

  try {
    const commitments = await fetchCommitments(key);
    const member = localStorage.getItem("dg-member") || null;

    awardCommitmentPoints(commitments);

    if (hasActiveRedemption()) {
      await invoke("unblock_all");
      return;
    }

    const domains = computeBlockedDomains(commitments, member);
    const specificDomains = domains.filter((d) => d !== "__blanket__");

    await invoke("block_domains", { domains: specificDomains });
  } catch (err) {
    console.error("[desktop-enforcement] sync failed:", err);
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
