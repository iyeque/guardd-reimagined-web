import { Link } from "react-router-dom";
import { Cookie, ArrowLeft, Info, List, Shield, RefreshCw } from "lucide-react";

const CookiePolicy = () => {
  const cookies = [
    {
      name: "Local progress and preferences",
      type: "Essential",
      purpose:
        "Remember course progress, workshop state, and user preferences on your device.",
      duration: "As long as the stored data remains in your browser",
      category: "First-party",
    },
    {
      name: "Session and feature state",
      type: "Essential",
      purpose:
        "Support logged-in features, family features, and other active platform behavior.",
      duration: "For the duration of the session or feature use",
      category: "First-party",
    },
    {
      name: "Analytics and usage information",
      type: "Analytics",
      purpose:
        "Understand how the platform is used so we can improve it.",
      duration: "Varies by tool. If used, subject to consent where required.",
      category: "First-party / third-party depending on tool",
    },
    {
      name: "ReCAPTCHA",
      type: "Security",
      purpose:
        "Help prevent automated abuse on forms and protected actions.",
      duration: "Set by Google as part of reCAPTCHA",
      category: "Third-party",
    },
    {
      name: "Vercel Analytics",
      type: "Analytics",
      purpose:
        "Help us understand how the platform is used so we can improve it. Set by Vercel Analytics, a third-party analytics service.",
      duration: "Set by Vercel Analytics",
      category: "Third-party",
    },
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-4">
            <Cookie className="w-4 h-4" />
            Cookies & Tracking
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Cookie Policy</h1>
          <p className="text-white/60 text-lg">
            Last updated: March 2026
          </p>
        </div>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <Info className="w-6 h-6 text-[#4FD1C5]" />
            What This Policy Covers
          </h2>
          <p className="text-white/70 leading-relaxed">
            This policy explains how we use cookies, local storage, and similar technologies on the Digital
            Guardian Wellness platform.
          </p>
          <p className="text-white/70 leading-relaxed mt-4">
            “Cookies” is used as shorthand for small data files stored by your browser or device. This may
            include cookies, local storage, session storage, and similar tools.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <List className="w-6 h-6 text-[#4FD1C5]" />
            How We Use Cookies
          </h2>
          <p className="text-white/70 leading-relaxed">
            We use cookies and similar technologies to:
          </p>
          <ul className="space-y-2 text-white/70 mt-3 list-disc pl-5">
            <li>Keep the platform working as expected</li>
            <li>Remember your progress and preferences</li>
            <li>Support family and course features</li>
            <li>Protect against abuse where needed</li>
            <li>Analyze usage when appropriate and lawful</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Cookie Categories
          </h2>
          <div className="space-y-4">
            {cookies.map((cookie) => (
              <div key={cookie.name} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white mb-1">{cookie.name}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{cookie.purpose}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                      {cookie.type}
                    </span>
                    <p className="text-white/40 text-xs mt-1">{cookie.category}</p>
                  </div>
                </div>
                <p className="text-white/50 text-xs mt-3">
                  Duration: {cookie.duration}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Your Choices
          </h2>
          <p className="text-white/70 leading-relaxed">
            You can usually control cookies through your browser settings. You can also refuse or disable some
            cookies, but that may affect how the platform works for you.
          </p>
          <div className="mt-4 bg-white/5 rounded-2xl p-5 border border-white/10">
            <h3 className="font-semibold text-white mb-2">Good to know</h3>
            <ul className="space-y-2 text-white/70 text-sm list-disc pl-5">
              <li>Essential cookies may be needed for the platform to function.</li>
              <li>Analytics and advertising cookies may require consent in some places.</li>
              <li>Family and child features should use the most privacy-friendly settings available.</li>
            </ul>
          </div>
          <p className="text-white/60 mt-4 text-sm">
            If this platform ever adds a consent banner or cookie controls, those controls will guide you
            further.
          </p>
        </section>

        <section className="mb-10 border-l-2 border-[#4FD1C5]/40 pl-6">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#4FD1C5]" />
            Children & Cookies
          </h2>
          <p className="text-white/70 leading-relaxed">
            For child users and family use, we aim to rely on fewer cookies and to avoid unnecessary tracking.
            Where a cookie is not essential, we prefer to ask first or avoid it altogether.
          </p>
        </section>

        <div className="mt-16 pt-6 border-t border-white/10 text-center text-sm text-white/40">
          <Cookie className="w-4 h-4 inline mr-1" />
          Digital Guardian Wellness — Cookie Policy
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
