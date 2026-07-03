import { useState, useEffect, useMemo } from "react";
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
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Commitment = {
  id: number;
  familyId: string;
  title: string;
  terms: string;
  members: string;
  status: string;
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

const api = {
  list: async (familyId: string) => {
    const res = await fetch(`/api/family/commitments?familyId=${encodeURIComponent(familyId)}`);
    if (!res.ok) throw new Error("Failed to load commitments");
    return res.json() as Promise<Commitment[]>;
  },
  create: async (body: {
    familyId: string;
    title: string;
    terms: string;
    members: string;
  }) => {
    const res = await fetch("/api/family/commitments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to create commitment");
    return res.json() as Promise<Commitment>;
  },
  complete: async (id: number) => {
    const res = await fetch(`/api/family/commitments/${id}/complete`, { method: "POST" });
    if (!res.ok) throw new Error("Failed to complete commitment");
    return res.json() as Promise<Commitment>;
  },
  addMilestone: async (commitmentId: number, label: string, targetDate?: string) => {
    const res = await fetch(`/api/family/commitments/${commitmentId}/milestones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, targetDate }),
    });
    if (!res.ok) throw new Error("Failed to add milestone");
    return res.json() as Promise<Milestone>;
  },
  get: async (id: number) => {
    const res = await fetch(`/api/family/commitments/${id}`);
    if (!res.ok) throw new Error("Not found");
    return res.json() as Promise<{ item: Commitment; milestones: Milestone[] }>;
  },
};

const FamilyCommitments: React.FC = () => {
  const [familyId] = useState("default-family");
  const [items, setItems] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<{ item: Commitment; milestones: Milestone[] } | null>(null);
  const [title, setTitle] = useState("");
  const [terms, setTerms] = useState("");
  const [members, setMembers] = useState("");
  const [newMilestone, setNewMilestone] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.list(familyId);
      setItems(list);
    } catch (e) {
      toast.error("Could not load commitments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [familyId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !terms.trim() || !members.trim()) return toast.error("All fields are required.");
    setCreating(true);
    try {
      const created = await api.create({ familyId, title, terms, members });
      setTitle("");
      setTerms("");
      setMembers("");
      await load();
      toast.success("Commitment created.");
      setSelected({ item: created, milestones: [] });
    } catch {
      toast.error("Failed to create commitment.");
    } finally {
      setCreating(false);
    }
  };

  const complete = async (id: number) => {
    try {
      const updated = await api.complete(id);
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
      const ms = await api.addMilestone(selected.item.id, newMilestone.trim());
      setSelected((s) => s ? { ...s, milestones: [...s.milestones, ms] } : s);
      setNewMilestone("");
      toast.success("Milestone added.");
    } catch {
      toast.error("Could not add milestone.");
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
                          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ledger</div>
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
              ORCA-Style Ledger
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter">
              Family <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-rose-400 to-purple-500">Commitments</span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
              Create, track, and complete family agreements. Backed by an auditable ledger reference and optional IPFS metadata.
            </p>
          </motion.header>

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
              <Button onClick={() => setSelected(null)} variant="ghost" className="text-xs font-black uppercase tracking-widest">
                Refresh
              </Button>
            </div>
            {loading && <div className="text-sm text-muted-foreground font-medium">Loading...</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map((it) => (
                <Card
                  key={it.id}
                  className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-[2rem] p-6 hover:border-teal-500/40 transition-colors cursor-pointer group"
                  onClick={() => setSelected({ item: it, milestones: [] })}
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
