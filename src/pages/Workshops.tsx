import { motion, AnimatePresence } from "framer-motion"
import { useState, useMemo, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { STORAGE_KEY, resumeOnboardingTour } from "@/lib/onboarding";
import { workshops } from "@/data/workshops";
import { WorkshopCard } from "@/components/workshops/WorkshopCard";
import { useWorkshopProgress } from "@/hooks/useWorkshopProgress";
import { useProfileId } from "@/context/ProfileContext";

export const Workshops = () => {
  const navigate = useNavigate();
  const profileId = useProfileId();
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const { rawProgress } = useWorkshopProgress(profileId ?? undefined);
  const workshopGridRef = useRef<HTMLDivElement>(null);

  const tags = useMemo(() => {
    const all = new Set<string>();
    workshops.forEach((w) => {
      all.add(w.ageGroup);
      all.add(w.duration);
    });
    return Array.from(all);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workshops.filter((w) => {
      const matchesQuery =
        !q ||
        [w.title, w.subtitle, w.description, w.icon].some((v) =>
          String(v).toLowerCase().includes(q)
        );
      const matchesTag = !activeTag || w.ageGroup === activeTag || w.duration === activeTag;
      return matchesQuery && matchesTag;
    });
  }, [query, activeTag]);

  const completedCount = workshops.filter((w) => {
    return rawProgress[w.id] && Object.values(rawProgress[w.id]).filter(Boolean).length >= w.modules.length;
  }).length;
  const nextWorkshop = workshops.find((w) => {
    return !rawProgress[w.id] || Object.values(rawProgress[w.id]).filter(Boolean).length < w.modules.length;
  });
  const hasProgress = Object.keys(rawProgress).length > 0

  const [showReplay, setShowReplay] = useState(false)
  useEffect(() => {
    try {
      setShowReplay(localStorage.getItem(STORAGE_KEY) === "true")
    } catch {
      // localStorage disabled (private browsing) — default to false, tour replay hidden
    }
  }, [])

  useEffect(() => {
    try {
      const pending = localStorage.getItem('dg_onboarding_pending_step')
      if (pending === '6') {
        localStorage.removeItem('dg_onboarding_pending_step')
        resumeOnboardingTour(6)
      }
    } catch {
      // localStorage disabled — skip pending-step resume, no crash
    }
  }, [])

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const TESTIMONIALS = [
    {
      name: "The Wigman Family",
      avatar: "W",
      quote: "The Social Media workshop changed how we talk about posting. Our teen actually led the family posting agreement discussion — something we'd been putting off for months.",
      detail: "Completed: Social Media Safety + Screen Time Balance",
    },
    {
      name: "Alex & Family",
      avatar: "A",
      quote: "We did the Privacy Settings workshop together and found 3 apps neither of us realized were tracking location. The step-by-step checklist made it actually doable instead of overwhelming.",
      detail: "Completed: Privacy & Security Basics",
    },
    {
      name: "The Johnsons",
      avatar: "J",
      quote: "Our youngest went from resisting screen time limits to asking for a family media plan. The eye break reminders turned into a whole family habit — even the dog gets a 'break' now.",
      detail: "Completed: Screen Time & Family Agreements",
    },
    {
      name: "Priya & Amit",
      avatar: "P",
      quote: "The Cyber Safety quiz had our 8-year-old teaching us about phishing links. We've since set up a family 'safe word' for suspicious messages — she came up with it.",
      detail: "Completed: Cybersecurity Quiz + Family Agreements",
    },
    {
      name: "The Marcus Family",
      avatar: "M",
      quote: "Three kids, three different age groups. The workshops let us tailor conversations — our teen did the teen track while the younger two did the kids track, and we all met in the middle for the family agreement.",
      detail: "Completed: 3 workshops across age groups",
    },
    {
      name: "The Cassidys",
      avatar: "C",
      quote: "We thought digital safety was something we'd get to 'someday.' The 20-minute modules fit between dinner and bedtime, and suddenly we'd done 6 workshops without anyone feeling lectured.",
      detail: "Completed: Screen Time, Privacy, and Wellness modules",
    },
  ];
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4FD1C5]/10 text-[#2C7A7B] text-sm font-medium mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <span>🎓</span>
            <span>Flagship Course + Workshops</span>
          </motion.div>

          <h1 data-tour="workshops-heading" className="text-4xl md:text-6xl font-bold mb-4 text-slate-800 dark:text-white">
            Family <span className="gradient-text">Workshops</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Learn together through interactive activities, quizzes, and collaborative exercises designed for the whole family.
          </p>

          {showReplay && (
            <button
              onClick={() => resumeOnboardingTour(6)}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36M10 17l4.64-4.36" />
              </svg>
              Replay tour (steps 6–7)
            </button>
          )}

          <motion.div
            className="p-6 rounded-3xl bg-gradient-to-r from-[#4FD1C5]/10 to-[#FF9A8B]/10 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-slate-800 dark:text-white">
              Digital Guardian Wellness Initiative
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4 max-w-2xl mx-auto">
              Our flagship 1-hour course. Go from awareness to digital mastery with guided lessons, hands-on action pauses, and two assessments.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                data-tour="workshops-course-cta"
                onClick={() => navigate("/course")}
                className="px-6 py-3 rounded-full bg-[#4FD1C5] text-white font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Start Full Course
              </button>
              <button
                onClick={() => {
                  setQuery("");
                  setActiveTag(null);
                  workshopGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300"
              >
                Browse Individual Topics
              </button>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mb-10 p-6 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">
                Trusted by families
              </h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                100s
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Families exploring Guardd workshops together.
              </p>
            </div>
            <div className="md:col-span-2">
              {/* Rotating testimonials carousel */}
              <div className="relative">
                <div className="overflow-hidden">
                  <div
                    className="grid gap-4 transition-all duration-500"
                    style={{ transform: `translateY(-${activeTestimonial * 100}%)` }}
                  >
                    {TESTIMONIALS.map((t) => (
                      <div key={t.name} className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 min-h-[96px] flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4FD1C5] to-[#FF9A8B] flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                          {t.avatar}
                        </div>
                        <div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            "{t.quote}"
                          </p>
                          <p className="text-xs font-medium text-[#2C7A7B] dark:text-[#4FD1C5] mt-2">
                            — {t.name}
                          </p>
                          {t.detail && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {t.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 justify-center">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeTestimonial === i
                          ? "bg-[#4FD1C5] w-6"
                          : "bg-slate-300 dark:bg-slate-600"
                      }`}
                      aria-label={`Show testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {hasProgress && (
          <motion.div
            className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-[#4FD1C5]/10 to-[#FF9A8B]/10 border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  Welcome back! 👋
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  You've completed {completedCount} of {workshops.length} workshops.
                </p>
                {nextWorkshop && (
                  <button
                    onClick={() => navigate(`/workshop/${nextWorkshop.id}`)}
                    className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[#2C7A7B] dark:text-[#4FD1C5] hover:underline"
                  >
                    Continue {nextWorkshop.title} →
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {Math.round((completedCount / workshops.length) * 100)}% complete
                </div>
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br from-[#4FD1C5] to-[#FF9A8B] text-white">
                  {completedCount === workshops.length ? "🏆" : "🔒"}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-16 p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { label: "Workshops", value: String(workshops.length), icon: "🎯" },
            { label: "Modules", value: String(workshops.reduce((sum, w) => sum + w.modules.length, 0) + "+"), icon: "📚" },
            { label: "Minutes", value: "135", icon: "⏱️" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {stat.value}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/20"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Interactive Cards</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Animated workshop cards with progress tracking.</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4FD1C5]/10 text-[#2C7A7B] flex items-center justify-center text-lg">🎯</div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-white">Visual progress</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">See completion status at a glance</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/20"
          >
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Step-by-Step Modules</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Guided journey through lessons, quizzes, checklists, reflections, activities.</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Lessons", icon: "📖" },
                { label: "Quizzes", icon: "🧠" },
                { label: "Checklists", icon: "✅" },
                { label: "Reflections", icon: "💭" },
                { label: "Activities", icon: "🚀" },
              ].map((chip) => (
                <span key={chip.label} className="px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span className="mr-1">{chip.icon}</span>
                  {chip.label}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mb-10 flex flex-col sm:flex-row gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workshops..."
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]/40"
          />
          <div className="flex flex-wrap gap-2" data-tour="workshops-search">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag((prev) => (prev === tag ? null : tag))}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  activeTag === tag
                    ? "bg-[#4FD1C5]/15 border-[#4FD1C5]/40 text-[#2C7A7B]"
                    : "bg-white/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        <div ref={workshopGridRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`${query}-${activeTag}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filtered.map((workshop, index) => (
                <WorkshopCard key={workshop.id} workshop={workshop} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          className="mt-20 text-center p-8 rounded-3xl bg-gradient-to-r from-[#4FD1C5]/10 to-[#FF9A8B]/10 border border-white/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">
            {completedCount === 0
              ? "Start Your Journey! 🚀"
              : completedCount === workshops.length
              ? "🏆 All Workshops Complete!"
              : `${completedCount}/${workshops.length} Complete — Keep Going!`}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {nextWorkshop
              ? `Next up: ${nextWorkshop.title}`
              : "Track your family's progress and celebrate milestones together."}
          </p>
        </motion.div>
      </div>
    </div>
  );
};
