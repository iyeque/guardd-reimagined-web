import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Lock, ShieldCheck, X } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { parentPinApi } from "@/lib/parent-pin";

/**
 * Optional, opt-in parent gate. Families with no PIN stay on the honor system
 * (enabled === false, nothing prompts). Once a PIN is set, parent-only actions
 * call requirePin() to collect a verified PIN before hitting the server.
 *
 * Lives inside ProfileProvider so it can read the current profile's family token
 * and re-check status when the profile (and therefore family) changes.
 */
type ParentPinContextValue = {
  enabled: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  /** Resolves with a server-verified PIN, or null if the parent cancels. */
  requirePin: (reason?: string) => Promise<string | null>;
};

const ParentPinContext = createContext<ParentPinContextValue | null>(null);

export function useParentPin(): ParentPinContextValue {
  const ctx = useContext(ParentPinContext);
  if (!ctx) throw new Error("useParentPin must be used within ParentPinProvider");
  return ctx;
}

type Prompt = { reason: string; resolve: (value: string | null) => void };

export function ParentPinProvider({ children }: { children: React.ReactNode }) {
  const { currentProfile } = useProfile();
  const token = currentProfile?.familyAccessToken ?? "";

  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!token) {
      setEnabled(false);
      return;
    }
    setLoading(true);
    try {
      const status = await parentPinApi.status(token);
      setEnabled(status.enabled);
    } catch {
      // If status cannot be read, fail open to the honor system rather than
      // locking the family out of their own commitments.
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const requirePin = useCallback(
    (reason = "Enter the parent PIN to continue") =>
      new Promise<string | null>((resolve) => {
        if (!token || !enabled) {
          resolve(null);
          return;
        }
        setPinInput("");
        setError("");
        setPrompt({ reason, resolve });
      }),
    [token, enabled],
  );

  const submit = async () => {
    if (!prompt || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await parentPinApi.verify(token, pinInput);
      if (result.ok) {
        prompt.resolve(pinInput);
        setPrompt(null);
      } else if (result.lockedUntil) {
        setError("Too many attempts. The gate is locked for a while — try again later.");
      } else {
        setError("Incorrect PIN. Try again.");
      }
    } catch {
      setError("Could not verify the PIN. Check your connection.");
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    prompt?.resolve(null);
    setPrompt(null);
  };

  return (
    <ParentPinContext.Provider value={{ enabled, loading, refresh, requirePin }}>
      {children}
      {prompt && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Parent PIN"
        >
          <div className="w-full max-w-sm rounded-3xl border-2 border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">Parent PIN</div>
                  <div className="text-[11px] text-muted-foreground font-medium">{prompt.reason}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={cancel}
                aria-label="Cancel"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={6}
              autoFocus
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === "Enter") void submit();
                if (e.key === "Escape") cancel();
              }}
              placeholder="••••"
              className="w-full h-14 rounded-2xl border-2 border-border focus:border-teal-500 bg-white/70 dark:bg-white/5 px-4 text-center text-2xl font-black tracking-[0.5em] text-foreground"
            />
            {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={cancel}
                className="flex-1 h-12 rounded-2xl border-2 border-border font-black uppercase tracking-widest text-xs text-muted-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submit()}
                disabled={busy || pinInput.length < 4}
                className="flex-1 h-12 rounded-2xl bg-foreground text-background font-black uppercase tracking-widest text-xs disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {busy ? "Checking…" : "Confirm"}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Only a parent should enter this. Forgot it? Use the recovery code in the
              Parent PIN panel, or ask an administrator to reset it.
            </p>
          </div>
        </div>
      )}
    </ParentPinContext.Provider>
  );
}
