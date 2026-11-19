import { useState } from "react";
import { KeyRound, ShieldCheck, ShieldOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/context/ProfileContext";
import { useParentPin } from "@/context/ParentPinContext";
import { parentPinApi } from "@/lib/parent-pin";

const PIN_RE = /^\d{4,6}$/;
const labelClass = "text-[10px] font-black uppercase tracking-widest text-muted-foreground";
const fieldClass =
  "w-full h-11 rounded-xl border-2 focus:border-teal-500 bg-white/70 dark:bg-white/5 px-3 text-sm font-bold text-foreground";

/**
 * Opt-in parent gate controls. Default is the honor system (no PIN). A parent can
 * set a PIN to require it for marking commitments complete and redeeming extra
 * screen time, reset a forgotten PIN with the one-time recovery code, or turn the
 * gate off again. The recovery code is shown exactly once.
 */
export function ParentPinPanel() {
  const { currentProfile } = useProfile();
  const token = currentProfile?.familyAccessToken ?? "";
  const { enabled, loading, refresh } = useParentPin();

  const [mode, setMode] = useState<"idle" | "setup" | "reset" | "disable">("idle");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [recovery, setRecovery] = useState("");
  const [newPin, setNewPin] = useState("");
  const [disableSecret, setDisableSecret] = useState("");
  const [shownCode, setShownCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!token) return null; // no family on this device yet — nothing to gate

  const resetForm = () => {
    setPin(""); setConfirm(""); setRecovery(""); setNewPin(""); setDisableSecret(""); setError("");
  };

  const doSetup = async () => {
    setError("");
    if (!PIN_RE.test(pin)) return setError("PIN must be 4–6 digits.");
    if (pin !== confirm) return setError("The two PINs do not match.");
    setBusy(true);
    try {
      const res = await parentPinApi.setup(token, pin);
      setShownCode(res.recoveryCode);
      resetForm();
      setMode("idle");
      await refresh();
      toast.success("Parent PIN is on. Save your recovery code now.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not set the PIN.");
    } finally {
      setBusy(false);
    }
  };

  const doReset = async () => {
    setError("");
    if (!recovery.trim()) return setError("Enter your recovery code.");
    if (!PIN_RE.test(newPin)) return setError("New PIN must be 4–6 digits.");
    setBusy(true);
    try {
      const res = await parentPinApi.reset(token, recovery.trim(), newPin);
      setShownCode(res.recoveryCode);
      resetForm();
      setMode("idle");
      await refresh();
      toast.success("PIN reset. Save your new recovery code now.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reset the PIN.");
    } finally {
      setBusy(false);
    }
  };

  const doDisable = async () => {
    setError("");
    const val = disableSecret.trim();
    if (!val) return setError("Enter your PIN or recovery code to turn the gate off.");
    setBusy(true);
    try {
      const creds = PIN_RE.test(val) ? { pin: val } : { recoveryCode: val };
      await parentPinApi.disable(token, creds);
      resetForm();
      setMode("idle");
      await refresh();
      toast.success("Parent PIN turned off — back to the honor system.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not turn the gate off.");
    } finally {
      setBusy(false);
    }
  };

  const copyCode = () => {
    void navigator.clipboard?.writeText(shownCode);
    setCopied(true);
    toast.success("Recovery code copied.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border-2 border-border bg-white/60 dark:bg-white/5 p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0">
          <KeyRound className="w-4.5 h-4.5 text-teal-600" />
        </div>
        <div className="space-y-1">
          <div className="text-sm font-black text-foreground">
            Parent PIN{" "}
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              optional
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
            {enabled
              ? "On. Marking a commitment complete and redeeming extra screen time now require the parent PIN — even via the API. Everything else stays open."
              : "Off (honor system). Anyone can mark commitments complete. Set a PIN so only a parent can complete commitments or redeem extra screen time."}
          </p>
        </div>
      </div>

      {/* One-time recovery code, shown after setup/reset */}
      {shownCode && (
        <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-4 space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300">
            Recovery code — shown once
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg border-2 border-border bg-white/70 dark:bg-white/5 px-3 py-2 text-xs font-mono text-foreground">
              {shownCode}
            </code>
            <button
              type="button"
              onClick={copyCode}
              className="shrink-0 h-9 px-3 rounded-lg border-2 border-border font-black uppercase tracking-widest text-[10px] inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
            Store this somewhere safe. It is the only way to reset a forgotten PIN
            without an administrator. We cannot show it again.
          </p>
          <button
            type="button"
            onClick={() => setShownCode("")}
            className="text-[10px] font-black uppercase tracking-widest text-teal-600"
          >
            I have saved it — hide
          </button>
        </div>
      )}

      {error && <p className="text-[11px] font-bold text-red-500">{error}</p>}

      {/* Idle actions */}
      {mode === "idle" && !shownCode && (
        <div className="flex flex-wrap gap-2">
          {!enabled && (
            <button
              type="button"
              disabled={loading}
              onClick={() => { resetForm(); setMode("setup"); }}
              className="h-10 px-4 rounded-xl bg-foreground text-background font-black uppercase tracking-widest text-xs inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Set a parent PIN
            </button>
          )}
          {enabled && (
            <>
              <button
                type="button"
                onClick={() => { resetForm(); setMode("reset"); }}
                className="h-10 px-4 rounded-xl border-2 border-border font-black uppercase tracking-widest text-xs"
              >
                Reset forgotten PIN
              </button>
              <button
                type="button"
                onClick={() => { resetForm(); setMode("disable"); }}
                className="h-10 px-4 rounded-xl border-2 border-border font-black uppercase tracking-widest text-xs text-muted-foreground inline-flex items-center gap-2"
              >
                <ShieldOff className="w-4 h-4" /> Turn off
              </button>
            </>
          )}
        </div>
      )}

      {/* Setup form */}
      {mode === "setup" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelClass}>New PIN (4–6 digits)</label>
              <input
                type="password" inputMode="numeric" maxLength={6} value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={fieldClass} placeholder="••••"
              />
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Confirm PIN</label>
              <input
                type="password" inputMode="numeric" maxLength={6} value={confirm}
                onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className={fieldClass} placeholder="••••"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void doSetup()} disabled={busy}
              className="h-10 px-4 rounded-xl bg-teal-600 text-white font-black uppercase tracking-widest text-xs disabled:opacity-50">
              {busy ? "Saving…" : "Turn on"}
            </button>
            <button type="button" onClick={() => { resetForm(); setMode("idle"); }}
              className="h-10 px-4 rounded-xl border-2 border-border font-black uppercase tracking-widest text-xs text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reset form */}
      {mode === "reset" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>Recovery code</label>
            <input type="text" value={recovery} onChange={(e) => setRecovery(e.target.value)}
              className={fieldClass} placeholder="The code you saved at setup" />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>New PIN (4–6 digits)</label>
            <input type="password" inputMode="numeric" maxLength={6} value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={fieldClass} placeholder="••••" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void doReset()} disabled={busy}
              className="h-10 px-4 rounded-xl bg-teal-600 text-white font-black uppercase tracking-widest text-xs disabled:opacity-50">
              {busy ? "Resetting…" : "Reset PIN"}
            </button>
            <button type="button" onClick={() => { resetForm(); setMode("idle"); }}
              className="h-10 px-4 rounded-xl border-2 border-border font-black uppercase tracking-widest text-xs text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Disable form */}
      {mode === "disable" && (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className={labelClass}>PIN or recovery code</label>
            <input type="password" value={disableSecret} onChange={(e) => setDisableSecret(e.target.value)}
              className={fieldClass} placeholder="Confirm it is you" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void doDisable()} disabled={busy}
              className="h-10 px-4 rounded-xl border-2 border-red-500/40 text-red-600 font-black uppercase tracking-widest text-xs disabled:opacity-50">
              {busy ? "Turning off…" : "Turn off gate"}
            </button>
            <button type="button" onClick={() => { resetForm(); setMode("idle"); }}
              className="h-10 px-4 rounded-xl border-2 border-border font-black uppercase tracking-widest text-xs text-muted-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
