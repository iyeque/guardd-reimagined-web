"use client";

import { useEffect } from "react";
import { Info, Cookie, Check, X } from "lucide-react";

type ConsentChoice = "accept" | "reject" | null;

const CookieConsentBanner = () => {
  const storedChoice = typeof window !== "undefined" ? localStorage.getItem("dg_cookie_consent") : null;

  useEffect(() => {
    if (storedChoice) {
      const analyticsEnabled = storedChoice === "accept";
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__DG_ANALYTICS_ENABLED = analyticsEnabled;
      }
    }
  }, [storedChoice]);

  // Already made a choice; nothing to show
  if (storedChoice) {
    return null;
  }

  const handleChoice = (choice: ConsentChoice) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dg_cookie_consent", choice);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__DG_ANALYTICS_ENABLED = choice === "accept";
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-[60] mx-auto max-w-3xl px-4">
      <div className="rounded-2xl bg-white/10 border border-white/10 bg-opacity-80 backdrop-blur-xl p-5 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="bg-[#4FD1C5]/20 rounded-xl p-3 flex-shrink-0">
            <Cookie className="w-6 h-6 text-[#4FD1C5]" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold mb-1">
              We use cookies to improve the platform
            </h3>
            <p className="text-white/70 text-sm leading-relaxed mb-3">
              This site uses essential cookies to save your progress and preferences.
              <br />
              We also use{" "}
              <a href="/cookie-policy" className="text-[#4FD1C5] underline underline-offset-2 hover:text-white transition-colors">
                Vercel Analytics
              </a>{" "}
              to understand how the platform is used so we can improve it.
              <br />
              You can accept or reject non-essential analytics cookies below.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => handleChoice("accept")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4FD1C5] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Check className="w-4 h-4" />
                Accept analytics
              </button>

              <button
                onClick={() => handleChoice("reject")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium border border-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
                Reject analytics
              </button>

              <a
                href="/privacy"
                className="text-white/60 text-sm hover:text-white transition-colors ml-auto"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsentBanner;
