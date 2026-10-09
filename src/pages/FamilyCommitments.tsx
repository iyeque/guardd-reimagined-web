import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  Plus,
  ChevronRight,
  CheckCircle2,
  Clock,
  Users,
  Hash,
  Globe,
  FileText,
  Trash2,
  Target,
  ArrowLeft,
  Loader2,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useProfile, useProfileId } from "@/context/ProfileContext";
import { updateProfile } from "@/lib/profiles";
import type { CommitmentRules } from "@shared/schema";
import { RuleEditor } from "@/components/commitments/RuleEditor";
import { parseMemberOptions } from "@/lib/commitment-members";

type Commitment = {
  id: number;
  familyId: string;
  title: string;
  terms: string;
  members: string;
  status: string;
  rules: CommitmentRules | null;
  ledgerHash: string | null;
  metadataCid: string | null;
  startedAt: string | Date;
  completedAt: string | Date | null;
};

type Milestone = {
  id: number;
  commitmentId: number;
  label: string;
  targetDate?: string;
  completedAt?: string | Date | null;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const authHeaders = (token?: string): Record<string, string> =>
  token ? { Authorization: `Bearer ${token}` } : {};

/**
 * Manages the family's access token: shows it so it can be copied somewhere
 * safe, accepts a pasted one on recovery, and rotates it.
 *
 * Deliberately blunt about the stakes — losing this token locks the family out
 * of their own commitments, and the only recovery is an admin reissue.
 */
const FamilyAccessPanel = ({
  accessToken,
  needsToken,
  tokenDraft,
  onTokenDraftChange,
  onSaveToken,
  onPair,
  pairing,
  pairedToken,
}: {
  accessToken: string;
  needsToken: boolean;
  tokenDraft: string;
  onTokenDraftChange: (v: string) => void;
  onSaveToken: (e: React.FormEvent) => void;
  onPair: () => void;
  pairing: boolean;
  pairedToken: string | null;
}) => {
  const [revealed, setRevealed] = useState(false);
  const labelClass =
    "text-[10px] font-black uppercase tracking-widest text-muted-foreground";
  const fieldClass =
    "w-full h-11 rounded-xl border-2 focus:border-teal-500 bg-white/70 dark:bg-white/5 px-3 text-sm font-bold text-foreground";

  return (
    <div className="space-y-3 pt-2 border-t-2 border-border/60">
      <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        Family access token
      </div>

      {needsToken && (
        <p className="text-xs font-bold text-red-500">
          This device has no valid token for this family, so commitments cannot
          be loaded. Paste one below, or ask an administrator to reissue it.
        </p>
      )}

      {accessToken ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-xl border-2 border-border bg-white/70 dark:bg-white/5 px-3 py-2.5 text-xs font-mono text-foreground">
              {revealed ? accessToken : "•".repeat(Math.min(accessToken.length, 32))}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRevealed((r) => !r)}
              className="shrink-0 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              {revealed ? "Hide" : "Reveal"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigator.clipboard?.writeText(accessToken);
                toast.success("Token copied.");
              }}
              className="shrink-0 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Copy
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
            This is the key for this device. Keep it somewhere safe — clearing
            browser data loses it, and only an administrator can reissue one.
          </p>
        </div>
      ) : null}

      {/* Recovery is deliberately collapsed and secondary. A family whose
          single-device setup is working should never have to look at this. */}
      <details className="rounded-xl border-2 border-border bg-white/50 dark:bg-white/5">
        <summary className="cursor-pointer px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Recover or pair a device
        </summary>
        <div className="space-y-3 border-t-2 border-border/60 p-3">
          {accessToken ? (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                To let another laptop or phone see these commitments, pair it
                here and copy the new key across. Each device gets its own key,
                so one can be revoked without locking out the others.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={onPair}
                disabled={pairing}
                className="rounded-xl text-xs font-black uppercase tracking-widest"
              >
                {pairing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Pair another device"}
              </Button>
              {pairedToken && (
                <div className="space-y-1">
                  <code className="block truncate rounded-xl border-2 border-teal-500/40 bg-teal-500/5 px-3 py-2.5 text-xs font-mono text-foreground">
                    {pairedToken}
                  </code>
                  <p className="text-[11px] font-bold text-teal-700 dark:text-teal-300">
                    Shown once — copy it onto the other device now.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={onSaveToken} className="space-y-2">
              <label className={labelClass}>Paste a family access key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tokenDraft}
                  onChange={(e) => onTokenDraftChange(e.target.value)}
                  placeholder="Paste the key you were given"
                  className={fieldClass}
                />
                <Button
                  type="submit"
                  variant="outline"
                  className="shrink-0 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Save
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                The first commitment you create for a family generates its key
                and saves it automatically.
              </p>
            </form>
          )}
        </div>
      </details>
    </div>
  );
};

const api = {
  list: async (familyId: string, token?: string) => {
    const res = await fetch(`/api/family/commitments?familyId=${encodeURIComponent(familyId)}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to load commitments");
    return res.json() as Promise<Commitment[]>;
  },
  create: async (body: {
    familyId: string;
    title: string;
    terms: string;
    members: string;
    rules?: CommitmentRules | null;
    token?: string;
  }) => {
    const res = await fetch("/api/family/commitments", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(body.token) },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to create commitment");
    // The minted token rides along exactly once — capture it before the type
    // assertion narrows it away.
    const json = (await res.json()) as Commitment & { familyAccessToken?: string };
    return json;
  },
  complete: async (id: number, token?: string) => {
    const res = await fetch(`/api/family/commitments/${id}/complete`, {
      method: "POST",
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to complete commitment");
    return res.json() as Promise<Commitment>;
  },
  addMilestone: async (commitmentId: number, label: string, targetDate?: string, token?: string) => {
    const res = await fetch(`/api/family/commitments/${commitmentId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ label, targetDate }),
    });
    if (!res.ok) throw new Error("Failed to add milestone");
    return res.json() as Promise<Milestone>;
  },
  get: async (id: number, token?: string) => {
    const res = await fetch(`/api/family/commitments/${id}`, { headers: authHeaders(token) });
    if (!res.ok) throw new Error("Not found");
    return res.json() as Promise<{ item: Commitment; milestones: Milestone[] }>;
  },
  pair: async (familyId: string, token: string) => {
    const res = await fetch("/api/family/access/pair", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ familyId, label: "Paired device" }),
    });
    if (!res.ok) throw new Error("Failed to pair device");
    return res.json() as Promise<{ familyId: string; token: string; label: string | null; createdAt: string }>;
  },
  devices: async (familyId: string, token: string) => {
    const res = await fetch(`/api/family/access/devices?familyId=${encodeURIComponent(familyId)}`, {
      headers: authHeaders(token),
    });
    if (!res.ok) throw new Error("Failed to list devices");
    return res.json() as Promise<Array<{ label: string; createdAt: string; lastUsedAt: string | null; current: boolean }>>;
  },
};

const FamilyCommitments: React.FC = () => {
  const { currentProfile } = useProfile();
  const profileId = useProfileId();
  const familyId = currentProfile?.familyId ?? "default-family";
  const [items, setItems] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<{ item: Commitment; milestones: Milestone[] } | null>(null);
  const [title, setTitle] = useState("");
  const [terms, setTerms] = useState("");
  const [members, setMembers] = useState("");
  const [newMilestone, setNewMilestone] = useState("");
  const [rules, setRules] = useState<CommitmentRules | null>(null);
  // Credential for the family's commitments. Lives in the profile next to
  // familyId; a 401 on load means it is missing or stale.
  const accessToken = currentProfile?.familyAccessToken ?? "";
  const [tokenDraft, setTokenDraft] = useState("");
  const [needsToken, setNeedsToken] = useState(false);
  const [pairing, setPairing] = useState(false);
  const [pairedToken, setPairedToken] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.list(familyId, accessToken);
      setItems(list);
      setNeedsToken(false);
    } catch {
      // Distinguish "no token / wrong token" from a real outage so the panel
      // offers recovery instead of a bare error.
      setNeedsToken(true);
      toast.error("Could not load commitments — check your family access token.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [familyId, accessToken]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !terms.trim() || !members.trim()) return toast.error("All fields are required.");
    // Same invariants the API enforces, checked here so the parent gets an
    // inline message instead of a 400 with a zod path.
    if (rules) {
      const noDomains = rules.entries.some((entry) => entry.domains.length === 0);
      if (noDomains) return toast.error("Every enforcement rule needs at least one site.");
      const noDays = rules.entries.some((entry) => entry.windows.some((w) => w.days.length === 0));
      if (noDays) return toast.error("Every enforcement rule needs at least one day.");
      if (!rules.timezone.trim()) return toast.error("Pick a timezone for the enforcement rules.");
    }
    setCreating(true);
    try {
      const created = await api.create({ familyId, title, terms, members, rules, token: accessToken || undefined });
      setTitle("");
      setTerms("");
      setMembers("");
      setRules(null);
      // First-ever create for a family mints its token; persist it now or the
      // family is locked out of its own data on the next load.
      if (created.familyAccessToken && profileId) {
        updateProfile(profileId, { familyAccessToken: created.familyAccessToken });
        toast.success("Commitment created — your family access token was saved.");
      } else {
        toast.success("Commitment created.");
      }
      await load();
      setSelected({ item: created, milestones: [] });
    } catch {
      toast.error("Failed to create commitment.");
    } finally {
      setCreating(false);
    }
  };

  const saveToken = (e: React.FormEvent) => {
    e.preventDefault();
    const token = tokenDraft.trim();
    if (!token) return toast.error("Paste your family access token.");
    if (!profileId) return toast.error("No active profile.");
    updateProfile(profileId, { familyAccessToken: token });
    setTokenDraft("");
    toast.success("Family access token saved.");
  };

  const pairDevice = async () => {
    if (!accessToken) return;
    setPairing(true);
    try {
      const res = await api.pair(familyId, accessToken);
      setPairedToken(res.token);
      toast.success("New device key created — copy it now.");
    } catch {
      toast.error("Could not create a device key.");
    } finally {
      setPairing(false);
    }
  };

  const complete = async (id: number) => {
    try {
      const updated = await api.complete(id, accessToken || undefined);
      setItems((p) => p.map((x) => (x.id === id ? updated : x)));
      if (selected?.item.id === id) setSelected({ ...selected, item: updated });
      toast.success("Commitment completed.");
    } catch {
      toast.error("Could not complete commitment.");
    }
  };

  const addMilestone = async () => {
    if (!selected || !newMilestone.trim()) return;
    try {
      const ms = await api.addMilestone(selected.item.id, newMilestone.trim(), undefined, accessToken || undefined);
      setSelected((s) => (s ? { ...s, milestones: [...s.milestones, ms] } : s));
      setNewMilestone("");
      toast.success("Milestone added.");
    } catch {
      toast.error("Could not add milestone.");
    }
  };

  const openCommitment = async (id: number) => {
    try {
      const detail = await api.get(id, accessToken || undefined);
      setSelected(detail);
    } catch {
      toast.error("Could not load commitment details.");
    }
  };

  const statusBadge = (status: string) => {
    const base =
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border";
    if (status === "completed") return `${base} bg-emerald-500/10 text-emerald-600 border-emerald-500/20`;
    return `${base} bg-amber-500/10 text-amber-600 border-amber-500/20`;
  };

  const fmtDate = (d: string | Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

  if (selected) {
    return (
      <div className="min-h-screen bg-transparent">
        <div className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <button
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to commitments
            </button>

            <Card className="bg-white/70 dark:bg-black/50 backdrop-blur-xl border-border rounded-[2rem] shadow-2xl">
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-teal-600" />
                      <h1 className="text-3xl md:text-5xl font-black text-foreground tracking-tighter">
                        {selected.item.title}
                      </h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={statusBadge(selected.item.status)}>
                        {selected.item.status === "completed" ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        {selected.item.status}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <Users className="w-3.5 h-3.5" />
                        {selected.item.members}
                      </span>
                    </div>
                    {selected.item.rules ? (
                      <div className="mt-4 rounded-2xl border-2 border-teal-500/30 bg-teal-500/5 p-4 space-y-2">
                        <div className="text-[10px] font-black uppercase tracking-widest text-teal-700 dark:text-teal-300">
                          Enforced in the browser
                        </div>
                        <ul className="space-y-1.5">
                          {selected.item.rules.entries.map((entry, i) => {
                            const win = entry.windows[0];
                            const days = win
                              ? [0, 1, 2, 3, 4, 5, 6]
                                  .filter((d) => win.days.includes(d))
                                  .map((d) => DAY_NAMES[d])
                                  .join(" ")
                              : "—";
                            return (
                              <li
                                key={i}
                                className="text-xs font-bold text-foreground/90 leading-relaxed"
                              >
                                {entry.action === "block" ? "Block" : "Remind"}{" "}
                                {entry.domains.join(", ")}
                                {win ? ` · ${win.start}–${win.end} · ${days}` : ""}
                                {entry.appliesTo.length > 0
                                  ? ` · only ${entry.appliesTo.join(", ")}`
                                  : " · everyone"}
                              </li>
                            );
                          })}
                        </ul>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          Times are in {selected.item.rules.timezone}.
                        </p>
                      </div>
                    ) : (
                      <p className="mt-4 text-[11px] text-muted-foreground font-medium">
                        No browser enforcement — this is a written agreement only.
                      </p>
                    )}
                  </div>
                  {selected.item.status !== "completed" && (
                    <Button
                      onClick={() => complete(selected.item.id)}
                      className="self-start bg-foreground text-background font-black rounded-2xl"
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>

                <div className="mt-10 space-y-3">
                  <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Agreement Terms</div>
                  <p className="text-foreground/90 font-medium leading-relaxed whitespace-pre-wrap">{selected.item.terms}</p>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selected.item.ledgerHash && (
                    <Card className="bg-white/50 dark:bg-white/5 border-border rounded-2xl">
                      <CardContent className="p-5 flex items-start gap-4">
                        <Hash className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ledger Hash (SHA-256)</div>
                          <div className="text-xs font-mono text-foreground break-all">{selected.item.ledgerHash}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  {selected.item.metadataCid && (
                    <Card className="bg-white/50 dark:bg-white/5 border-border rounded-2xl">
                      <CardContent className="p-5 flex items-start gap-4">
                        <Globe className="w-5 h-5 text-teal-600 mt-0.5" />
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Metadata CID</div>
                          <div className="text-xs font-mono text-foreground break-all">{selected.item.metadataCid}</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="mt-10 space-y-4">
                  <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Milestones</div>
                  <div className="space-y-3">
                    {selected.milestones.length === 0 && !selected.item.status && (
                      <div className="text-sm text-muted-foreground font-medium">No milestones yet. Add your first milestone below.</div>
                    )}
                    {selected.milestones.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 p-4 bg-white/40 dark:bg-white/5 rounded-2xl border border-border">
                        <Target className="w-4 h-4 text-teal-600" />
                        <span className="font-bold text-foreground flex-1">{m.label}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {m.completedAt ? `completed ${fmtDate(m.completedAt)}` : `target: ${fmtDate(m.targetDate)}`}
                        </span>
                        {!m.completedAt && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              const updated = await api.complete(selected.item.id);
                              setSelected((s) => s ? { ...s, item: updated } : s);
                              toast.success("Milestone completed.");
                            }}
                            className="text-emerald-600"
                          >
                            Done
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Input
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      placeholder="Add a milestone..."
                      className="h-12 rounded-2xl border-2 focus:border-teal-500"
                    />
                    <Button onClick={addMilestone} className="h-12 px-6 bg-foreground text-background font-black rounded-2xl">
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-5xl mx-auto space-y-12">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-700 border border-teal-500/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Shield className="w-4 h-4" />
              Auditable Family Agreements
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">
              Family <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-rose-400 to-purple-500">Commitments</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
              Create, track, and complete family agreements. Every commitment is recorded on an auditable ledger with optional IPFS metadata pinning.
            </p>
          </motion.header>

          {/* How It Works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-2xl p-5">
              <CardContent className="p-0 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <Hash className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-black text-foreground text-sm">1. Database Record</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every commitment is stored in Neon Postgres with a unique ID, family reference, and immutable timestamp. This is the authoritative source of truth.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-2xl p-5">
              <CardContent className="p-0 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-black text-foreground text-sm">2. Ledger Hash</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A SHA-256 hash is computed from the commitment data (family ID, title, terms, timestamp). This creates a tamper-evident fingerprint that can be independently verified.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-2xl p-5">
              <CardContent className="p-0 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-rose-600" />
                </div>
                <h3 className="font-black text-foreground text-sm">3. IPFS Metadata</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When Pinata is configured, commitment metadata is pinned to IPFS as a JSON document. The CID (content identifier) is stored on the commitment for decentralized retrieval.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Roadmap */}
          <Card className="bg-gradient-to-br from-teal-500/5 to-purple-500/5 backdrop-blur-xl border border-border rounded-2xl p-6 md:p-8">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-foreground text-lg">The Roadmap: Beyond the Platform</h3>
                  <p className="text-xs text-muted-foreground">How commitments gain real-world teeth</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-teal-600">School Oversight</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Teachers and administrators get a read-only dashboard showing student/family commitments relevant to digital citizenship classes. Schools can verify completion without seeing private terms.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-purple-600">Parent Oversight</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A companion mobile app sends push notifications when milestones approach deadlines. Parents can co-sign commitments and receive weekly progress digests.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-rose-600">Compliance Verification</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Regulators receive anonymized, aggregated proof that the platform is being used effectively (e.g., "1,247 families in District X have active commitments"). Zero-knowledge proofs verify compliance without exposing individual family data. Full records accessible only with legal authorization.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-amber-600">Cross-Platform Enforcement</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Browser extensions enforce commitments at the network level (e.g., block sites during agreed hours). Smart home integrations (HomeKit, Google Home) can pause devices when screen-time limits are reached.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-black/50 backdrop-blur-xl border-border rounded-[2rem] shadow-2xl">
            <CardContent className="p-8 md:p-10">
              <form onSubmit={submit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Commitment Title</label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Weekend Screen-Time Agreement" className="h-14 rounded-2xl border-2 focus:border-teal-500 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Members (comma-separated)</label>
                    <Input value={members} onChange={(e) => setMembers(e.target.value)} placeholder="Mom, Dad, Alex, Jordan" className="h-14 rounded-2xl border-2 focus:border-teal-500 font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Terms</label>
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="State the clear agreement rules and expectations..."
                    className="w-full min-h-[120px] rounded-2xl border-2 focus:border-teal-500 bg-white/70 dark:bg-white/5 p-4 font-bold text-foreground placeholder:font-normal"
                  />
                </div>
                <div className="space-y-3 pt-2 border-t-2 border-border/60">
                  <RuleEditor
                    value={rules}
                    onChange={setRules}
                    memberOptions={parseMemberOptions(members)}
                    disabled={creating}
                  />
                </div>
                <FamilyAccessPanel
                  accessToken={accessToken}
                  needsToken={needsToken}
                  tokenDraft={tokenDraft}
                  onTokenDraftChange={setTokenDraft}
                  onSaveToken={saveToken}
                  onPair={pairDevice}
                  pairing={pairing}
                  pairedToken={pairedToken}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={creating} className="h-14 px-10 bg-foreground text-background font-black rounded-2xl">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Create Commitment</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-foreground tracking-tighter">Current Commitments</h2>
              <Button onClick={load} variant="ghost" className="text-xs font-black uppercase tracking-widest">
                Refresh
              </Button>
            </div>
            {loading && <div className="text-sm text-muted-foreground font-medium">Loading...</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map((it) => (
                <Card
                  key={it.id}
                  className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-[2rem] p-6 hover:border-teal-500/40 transition-colors cursor-pointer group"
                  onClick={() => openCommitment(it.id)}
                >
                  <CardContent className="p-0 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-teal-600" />
                        </div>
                        <h3 className="font-black text-foreground tracking-tight leading-tight">{it.title}</h3>
                      </div>
                      <span className={statusBadge(it.status)}>{it.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium line-clamp-2">{it.terms}</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <Users className="w-3.5 h-3.5" /> {it.members}
                      </span>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!loading && items.length === 0 && (
                <div className="text-sm text-muted-foreground font-medium">No commitments yet. Create your first above.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyCommitments;
