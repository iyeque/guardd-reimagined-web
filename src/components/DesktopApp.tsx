import { useState } from "react";
import { DesktopLayout } from "@/components/DesktopLayout";
import { DesktopPairing } from "@/components/DesktopPairing";
import { GamificationPanel } from "@/components/GamificationPanel";
import { Shield, Trophy, Users, Settings } from "lucide-react";

function isTauri(): boolean {
  return typeof window !== "undefined" && ("__TAURI__" in window || "__TAURI_INTERNALS__" in window);
}

export function DesktopApp() {
  if (!isTauri()) return null;

  return (
    <DesktopLayout>
      {(view) => {
        switch (view) {
          case "enforcement":
            return <EnforcementView />;
          case "gamification":
            return (
              <div className="p-6">
                <h2 className="text-2xl font-black mb-4">Rewards & Tasks</h2>
                <GamificationPanel />
              </div>
            );
          case "family":
            return (
              <div className="p-6 space-y-4">
                <h2 className="text-2xl font-black mb-4">Family Pairing</h2>
                <DesktopPairing />
              </div>
            );
          case "settings":
            return <SettingsView />;
          default:
            return null;
        }
      }}
    </DesktopLayout>
  );
}

function EnforcementView() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-black mb-4">Enforcement Status</h2>
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-teal-500" />
          <div>
            <p className="text-lg font-bold">Active</p>
            <p className="text-sm text-muted-foreground">Hosts-file blocking is running</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Commitments sync every 30 minutes. Blocked sites redirect to 127.0.0.1.
        </p>
      </div>
    </div>
  );
}

function SettingsView() {
  const [mode, setMode] = useState<"family" | "corporate">("family");

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-black mb-4">Settings</h2>

      {/* Mode switcher */}
      <div className="rounded-xl border-2 border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
          Wellness Mode
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("family")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
              mode === "family"
                ? "bg-teal-500/10 text-teal-700 border-2 border-teal-500/40"
                : "bg-muted/50 text-muted-foreground border-2 border-transparent"
            }`}
          >
            Family
          </button>
          <button
            onClick={() => setMode("corporate")}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
              mode === "corporate"
                ? "bg-purple-500/10 text-purple-700 border-2 border-purple-500/40"
                : "bg-muted/50 text-muted-foreground border-2 border-transparent"
            }`}
          >
            Corporate
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {mode === "family"
            ? "Family mode: commitment enforcement, gamified chores, parent/child roles, screen time management."
            : "Corporate mode: screen time breaks, focus nudges, productivity optimization, AI workflow suggestions."}
        </p>
      </div>

      {/* Autostart toggle */}
      <div className="rounded-xl border-2 border-border bg-card p-4 space-y-2">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
          Startup
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Digital Guardian starts automatically when you log in.
        </p>
      </div>

      {/* About */}
      <div className="rounded-xl border-2 border-border bg-card p-4 space-y-2">
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
          About
        </h3>
        <p className="text-sm text-muted-foreground">
          Digital Guardian Desktop v0.1.0 — Tauri v2 + React
        </p>
        <p className="text-[11px] text-muted-foreground">
          Enforcement via hosts-file blocking. Syncs commitments from the web app API.
        </p>
      </div>
    </div>
  );
}