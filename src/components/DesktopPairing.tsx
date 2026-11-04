import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { invoke } from "@tauri-apps/api/core";
import { getAccessKey } from "@/lib/desktop-enforcement";

const API = "https://digitalguardianwellness.org/api/family";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export function isDesktop(): boolean {
  return isTauri();
}

export function DesktopPairing() {
  const [key, setKey] = useState(getAccessKey() ?? "");
  const [status, setStatus] = useState<"idle" | "validating" | "paired" | "error">(
    getAccessKey() ? "paired" : "idle"
  );
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = getAccessKey();
    if (existing) {
      validate(existing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function validate(k: string) {
    setStatus("validating");
    setError(null);
    try {
      const res = await fetch(`${API}/commitments`, {
        headers: { Authorization: `Bearer ${k}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setFamilyName(data?.familyName ?? "Family");
      localStorage.setItem("familyAccessKey", k);
      setStatus("paired");
    } catch (e) {
      setError("Invalid or expired access key");
      setStatus("error");
    }
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
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
            <span className="text-sm font-medium text-foreground">
              Paired{familyName ? ` — ${familyName}` : ""}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Commitments sync automatically every 30 minutes. Enforcement is active.
          </p>
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
          {error && (
            <p className="text-[11px] font-bold text-red-600 dark:text-red-400">{error}</p>
          )}
          <p className="text-[11px] text-muted-foreground font-medium">
            Get your key from the Family Commitments page on the web app.
          </p>
        </form>
      )}
    </div>
  );
}