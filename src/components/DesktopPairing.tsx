import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { getAccessKey, syncAndEnforce } from "@/lib/desktop-enforcement";
import { apiFetch } from "@/lib/api-client";
import type { CommitmentRules, RuleEntry } from "@shared/schema";

const API = "https://digitalguardianwellness.org/api/family";
const MEMBER_KEY = "dg-member";

function isTauri(): boolean {
  return typeof window !== "undefined" && ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);
}

export function isDesktop(): boolean {
  return isTauri();
}

type FamilyCommitment = {
  id: number;
  title: string;
  terms: string;
  members: string;
  status: string;
  rules: CommitmentRules | null;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatWindow(w: { start: string; end: string; days: number[] }): string {
  const days = (w.days ?? []).map((d) => DAY_NAMES[d] ?? String(d)).join(", ");
  return `${days || "any day"} · ${w.start}–${w.end}`;
}

function RuleSummary({ entry, timezone }: { entry: RuleEntry; timezone?: string }) {
  const isBlock = entry.action === "block";
  const scope = entry.scope ?? (entry.domains?.length ? "specific" : "all");
  let targets: string;
  if (scope === "all") targets = "All sites";
  else if (scope === "all-except") targets = `All sites except ${(entry.exceptDomains ?? []).join(", ") || "none"}`;
  else targets = (entry.domains ?? []).join(", ") || "All sites";

  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-2.5 text-[11px] space-y-1">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block rounded px-1.5 py-0.5 font-black uppercase tracking-wide ${
            isBlock
              ? "bg-red-500/15 text-red-600 dark:text-red-400"
              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
          }`}
        >
          {entry.action}
        </span>
        <span className="text-muted-foreground">{scope}</span>
        {timezone && <span className="ml-auto text-muted-foreground">{timezone}</span>}
      </div>
      <p className="font-medium text-foreground break-words">{targets}</p>
      {(entry.windows ?? []).length > 0 && (
        <p className="text-muted-foreground">{entry.windows!.map(formatWindow).join(" · ")}</p>
      )}
      <p className="text-muted-foreground">Applies to: {(entry.appliesTo ?? []).join(", ") || "everyone"}</p>
      {entry.dismissalsBeforeBlock != null && (
        <p className="text-muted-foreground">Escalates to block after {entry.dismissalsBeforeBlock} dismissals</p>
      )}
    </div>
  );
}

function CommitmentCard({ c }: { c: FamilyCommitment }) {
  const isCompleted = c.status === "completed";
  const entries = c.rules?.entries ?? [];
  return (
    <div className="rounded-xl border border-border bg-background/50 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-bold text-foreground break-words">{c.title || "(untitled)"}</p>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
            isCompleted
              ? "bg-teal-500/15 text-teal-700 dark:text-teal-400"
              : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
          }`}
        >
          {c.status || "pending"}
        </span>
      </div>
      {c.terms && <p className="text-[11px] text-muted-foreground break-words">{c.terms}</p>}
      <p className="text-[10px] text-muted-foreground">Members: {c.members || "—"}</p>
      {entries.length > 0 ? (
        <div className="space-y-1.5">
          {entries.map((entry, i) => (
            <RuleSummary key={i} entry={entry} timezone={c.rules?.timezone} />
          ))}
        </div>
      ) : (
        <p className="text-[10px] italic text-muted-foreground">No enforcement rules on this commitment.</p>
      )}
    </div>
  );
}

export function DesktopPairing() {
  const [key, setKey] = useState(getAccessKey() ?? "");
  const [status, setStatus] = useState<"idle" | "validating" | "paired" | "error">(
    getAccessKey() ? "paired" : "idle"
  );
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commitments, setCommitments] = useState<FamilyCommitment[]>([]);
  const [member, setMember] = useState<string>(() => {
    try { return localStorage.getItem(MEMBER_KEY) ?? ""; } catch { return ""; }
  });

  const validate = useCallback(async (k: string) => {
    setStatus("validating");
    setError(null);
    try {
      const res = await apiFetch(`${API}/commitments`, {
        headers: { Authorization: `Bearer ${k}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: FamilyCommitment[] = Array.isArray(data) ? data : [];
      setCommitments(list);

      const whoamiRes = await apiFetch(`${API.replace("/family", "")}/family/access/whoami`, {
        headers: { Authorization: `Bearer ${k}` },
      });
      if (whoamiRes.ok) {
        const whoami = await whoamiRes.json();
        setFamilyName(whoami?.familyId ?? "Family");
      } else {
        setFamilyName("Family");
      }
      localStorage.setItem("familyAccessKey", k);
      setStatus("paired");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/HTTP 401|HTTP 403/.test(msg)) {
        setError("Invalid or expired access key");
      } else {
        setError(`Could not reach the server (${msg}). Check your connection and try again.`);
      }
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const existing = getAccessKey();
    if (existing) validate(existing);
  }, [validate]);

  const members = Array.from(
    new Set(
      commitments.flatMap((c) => (c.members ?? "").split(",")).map((m) => m.trim()).filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));

  async function handleMemberChange(next: string) {
    setMember(next);
    try {
      if (next) localStorage.setItem(MEMBER_KEY, next);
      else localStorage.removeItem(MEMBER_KEY);
    } catch (e) {
      console.error("[desktop-pairing] failed to persist member", e);
    }
    await syncAndEnforce();
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) return;
    await validate(trimmed);
  }

  async function handleDisconnect() {
    localStorage.removeItem("familyAccessKey");
    setKey("");
    setFamilyName(null);
    setCommitments([]);
    setStatus("idle");
    try {
      await invoke("unblock_all");
    } catch {
      // ignore
    }
  }

  if (!isTauri()) return null;

  return (
    <div className="rounded-xl border-2 border-border bg-white/50 dark:bg-white/5 p-4 space-y-3">
      <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
        Pair Family (Desktop)
      </h3>

      {status === "paired" ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-sm font-medium text-foreground">
              Paired{familyName ? ` — ${familyName}` : ""}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Commitments sync every 30 minutes. Enforcement uses the selected family member.
          </p>

          <div className="rounded-xl border border-border bg-background/40 p-3 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Enforce rules for
            </label>
            <select
              value={member}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">No member (blanket rules only)</option>
              {members.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {members.length === 0 && (
              <p className="text-[10px] text-muted-foreground">No members found in commitments yet.</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Family commitments ({commitments.length})
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => validate(key)}
                className="text-[10px] uppercase tracking-widest"
              >
                Refresh
              </Button>
            </div>
            {commitments.length === 0 ? (
              <p className="text-[11px] italic text-muted-foreground">No commitments found for this family.</p>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {commitments.map((c) => <CommitmentCard key={c.id} c={c} />)}
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Disconnect
          </Button>
        </div>
      ) : (
        <form onSubmit={handleConnect} className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Paste your family access key
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste the key you were given"
              className="flex-1 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm font-mono"
            />
            <Button
              type="submit"
              variant="outline"
              disabled={status === "validating" || !key.trim()}
              className="shrink-0 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              {status === "validating" ? "Checking…" : "Connect"}
            </Button>
          </div>
          {error && <p className="text-[11px] font-bold text-red-600 dark:text-red-400">{error}</p>}
          <p className="text-[11px] text-muted-foreground font-medium">
            Get your key from the Family Commitments page on the web app.
          </p>
        </form>
      )}
    </div>
  );
}
