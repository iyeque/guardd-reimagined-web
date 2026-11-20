import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Monitor, ShieldCheck, Lock, ArrowLeft, Check, Loader2, Globe, Clock, KeyRound, Apple,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Platform = "windows" | "macos" | "both";

const PLATFORMS: { value: Platform; label: string; hint: string }[] = [
  { value: "windows", label: "Windows alpha", hint: "Available to early access" },
  { value: "macos", label: "macOS", hint: "In development" },
  { value: "both", label: "Both", hint: "Keep me posted on each" },
];

// reCAPTCHA v3 is loaded site-wide; read it without re-declaring the global
// (Contact.tsx / CommunitySupport.tsx already augment Window). Degrade gracefully
// when it or the site key is absent — the server only verifies when configured.
function getRecaptcha(): { execute: (k: string, o: { action: string }) => Promise<string> } | undefined {
  return (window as unknown as {
    grecaptcha?: { execute: (k: string, o: { action: string }) => Promise<string> };
  }).grecaptcha;
}

const DesktopEarlyAccess = () => {
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState<Platform>("both");
  const [submitting, setSubmitting] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      let token: string | undefined;
      const g = getRecaptcha();
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
      if (g?.execute && siteKey) {
        try { token = await g.execute(siteKey, { action: "submit" }); } catch { /* submit without */ }
      }
      const res = await fetch("/api/desktop-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          platform,
          ...(token ? { "g-recaptcha-response": token } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not join the waitlist right now.");
        return;
      }
      setJoined(true);
      toast.success("You're on the list!", {
        description: "We'll email you when your early-access invite is ready.",
      });
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-4xl mx-auto space-y-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Monitor className="w-4 h-4" /> Early access
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter">
              Digital Guardian{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-rose-400 to-purple-500">
                Desktop
              </span>
            </h1>
            <p className="text-muted-foreground font-medium max-w-2xl mx-auto text-lg">
              The privacy-first way to enforce your family's commitments — at the
              operating-system level, not inside the browser.
            </p>
          </motion.header>

          {/* Privacy-first comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="bg-teal-500/5 dark:bg-teal-500/10 backdrop-blur-xl border-2 border-teal-500/50 rounded-[2rem] p-6">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/15 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-teal-600" />
                  </div>
                  <h2 className="font-black text-foreground tracking-tight">Desktop app</h2>
                  <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-teal-700 dark:text-teal-300 bg-teal-500/15 px-2.5 py-1 rounded-full">
                    Most private
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" /> Blocks via the OS hosts file during agreed hours</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" /> No browser extension, no browser-wide permission</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" /> Never reads the pages you visit</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" /> Redemption lifts the block instantly</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-[2rem] p-6">
              <CardContent className="p-0 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="font-black text-foreground tracking-tight">Browser extension</h2>
                  <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-white/60 dark:bg-white/10 px-2.5 py-1 rounded-full">
                    Optional layer
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground font-medium">
                  <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" /> Enforces inside the browser, per site</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" /> Needs permission over the sites you visit</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" /> Reads only the domain name, never content</li>
                  <li className="flex gap-2"><Check className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" /> Great as a companion to the desktop app</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Waitlist form */}
          <Card className="bg-white/70 dark:bg-black/50 backdrop-blur-xl border-border rounded-[2rem] shadow-2xl">
            <CardContent className="p-8 md:p-10 space-y-6">
              {joined ? (
                <div className="text-center space-y-4 py-6">
                  <div className="w-16 h-16 rounded-full bg-teal-500/15 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-8 h-8 text-teal-600" />
                  </div>
                  <h2 className="text-2xl font-black text-foreground tracking-tighter">You're on the list</h2>
                  <p className="text-muted-foreground font-medium max-w-md mx-auto">
                    We'll email <span className="font-bold text-foreground">{email}</span> when your
                    early-access invite is ready, with a guided setup for the {platform === "macos" ? "macOS build" : platform === "windows" ? "Windows alpha" : "Windows alpha and macOS"}.
                  </p>
                  <Link to="/family-commitments" className="inline-flex items-center gap-2 text-sm font-black text-teal-600 underline">
                    meanwhile, set up your family commitments
                  </Link>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tighter">Join the early-access waitlist</h2>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      Be invited to the alpha and guided through setup. No spam — just your invite.
                    </p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label htmlFor="wl-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Email
                      </label>
                      <Input
                        id="wl-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@family.com"
                        className="h-14 rounded-2xl border-2 focus:border-teal-500 font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Which platform?
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {PLATFORMS.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setPlatform(p.value)}
                            aria-pressed={platform === p.value}
                            className={
                              platform === p.value
                                ? "px-4 h-12 rounded-2xl bg-foreground text-background text-xs font-black uppercase tracking-widest"
                                : "px-4 h-12 rounded-2xl border-2 border-border bg-white/60 dark:bg-white/5 text-xs font-black uppercase tracking-widest text-muted-foreground hover:border-teal-500/50"
                            }
                          >
                            {p.value === "macos" ? <Apple className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" /> : null}
                            {p.label}
                            <span className="block text-[8px] font-bold opacity-60 normal-case tracking-normal">{p.hint}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {error && <p className="text-sm font-bold text-rose-500">{error}</p>}
                    <Button
                      type="submit"
                      disabled={submitting}
                      className="h-14 w-full sm:w-auto px-10 bg-foreground text-background font-black rounded-2xl"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Join the waitlist</>}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>

          {/* Honest status + how it works */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-2xl p-6">
              <CardContent className="p-0 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-black text-foreground">Where it stands</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  A Windows alpha is available to early-access members; macOS is in development. The
                  alpha isn't code-signed yet, so your OS may show a security prompt the first time you
                  run it — we'll walk you through it.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-border rounded-2xl p-6">
              <CardContent className="p-0 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-black text-foreground">How it works</h3>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Pair it with your family access key, pick a member, and it enforces your commitments
                  during the agreed hours. Redeeming extra screen time lifts the block right away.
                </p>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-xs text-muted-foreground font-medium">
            Prefer the browser layer?{" "}
            <Link to="/family-commitments" className="font-black text-teal-600 underline">
              Get the free extension
            </Link>{" "}
            — and read how we handle data in our{" "}
            <Link to="/privacy-policy" className="font-black text-teal-600 underline">
              privacy policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DesktopEarlyAccess;