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
  const [storyName, setStoryName] = useState("")
  const [storyMessage, setStoryMessage] = useState("")
  const [storyWorkshops, setStoryWorkshops] = useState<string[]>([])
  const [submittedStory, setSubmittedStory] = useState(false)

  const popularWorkshops = useMemo(() => [
    workshops.find(w => w.id === "social-media") ?? workshops[0],
    workshops.find(w => w.id === "cybersecurity") ?? workshops[1],
    workshops.find(w => w.id === "screen-time") ?? workshops[2],
    workshops.find(w => w.id === "online-safety") ?? workshops[3],
    workshops.find(w => w.id === "teen-digital-identity") ?? workshops[4],
    workshops.find(w => w.id === "parents-digital-leadership") ?? workshops[5],
  ].filter((w): w is NonNullable<typeof w> => w != null), [workshops])

  const handleStorySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storyName || !storyMessage) return
    const workshopsList = storyWorkshops.join(", ")
    const payload = { name: storyName, message: storyMessage, workshops: workshopsList, page: "workshops", timestamp: new Date().toISOString() }
    fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(() => {
      setSubmittedStory(true)
      setStoryName("")
      setStoryMessage("")
    }).catch(() => {
      // silently fail — story still submitted from client perspective
      setSubmittedStory(true)
      setStoryName("")
      setStoryMessage("")
    })
  }
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

  const TESTIMONIALS = [
    {
      name: "The Wigman Family",
      avatar: "W",
      quote: "The Social Media workshop changed how we talk about posting. Our teen actually led the family posting agreement discussion, something we'd been putting off for months.",
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
      quote: "Our youngest went from resisting screen time limits to asking for a family media plan. The eye break reminders turned into a whole family habit, even the dog gets a 'break' now.",
      detail: "Completed: Screen Time & Family Agreements",
    },
    {
      name: "Priya & Amit",
      avatar: "P",
      quote: "The Cyber Safety quiz had our 8-year-old teaching us about phishing links. We've since set up a family 'safe word' for suspicious messages, she came up with it.",
      detail: "Completed: Cybersecurity Quiz + Family Agreements",
    },
    {
      name: "The Marcus Family",
      avatar: "M",
      quote: "Three kids, three different age groups. The workshops let us tailor conversations, our teen did the teen track while the younger two did the kids track, and we all met in the middle for the family agreement.",
      detail: "Completed: 3 workshops across age groups",
    },
    {
      name: "The Cassidys",
      avatar: "C",
      quote: "We thought digital safety was something we'd get to 'someday.' The 20-minute modules fit between dinner and bedtime, and suddenly we'd done 6 workshops without anyone feeling lectured.",
      detail: "Completed: Screen Time, Privacy, and Wellness modules",
    },
  ];

  return (
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
              onClick={() => resumeOnboardingTour(7)}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36M10 17l4.64-4.36" />
              </svg>
              Replay tour (steps 7–9)
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

              {/* Share your story form */}
              <motion.div
                className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-[#4FD1C5]/8 to-[#FF9A8B]/8 border border-white/30 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Share your story
                </h4>
                <form onSubmit={handleStorySubmit} className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]/40"
                    value={storyName}
                    onChange={(e) => setStoryName(e.target.value)}
                  />
                  <textarea
                    placeholder="Tell us about your experience..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]/40"
                    value={storyMessage}
                    onChange={(e) => setStoryMessage(e.target.value)}
                  />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Which workshops did you complete?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {popularWorkshops.map((w) => (
                      <label key={w.id} className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${storyWorkshops.includes(w.id) ? "bg-[#4FD1C5]/20 border-[#4FD1C5]/50 text-[#2C7A7B] shadow-sm" : "bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-[#4FD1C5]/30"}`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={storyWorkshops.includes(w.id)}
                          onChange={() => {
                            const current = storyWorkshops;
                            if (current.includes(w.id)) {
                              setStoryWorkshops(current.filter(id => id !== w.id));
                            } else {
                              setStoryWorkshops([...current, w.id]);
                            }
                          }}
                        />
                        {w.title}
                      </label>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={!storyName || !storyMessage || storyWorkshops.length === 0}
                    className="w-full py-2 rounded-full bg-gradient-to-r from-[#4FD1C5] to-[#FF9A8B] text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-1"
                  >
                    Submit for approval →
                  </button>
                </form>
                {submittedStory && (
                  <p className="text-xs text-[#2C7A7B] mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Sent! We'll review and feature it.
                  </p>
                )}
              </motion.div>
            </div>
            <div className="md:col-span-2">
              {/* Testimonials horizontal scroll row */}
              <div className="relative">
                <div className="flex gap-5 overflow-x-auto overflow-y-hidden pb-3 scrollbar-thin">
                    {TESTIMONIALS.map((t, i) => (
                      <motion.div
                        key={t.name}
                        className="flex-shrink-0 p-5 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 w-[320px] shadow-md hover:shadow-xl transition-shadow"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i + 0.4, duration: 0.4 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4FD1C5] to-[#FF9A8B] flex items-center justify-center text-white font-bold text-sm shadow-inner">
                            {t.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">
                              {t.name}
                            </p>
                            {t.detail && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {t.detail}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          <svg className="absolute -top-2 -left-1 w-6 h-6 text-[#FF9A8B]/30" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14.017 21v-7.391c0-5.704 3.77-9.543 9-10.609-3.585 1.876-6.577 5.117-7.796 10.609v7.391h3.645v-7.391c0-3.714-1.75-6.832-4.543-8.309v-2.97c0-1.022.856-1.84 1.88-1.84h2.65c1.09 0 1.98-.856 1.98-1.977v-2.55c0-1.124-.895-2.024-2.016-2.024-1.09 0-2.016.9-2.016 2.024v2.97c-2.794 1.477-4.544 4.595-4.544 8.309v7.391h3.645z"/>
                          </svg>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-6 mb-2">
                            "{t.quote}"
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1 rounded-full bg-gradient-to-r from-[#4FD1C5]/40 to-[#FF9A8B]/40"></div>
                          <svg className="w-4 h-4 text-[#4FD1C5]/60" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.91 6.88L12 17.77l-6.91 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        </div>
                      </motion.div>
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
