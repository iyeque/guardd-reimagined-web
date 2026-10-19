import { useMemo } from "react";
import { Plus, Trash2, Globe, Clock, ShieldCheck, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CommitmentRules, RuleEntry, TimeWindow } from "@shared/schema";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"] as const;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** A handful of zones to start from, plus whatever the browser reports. */
const COMMON_TIMEZONES = [
  "Asia/Dubai",
  "Asia/Kolkata",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Australia/Sydney",
  "UTC",
];

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function emptyEntry(): RuleEntry {
  return {
    domains: [],
    windows: [{ days: [0, 1, 2, 3, 4], start: "21:00", end: "07:00" }],
    appliesTo: [],
    action: "block",
  };
}

function timezonesForDatalist(): string[] {
  return Array.from(new Set(COMMON_TIMEZONES).add(browserTimezone()));
}

/**
 * Which sites a rule covers. Rules authored before the scope control existed
 * carry no `scope`, so an empty domain list means blanket for those — the same
 * reading the extension's engine uses.
 */
type RuleScope = "specific" | "all" | "all-except";

function scopeOf(entry: RuleEntry): RuleScope {
  if (entry.scope) return entry.scope;
  if (entry.domains.length > 0) return "specific";
  return (entry.exceptDomains ?? []).length > 0 ? "all-except" : "all";
}

const SCOPES: ReadonlyArray<readonly [RuleScope, string]> = [
  ["specific", "Specific sites"],
  ["all", "All sites"],
  ["all-except", "All except…"],
];

type RuleEditorProps = {
  /** null means "no enforcement" — every commitment created before rules existed. */
  value: CommitmentRules | null;
  onChange: (next: CommitmentRules | null) => void;
  /** Parsed from the Members field so `appliesTo` can offer real names. */
  memberOptions: string[];
  disabled?: boolean;
};

/**
 * Authoring UI for a commitment's enforcement rules.
 *
 * Kept deliberately plain: the parent writes down what the family already
 * agreed, and this turns it into the structured shape the Commitment Extension
 * enforces. It never invents a rule — an incomplete entry is reported rather
 * than silently dropped.
 */
export const RuleEditor = ({
  value,
  onChange,
  memberOptions,
  disabled = false,
}: RuleEditorProps) => {
  const enabled = value !== null;
  const zones = useMemo(timezonesForDatalist, []);

  const rules: CommitmentRules = value ?? {
    timezone: browserTimezone(),
    entries: [emptyEntry()],
  };

  const setRules = (next: CommitmentRules) => onChange(next);

  const toggleEnabled = () => {
    if (enabled) onChange(null);
    else setRules(rules);
  };

  const updateEntry = (index: number, patch: Partial<RuleEntry>) => {
    setRules({
      ...rules,
      entries: rules.entries.map((e, i) => (i === index ? { ...e, ...patch } : e)),
    });
  };

  const addEntry = () =>
    setRules({ ...rules, entries: [...rules.entries, emptyEntry()] });

  const removeEntry = (index: number) =>
    setRules({ ...rules, entries: rules.entries.filter((_, i) => i !== index) });

  const updateWindow = (index: number, patch: Partial<TimeWindow>) => {
    setRules({
      ...rules,
      entries: rules.entries.map((e, i) =>
        i === index ? { ...e, windows: [{ ...e.windows[0], ...patch }] } : e,
      ),
    });
  };

  const toggleDay = (index: number, day: number) => {
    const entry = rules.entries[index];
    const days = entry.windows[0].days.includes(day)
      ? entry.windows[0].days.filter((d) => d !== day)
      : [...entry.windows[0].days, day].sort((a, b) => a - b);
    updateWindow(index, { days });
  };

  const toggleMember = (index: number, name: string) => {
    const entry = rules.entries[index];
    const appliesTo = entry.appliesTo.includes(name)
      ? entry.appliesTo.filter((m) => m !== name)
      : [...entry.appliesTo, name];
    updateEntry(index, { appliesTo });
  };

  const labelClass =
    "text-[10px] font-black uppercase tracking-widest text-muted-foreground";
  const fieldClass =
    "w-full h-11 rounded-xl border-2 focus:border-teal-500 bg-white/70 dark:bg-white/5 px-3 text-sm font-bold text-foreground";

  return (
    <div className="space-y-4">
      {/* Enforcement on/off */}
      <div className="flex items-start justify-between gap-4 rounded-2xl border-2 border-border bg-white/50 dark:bg-white/5 p-4">
        <div className="flex items-start gap-3">
          {enabled ? (
            <ShieldCheck className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
          ) : (
            <ShieldOff className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          )}
          <div>
            <div className="text-sm font-black text-foreground">
              Browser enforcement
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-1">
              {enabled
                ? "The family extension will block the sites below during the times you set, and show this agreement's text instead of a generic block page."
                : "Off — this commitment is a written agreement only. Nothing is blocked in the browser."}
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={toggleEnabled}
          disabled={disabled}
          variant="outline"
          className="shrink-0 rounded-xl text-xs font-black uppercase tracking-widest"
        >
          {enabled ? "Turn off" : "Turn on"}
        </Button>
      </div>

      {!enabled ? null : (
        <div className="space-y-5">
          {/* Timezone */}
          <div className="space-y-2">
            <label className={labelClass}>
              <Globe className="w-3 h-3 inline mr-1" />
              Timezone (when these times apply)
            </label>
            <input
              type="text"
              list="dg-timezone-list"
              value={rules.timezone}
              onChange={(e) => setRules({ ...rules, timezone: e.target.value })}
              disabled={disabled}
              placeholder="Asia/Dubai"
              className={fieldClass}
            />
            <datalist id="dg-timezone-list">
              {zones.map((z) => (
                <option key={z} value={z} />
              ))}
            </datalist>
            <p className="text-[11px] text-muted-foreground font-medium">
              Rules are evaluated in this zone, not the device's — so a child
              travelling abroad is still held to the family's clock.
            </p>
          </div>

          {/* Entries */}
          {rules.entries.map((entry, index) => {
            const win = entry.windows[0];
            const scope = scopeOf(entry);
            const domainsText = entry.domains.join(", ");
            const exceptText = (entry.exceptDomains ?? []).join(", ");
            const domainError =
              scope === "specific" && entry.domains.length === 0
                ? "Add at least one site, or switch to All sites."
                : null;
            const exceptError =
              scope === "all-except" && (entry.exceptDomains ?? []).length === 0
                ? "Name the sites to leave open, or switch to All sites."
                : null;
            const daysError = win.days.length === 0 ? "Pick at least one day." : null;

            return (
              <div
                key={index}
                className="rounded-2xl border-2 border-border bg-white/50 dark:bg-white/5 p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Rule {index + 1}
                  </div>
                  {rules.entries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEntry(index)}
                      disabled={disabled}
                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>

                {/* Scope: named sites, the whole web, or the whole web bar a few */}
                <div className="space-y-2">
                  <label className={labelClass}>
                    <Globe className="w-3 h-3 inline mr-1" />
                    What this rule covers
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SCOPES.map(([mode, text]) => {
                      const active = scope === mode;
                      return (
                        <button
                          key={mode}
                          type="button"
                          disabled={disabled}
                          onClick={() =>
                            updateEntry(
                              index,
                              mode === "specific"
                                ? { scope: "specific", exceptDomains: [] }
                                : mode === "all"
                                  ? { scope: "all", domains: [], exceptDomains: [] }
                                  : { scope: "all-except", domains: [] },
                            )
                          }
                          className={
                            "px-4 py-2 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-colors " +
                            (active
                              ? "bg-foreground border-foreground text-background"
                              : "bg-transparent border-border text-muted-foreground hover:border-foreground")
                          }
                        >
                          {text}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {scope === "all"
                      ? "Every site, during the window below — nothing to list."
                      : scope === "all-except"
                        ? "Every site except the ones you leave open below."
                        : "Only the sites you name below."}
                  </p>
                </div>

                {/* Domains — only when the rule names sites */}
                {scope === "specific" && (
                  <div className="space-y-2">
                    <label className={labelClass}>Sites to enforce (comma-separated)</label>
                    <input
                      type="text"
                      value={domainsText}
                      disabled={disabled}
                      placeholder="instagram.com, tiktok.com"
                      onChange={(e) =>
                        updateEntry(index, {
                          domains: e.target.value
                            .split(",")
                            .map((d) => d.trim().toLowerCase())
                            .filter(Boolean),
                        })
                      }
                      className={fieldClass}
                    />
                    {domainError && (
                      <p className="text-[11px] font-bold text-red-500">{domainError}</p>
                    )}
                  </div>
                )}

                {/* Exceptions — only for a rule that otherwise covers everything */}
                {scope === "all-except" && (
                  <div className="space-y-2">
                    <label className={labelClass}>Sites to leave open (comma-separated)</label>
                    <input
                      type="text"
                      value={exceptText}
                      disabled={disabled}
                      placeholder="school.example.edu, nhs.uk"
                      onChange={(e) =>
                        updateEntry(index, {
                          exceptDomains: e.target.value
                            .split(",")
                            .map((d) => d.trim().toLowerCase())
                            .filter(Boolean),
                        })
                      }
                      className={fieldClass}
                    />
                    {exceptError && (
                      <p className="text-[11px] font-bold text-red-500">{exceptError}</p>
                    )}
                  </div>
                )}

                {/* Window */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={labelClass}>
                      <Clock className="w-3 h-3 inline mr-1" />
                      From
                    </label>
                    <input
                      type="time"
                      value={win.start}
                      disabled={disabled}
                      onChange={(e) => updateWindow(index, { start: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Until</label>
                    <input
                      type="time"
                      value={win.end}
                      disabled={disabled}
                      onChange={(e) => updateWindow(index, { end: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium -mt-1">
                  A window that runs past midnight (e.g. 21:00 → 07:00) also covers
                  the early hours of the following day.
                </p>

                {/* Days */}
                <div className="space-y-2">
                  <label className={labelClass}>Days the window opens</label>
                  <div className="flex gap-2">
                    {DAY_LABELS.map((label, day) => {
                      const active = win.days.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleDay(index, day)}
                          title={DAY_NAMES[day]}
                          className={
                            "w-10 h-10 rounded-xl border-2 text-xs font-black transition-colors " +
                            (active
                              ? "bg-teal-500 border-teal-500 text-white"
                              : "bg-transparent border-border text-muted-foreground hover:border-teal-400")
                          }
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  {daysError && (
                    <p className="text-[11px] font-bold text-red-500">{daysError}</p>
                  )}
                </div>

                {/* Applies to */}
                <div className="space-y-2">
                  <label className={labelClass}>Applies to</label>
                  {memberOptions.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground font-medium">
                      Add names in the Members field above to scope a rule to
                      someone. Empty means the whole household.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {memberOptions.map((name) => {
                        const active = entry.appliesTo.includes(name);
                        return (
                          <button
                            key={name}
                            type="button"
                            disabled={disabled}
                            onClick={() => toggleMember(index, name)}
                            className={
                              "px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-colors " +
                              (active
                                ? "bg-foreground border-foreground text-background"
                                : "bg-transparent border-border text-muted-foreground hover:border-foreground")
                            }
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {entry.appliesTo.length === 0
                      ? "Everyone in the family."
                      : `Only ${entry.appliesTo.join(", ")}.`}
                  </p>
                </div>

                {/* Action */}
                <div className="space-y-2">
                  <label className={labelClass}>Action</label>
                  <div className="flex gap-2">
                    {(["block", "remind"] as const).map((action) => {
                      const active = entry.action === action;
                      return (
                        <button
                          key={action}
                          type="button"
                          disabled={disabled}
                          onClick={() => updateEntry(index, { action })}
                          className={
                            "px-4 py-2 rounded-xl border-2 text-xs font-black uppercase tracking-widest transition-colors " +
                            (active
                              ? "bg-foreground border-foreground text-background"
                              : "bg-transparent border-border text-muted-foreground hover:border-foreground")
                          }
                        >
                          {action}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">
                    Block stops the site. Remind shows the agreement text but lets
                    them continue.
                  </p>
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            onClick={addEntry}
            disabled={disabled}
            variant="outline"
            className="rounded-xl text-xs font-black uppercase tracking-widest"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add another rule
          </Button>
        </div>
      )}
    </div>
  );
};

