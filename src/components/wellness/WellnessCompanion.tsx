import { useState, FC, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWellness, type ContentAgeGroup } from "@/context/WellnessContext";
import { useNavigate } from "react-router-dom";
import { useProfileId } from "@/context/ProfileContext";

function getCompanionStorageKey(profileId: string | null): string {
  if (!profileId) return "dg_companion_state";
  return `dg_companion_${profileId}`;
}

// Age-group-aware tips: picked by contentAgeGroup, refined by mode where relevant.
const ageGroupTips: Record<ContentAgeGroup, Record<string, string[]>> = {
  kids: {
    parent: [
      "Play a cybersecurity quiz with your child 🎮",
      "Watch a wellness video together 🍿",
      "Set up parental controls for their apps 🔒",
      "Practice 3 deep breaths together 🌬️",
    ],
    child: [
      "Play a quick cybersecurity quiz 🎮",
      "Watch a fun wellness video 🍿",
      "Take a 20-20-20 eye break 👁️",
      "Practice 3 deep breaths 🌬️",
    ],
    family: [
      "Play a keyboard game together ⌨️",
      "Watch a video as a family 🍿",
      "Take a 20-20-20 eye break 👁️",
      "Practice 3 deep breaths together 🌬️",
    ],
  },
  teens: {
    parent: [
      "Discuss screen time with your teen 📊",
      "Review their privacy settings 🔒",
      "Watch a teen wellness video together 🍿",
      "Practice 3 deep breaths 🌬️",
    ],
    child: [
      "Review your privacy settings 🔒",
      "Check your screen time report 📊",
      "Take a 20-20-20 eye break 👁️",
      "Practice 3 deep breaths 🌬️",
    ],
    family: [
      "Talk online safety as a family 💬",
      "Watch a teen wellness video 🍿",
      "Take a 20-20-20 eye break 👁️",
      "Practice 3 deep breaths together 🌬️",
    ],
  },
  parents: {
    parent: [
      "Review this week's screen time reports 📊",
      "Create a family digital agreement 📝",
      "Discuss online footprints with your teens 👣",
      "Practice 3 deep breaths 🌬️",
    ],
    child: [
      "Ask your parents about screen time limits ⏰",
      "Learn about online safety 🛡️",
      "Take a 20-20-20 eye break 👁️",
      "Practice 3 deep breaths 🌬️",
    ],
    family: [
      "Create a family digital agreement 📝",
      "Plan a device-free family activity 🌳",
      "Review screen time as a family 📊",
      "Practice 3 deep breaths together 🌬️",
    ],
  },
  both: {
    parent: [
      "Try a cybersecurity quiz together 🎮",
      "Watch a wellness video as a family 🍿",
      "Set up parental controls together 🔒",
      "Practice 3 deep breaths 🌬️",
    ],
    child: [
      "Play a quick cybersecurity quiz 🎮",
      "Watch a fun wellness video 🍿",
      "Learn about online safety 🛡️",
      "Practice 3 deep breaths 🌬️",
    ],
    family: [
      "Play a game together 🎮",
      "Watch a wellness video as a family 🍿",
      "Create a family digital agreement 📝",
      "Practice 3 deep breaths together 🌬️",
    ],
  },
  family: {
    parent: [
      "Create a family digital agreement 📝",
      "Plan a device-free family walk 🌳",
      "Review screen time as a family 📊",
      "Practice 3 deep breaths together 🌬️",
    ],
    child: [
      "Ask your family about digital rules 📜",
      "Learn about online safety 🛡️",
      "Take a 20-20-20 eye break 👁️",
      "Practice 3 deep breaths 🌬️",
    ],
    family: [
      "Plan a device-free family walk 🌳",
      "Create a family digital agreement 📝",
      "Watch a wellness video together 🍿",
      "Practice 3 deep breaths together 🌬️",
    ],
  },
};

export const WellnessCompanion: FC = () => {
  const { mode, setMode, contentAgeGroup, setContentAgeGroup } = useWellness();
  const navigate = useNavigate();
  const profileId = useProfileId();
  const storageKey = getCompanionStorageKey(profileId);

  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [isEyeBreak, setIsEyeBreak] = useState(false);
  const [eyeBreakTimer, setEyeBreakTimer] = useState(20);
  const [faqMode, setFaqMode] = useState(false);
  const [faqInput, setFaqInput] = useState("");
  const [faqHistory, setFaqHistory] = useState<{ q: string; a: string }[]>([]);
  const [faqLoading, setFaqLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.faqHistory)) {
          setFaqHistory(parsed.faqHistory);
        }
      }
    } catch (e) {
      console.error("Failed to load companion state", e);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(storageKey, JSON.stringify({ faqHistory }));
  }, [faqHistory, storageKey]);

  const askFaq = async () => {
    const question = faqInput.trim();
    if (!question) return;
    setFaqLoading(true);
    try {
      const res = await fetch("/api/faq/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setFaqHistory((h) => [
        ...h,
        { q: question, a: data.answer || data.error || "No answer." },
      ]);
    } catch {
      setFaqHistory((h) => [
        ...h,
        { q: question, a: "Sorry, I could not reach the advisor right now." },
      ]);
    } finally {
      setFaqLoading(false);
      setFaqInput("");
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isEyeBreak && eyeBreakTimer > 0) {
      interval = setInterval(() => {
        setEyeBreakTimer((prev) => prev - 1);
      }, 1000);
    } else if (isEyeBreak && eyeBreakTimer === 0) {
      setIsEyeBreak(false);
      setMessage("Great job! Your eyes are refreshed. ✨");
    }
    return () => clearInterval(interval);
  }, [isEyeBreak, eyeBreakTimer]);

  const handleAction = (tipLabel: string) => {
    if (tipLabel.includes("breaths")) {
      setIsBreathing(true);
      setMessage("Inhale slowly... and exhale...");
      setTimeout(() => setIsBreathing(false), 12000);
    } else if (tipLabel.includes("eye break")) {
      setIsEyeBreak(true);
      setEyeBreakTimer(20);
      setIsExpanded(false);
    } else if (tipLabel.includes("agreement")) {
      navigate("/family-digital-agreements");
      setIsExpanded(false);
    } else if (tipLabel.includes("video")) {
      navigate("/video-resources");
      setIsExpanded(false);
    } else if (tipLabel.includes("reports") || tipLabel.includes("screen time") || tipLabel.includes("privacy settings") || tipLabel.includes("parental controls")) {
      navigate("/screen-time-management");
      setIsExpanded(false);
    } else if (tipLabel.includes("quiz") || tipLabel.includes("game") || tipLabel.includes("keyboard")) {
      navigate("/educational-games");
      setIsExpanded(false);
    } else if (tipLabel.includes("online safety") || tipLabel.includes("online footprints") || tipLabel.includes("privacy") || tipLabel.includes("digital rules")) {
      navigate("/family-digital-agreements");
      setIsExpanded(false);
    } else {
      setMessage(tipLabel);
    }
  };

  const tips = useMemo(() => {
    const groupTips = ageGroupTips[contentAgeGroup];
    if (!groupTips) return [];
    return groupTips[mode] || groupTips.parent || [];
  }, [contentAgeGroup, mode]);

  const modeContent = useMemo(
    () => ({
      parent: {
        greeting: "Welcome to the Parent Hub. How can I assist with your family's digital safety today? 🌿",
      },
      child: {
        greeting: "Hi there, explorer! Ready to learn about the digital world? 🎨",
      },
      family: {
        greeting: "Hello! I'm here to help your family stay balanced and connected. ❤️",
      },
    }),
    []
  );

  useEffect(() => {
    setMessage(modeContent[mode].greeting);
  }, [mode, modeContent]);

  return (
    <div className="fixed bottom-8 right-8 z-50 no-print">
      {/* Breathing Exercise Overlay */}
      <AnimatePresence>
        {isBreathing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-[#4FD1C5]/20 backdrop-blur-md" />
            <motion.div
              className="w-64 h-64 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-2xl relative"
              animate={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 4, repeat: 3, ease: "easeInOut" }}
            >
              <span className="text-xl font-black text-[#2C7A7B] dark:text-[#4FD1C5] animate-pulse">
                BREATHE
              </span>
              <div className="absolute inset-0 border-8 border-[#4FD1C5] rounded-full animate-ping opacity-20" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Eye Break Overlay */}
      <AnimatePresence>
        {isEyeBreak && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-md" />
            <motion.div
              className="w-80 h-80 rounded-3xl bg-white dark:bg-slate-800 flex flex-col items-center justify-center shadow-2xl p-8 text-center gap-6"
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <span className="text-5xl">👁️</span>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Eye Break</h3>
                <p className="text-slate-600 dark:text-slate-300 font-medium">
                  Look at something 20 feet away for 20 seconds.
                </p>
              </div>
              <div className="text-6xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                {eyeBreakTimer}
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-blue-500 h-full"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 20, ease: "linear" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 1 }}
      >
        <AnimatePresence>
          {isExpanded && !isBreathing && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-24 right-0 w-80 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-[#4FD1C5]/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🌟</span>
                <h4 className="font-bold text-foreground">Wellness Guide</h4>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 mb-6 leading-relaxed font-bold">
                {message}
              </p>
              <div className="space-y-2">
                {!faqMode &&
                  tips.map((tip, i) => (
                    <motion.button
                      key={i}
                      className="w-full text-left p-3 text-xs rounded-xl bg-white dark:bg-[#4FD1C5]/10 hover:bg-slate-50 dark:hover:bg-[#4FD1C5]/20 text-slate-900 dark:text-[#4FD1C5] transition-all font-black border border-slate-200 dark:border-[#4FD1C5]/20 shadow-sm"
                      whileHover={{ x: 6, backgroundColor: "rgba(248, 250, 252, 1)" }}
                      onClick={() => handleAction(tip)}
                    >
                      {tip}
                    </motion.button>
                  ))}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {faqHistory.map((item, i) => (
                    <div key={i} className="text-xs">
                      <div className="font-black text-slate-900 dark:text-white">
                        You: {item.q}
                      </div>
                      <div className="text-slate-600 dark:text-[#4FD1C5] mt-1 leading-relaxed">
                        {item.a}
                      </div>
                    </div>
                  ))}
                  {faqLoading && <div className="text-xs text-slate-500">Thinking...</div>}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={faqInput}
                    onChange={(e) => setFaqInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && askFaq()}
                    placeholder={faqMode ? "Ask a question..." : "Ask me anything..."}
                    className="flex-1 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-[#4FD1C5]"
                  />
                  <button
                    onClick={askFaq}
                    disabled={faqLoading}
                    className="px-3 py-1 text-xs font-black bg-gradient-to-r from-[#FF9A8B] to-[#4FD1C5] text-white rounded-lg shadow-sm disabled:opacity-50"
                  >
                    {faqLoading ? "..." : "Ask"}
                  </button>
                </div>
                <button
                  onClick={() => setFaqMode(!faqMode)}
                  className="mt-2 text-[10px] font-black text-slate-500 hover:text-[#4FD1C5] transition-colors"
                >
                  {faqMode ? "← Back to tips" : "💬 Try AI assistant"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF9A8B] to-[#4FD1C5] shadow-lg flex items-center justify-center text-3xl border-4 border-white/20"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(!isExpanded)}
          animate={{
            boxShadow: [
              "0 0 0 0px rgba(79,209,197,0.4)",
              "0 0 0 25px rgba(79,209,197,0)",
            ],
          }}
          transition={{ boxShadow: { repeat: Infinity, duration: 2.5 } }}
        >
          {mode === "child" ? "🎮" : mode === "parent" ? "🛡️" : "🌟"}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default WellnessCompanion;
