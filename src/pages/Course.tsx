import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getCourseManifest, resolveAssetForModule } from "@/lib/courseAssets";
import { type CourseManifest } from "@/lib/courseAssets";
import { CourseAudioPlayer } from "@/components/course/CourseAudioPlayer";

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  hasActionPause: boolean;
  hasAssessment?: boolean;
  type: "module" | "assessment";
  assessmentId?: "a1" | "a2";
}

export interface AssessmentQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const COURSE_MODULES: CourseModule[] = [
  { id: "m1", title: "Introduction to Digital Guardian", duration: "2:00", hasActionPause: true, type: "module" },
  { id: "m2", title: "Checking Your Digital Wellbeing", duration: "4:45", hasActionPause: true, type: "module" },
  { id: "m3", title: "Privacy & Permission Settings", duration: "4:45", hasActionPause: true, type: "module" },
  { id: "m4", title: "Content Filtering & Your Algorithm", duration: "4:45", hasActionPause: true, type: "module" },
  { id: "m5", title: "Manage Subscriptions & Feed Cleanup", duration: "4:45", hasActionPause: true, type: "module" },
  { id: "a1", title: "Assessment 1: Mid-Point Check-In", duration: "5-10 min", hasActionPause: false, hasAssessment: true, type: "assessment", assessmentId: "a1" },
  { id: "m6", title: "Approving Content (YouTube Kids & Kidio)", duration: "4:45", hasActionPause: true, type: "module" },
  { id: "m7", title: "Report & Block on Social Media", duration: "4:45", hasActionPause: true, type: "module" },
  { id: "m8", title: "Conversation Starters on Cyberbullying", duration: "4:45", hasActionPause: true, type: "module" },
  { id: "m9", title: "Digital Literacy & AI", duration: "4:45", hasActionPause: true, type: "module" },
  { id: "a2", title: "Assessment 2: Final Assessment", duration: "10-15 min", hasActionPause: false, hasAssessment: true, type: "assessment", assessmentId: "a2" },
  { id: "end", title: "Course Wrap-Up & Commitment", duration: "1:00", hasActionPause: true, type: "module" },
];

const ASSESSMENT_1_QUESTIONS: AssessmentQuestion[] = [
  { question: "What is the average daily screen time mentioned in this course?", options: ["4 hours", "7 hours", "10 hours", "12 hours"], correct: 1, explanation: "The course states the average person spends over 7 hours daily on screens." },
  { question: "Which best defines digital wellness?", options: ["Completely quitting all social media", "Using technology intentionally and in balance with your values", "Only using devices for work purposes", "Limiting screen time to 30 minutes per day"], correct: 1, explanation: "Digital wellness is the intentional, balanced approach to using technology." },
  { question: "Where do you find the Digital Wellbeing dashboard on an Android device?", options: ["Settings > Display", "Settings > Digital Wellbeing & Parental Controls", "Settings > Apps", "Settings > Security"], correct: 1, explanation: "Android places digital wellbeing tools under Digital Wellbeing & Parental Controls." },
  { question: "Which iOS feature allows parents to set a passcode to lock Screen Time settings?", options: ["Guided Access", "Screen Time Passcode", "Parental Lock", "App Restrictions"], correct: 1, explanation: "Screen Time Passcode locks settings so children cannot bypass limits." },
  { question: "What is the primary benefit of turning on grayscale mode?", options: ["It saves battery life", "It reduces the visual appeal of colorful app icons and notifications", "It makes text easier to read", "It blocks all advertisements"], correct: 1, explanation: "Grayscale removes colorful notification and icon appeal, reducing addictive visual pull." },
  { question: "On Instagram, which setting prevents strangers from viewing your posts and stories?", options: ["Two-Factor Authentication", "Private Account", "Restricted Mode", "Hide Stories"], correct: 1, explanation: "Private Account is the primary guardrail for limiting stranger visibility." },
  { question: "Why is using an authenticator app better than SMS for Two-Factor Authentication?", options: ["It is faster", "SMS is vulnerable to SIM-swapping attacks", "Authenticator apps are free", "SMS requires an internet connection"], correct: 1, explanation: "SMS-based 2FA is vulnerable to SIM-swapping attacks." },
  { question: "Where do you go to turn off Off-Facebook Activity?", options: ["Settings > Privacy > Off-Facebook Activity", "Settings > Your Facebook Information > Off-Facebook Activity", "Settings > Ads > Off-Facebook Activity", "Settings > Security > Off-Facebook Activity"], correct: 1, explanation: "Off-Facebook Activity is managed under Your Facebook Information." },
  { question: "On TikTok, how many keywords can you block under Content Preferences?", options: ["50", "100", "200", "Unlimited"], correct: 2, explanation: "TikTok allows blocking up to 200 keywords or hashtags." },
  { question: "What happens when you tap Refresh Your For You Page on TikTok?", options: ["It clears your watch history and resets your algorithm", "It deletes all your saved videos", "It logs you out of your account", "It changes your profile picture"], correct: 0, explanation: "Refreshing wipes past watch history and resets the For You algorithm." },
  { question: "On Instagram, how do you tell the algorithm to show you more or less of specific topics?", options: ["Settings > Content Preferences > Your Algorithm", "Settings > Privacy > Algorithm", "Settings > Account > Topics", "Settings > Notifications > Preferences"], correct: 0, explanation: "Your Algorithm is under Content Preferences." },
  { question: "Which Instagram tool allows you to sort your Following list by Least Interacted?", options: ["Unfollow Manager", "Following > Sort by Least Interacted", "Insights > Followers", "Privacy > Following"], correct: 1, explanation: "Instagram provides a Least Interacted sort in the Following list." },
  { question: "What is the purpose of muting an account?", options: ["To block them completely", "To stop their content from appearing in your feed without them knowing", "To report them for harassment", "To delete their comments"], correct: 1, explanation: "Muting hides content quietly without notifying the account." },
  { question: "Which of the following is a recommended habit for keeping your feed relevant?", options: ["Follow every account suggested by the platform", "Perform a quarterly subscription audit", "Only follow verified accounts", "Unfollow everyone once a month"], correct: 1, explanation: "Quarterly audits keep feeds aligned with current interests." },
  { question: "On Facebook, how can you see chronological posts from friends instead of boosted content?", options: ["Go to Settings > Feeds and pin the Feeds tab", "Use the Explore page", "Click News Feed and choose Chronological", "It is not possible"], correct: 0, explanation: "Pinning the Feeds tab gives a chronological friend-focused view." },
];

const ASSESSMENT_2_QUESTIONS: AssessmentQuestion[] = [
  { question: "What is Approved Content Only mode in YouTube Kids?", options: ["A mode that shows only educational videos", "A mode that disables search and only shows videos you have hand-selected", "A mode that removes all advertisements", "A mode that allows unlimited screen time"], correct: 1, explanation: "Approved Content Only disables recommendations and search." },
  { question: "Which app is a kid-safe browser for ages 6-14 that creates a walled garden?", options: ["YouTube Kids", "Kidio (Kidoz)", "Google Kids Space", "Facebook Messenger Kids"], correct: 1, explanation: "Kidio provides a pre-approved, age-appropriate browsing experience." },
  { question: "Through Google Family Link, which content level allows Most of YouTube?", options: ["Explore (9+)", "Explore More (13+)", "Most of YouTube (13+)", "Full Access (18+)"], correct: 2, explanation: "Most of YouTube is available at the 13+ supervised level." },
  { question: "On Instagram, which feature hides a user's comments from your posts without them knowing?", options: ["Block", "Mute", "Restrict", "Report"], correct: 2, explanation: "Restrict hides comments and limits message visibility quietly." },
  { question: "What is the recommended first step before reporting or blocking a user?", options: ["Block them immediately", "Take screenshots of the offending messages as evidence", "Reply with a warning message", "Delete your account"], correct: 1, explanation: "Screenshots preserve evidence before platform actions change content." },
  { question: "Where do you enable Hidden Words to filter offensive comments?", options: ["Settings > Privacy > Comments", "Settings > Account > Hidden Words", "Settings > Security > Filters", "Settings > Notifications > Comments"], correct: 0, explanation: "Hidden Words is under Privacy > Comments." },
  { question: "What is an upstander in cyberbullying contexts?", options: ["Someone who ignores the bullying", "Someone who actively supports the victim and reports the bullying", "Someone who joins the bully", "Someone who deletes their social media account"], correct: 1, explanation: "Upstanders support victims and help interrupt harmful behavior." },
  { question: "The Three C's for handling cyberbullying are: Create evidence, Check with a trusted adult, and:", options: ["Criticize the bully", "Collectively support the victim", "Cut off all contact", "Claim victory"], correct: 1, explanation: "Collective support strengthens protection and reporting." },
  { question: "What is the primary reason most children do not report cyberbullying?", options: ["They do not know how to report", "They fear losing their devices or being blamed", "They do not think it is serious", "They do not know who to tell"], correct: 1, explanation: "Fear of device loss or blame is the most common barrier." },
  { question: "Which conversation starter is recommended for parents?", options: ["Are you being bullied online?", "What has been the best thing you have seen online today?", "You better not be on social media.", "Let me see your phone right now."], correct: 1, explanation: "Open curiosity starters build safer reporting habits." },
  { question: "What does AI hallucination mean?", options: ["AI generating images of things that don't exist", "AI confidently presenting false information as fact", "AI failing to load properly", "AI creating realistic deepfakes"], correct: 1, explanation: "Hallucination is false content presented confidently as fact." },
  { question: "Where can you adjust AI-generated content frequency on TikTok?", options: ["Settings > Privacy > AI", "Settings > Content Preferences > Manage Topics", "Settings > Account > AI Settings", "Settings > Notifications > AI"], correct: 1, explanation: "Manage Topics includes AI-generated content controls." },
  { question: "Which is a sign of a deepfake video?", options: ["Perfectly synchronized audio", "Unnatural blinking or mismatched lighting", "High-definition resolution", "Short video length"], correct: 1, explanation: "Visual artifacts like unnatural blinking often reveal deepfakes." },
  { question: "What is a filter bubble?", options: ["A feature that filters out all negative content", "A situation where algorithms show you only content that reinforces your existing beliefs", "A tool for blocking spam emails", "A setting that deletes your search history"], correct: 1, explanation: "Filter bubbles reinforce existing beliefs instead of exposing diverse views." },
  { question: "Why is it dangerous to feed private information into public AI chatbots?", options: ["The chatbot might crash", "The training data is often saved and can be accessed later", "It slows down the chat", "It costs extra money"], correct: 1, explanation: "Public AI interactions may be saved and reused." },
  { question: "What should you do if you see a sensational viral video that seems too wild to be true?", options: ["Share it immediately", "Stop and verify it using reverse image search and critical analysis", "Comment asking if it is real", "Save it for later"], correct: 1, explanation: "Verification stops misinformation spread." },
  { question: "Which is NOT a pillar of digital literacy in the AI era?", options: ["How AI works", "How AI influences you", "How to use AI responsibly", "How to build your own AI"], correct: 3, explanation: "The course pillars are influence, responsibility, and understanding—not building AI." },
  { question: "On Android, where do you revoke app permissions?", options: ["Settings > Apps > Permission Manager", "Settings > Security & Privacy > Permission Manager", "Settings > System > Permissions", "Settings > Accounts > Permissions"], correct: 1, explanation: "Android permission management is under Security & Privacy." },
  { question: "What does turning off Allow Apps to Request to Track prevent?", options: ["Apps from asking to share your device identifier with advertisers", "Apps from being downloaded", "Apps from using your camera", "Apps from sending you notifications"], correct: 0, explanation: "This stops IDFA sharing requests for advertising tracking." },
  { question: "What is the ultimate purpose of the Digital Wellness Plan?", options: ["To receive a certificate of completion", "To create a personalized, actionable roadmap for sustainable digital habits", "To share your screen time data with the instructor", "To delete all your social media accounts"], correct: 1, explanation: "The plan turns learning into actionable personal commitments." },
];

const STORAGE_KEY = "guardd_course_progress";

interface CourseState {
  completedModuleIds: string[];
  passedAssessments: {
    a1?: boolean;
    a2?: boolean;
  };
  currentIndex: number;
}

export const Course = () => {
  const [state, setState] = useState<CourseState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse course progress", e);
    }
    return {
      completedModuleIds: [],
      passedAssessments: {},
      currentIndex: 0,
    };
  });

  const [showAssessment, setShowAssessment] = useState(false);
  const [activeAssessmentId, setActiveAssessmentId] = useState<"a1" | "a2" | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const current = COURSE_MODULES[state.currentIndex];
  const progress = ((state.currentIndex) / COURSE_MODULES.length) * 100;
  const isComplete = state.currentIndex >= COURSE_MODULES.length;

  const markComplete = (moduleId: string) => {
    setState((prev) => {
      const completedModuleIds = prev.completedModuleIds.includes(moduleId)
        ? prev.completedModuleIds
        : [...prev.completedModuleIds, moduleId];
      return { ...prev, completedModuleIds };
    });
  };

  const handleNext = () => {
    if (current.type === "assessment" && activeAssessmentId) {
      setState((prev) => ({
        ...prev,
        passedAssessments: { ...prev.passedAssessments, [activeAssessmentId]: true },
      }));
    }

    if (state.currentIndex < COURSE_MODULES.length - 1) {
      setState((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    } else {
      setState((prev) => ({ ...prev, currentIndex: prev.currentIndex + 1 }));
    }
    setShowAssessment(false);
    setActiveAssessmentId(null);
  };

  const openAssessment = (assessmentId: "a1" | "a2") => {
    setActiveAssessmentId(assessmentId);
    setShowAssessment(true);
  };

  const questions = useMemo(() => {
    if (activeAssessmentId === "a1") return ASSESSMENT_1_QUESTIONS;
    if (activeAssessmentId === "a2") return ASSESSMENT_2_QUESTIONS;
    return [];
  }, [activeAssessmentId]);

  const [manifest, setManifest] = useState<CourseManifest | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getCourseManifest()
      .then(setManifest)
      .catch(() => setLoadError("Unable to load course assets manifest."));
  }, []);

  const currentModuleEntry = manifest?.modules.find((m) => m.moduleId === current.id);
  const playback = currentModuleEntry ? resolveAssetForModule(currentModuleEntry) : null;

  if (loadError) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-white/70 dark:bg-slate-800 border border-red-200 text-red-700">
          {loadError}
        </div>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <div className="animate-pulse text-slate-500">Loading course manifest...</div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", duration: 1 }}
          className="text-center py-12 px-4"
        >
          <motion.div
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl mb-6 shadow-2xl bg-gradient-to-br from-[#4FD1C5] to-[#FF9A8B]"
            animate={{
              boxShadow: [
                "0 0 0 0px rgba(79,209,197,0.4)",
                "0 0 0 30px rgba(79,209,197,0)",
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🏆
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold mb-2 text-slate-800 dark:text-white"
          >
            Course Complete! 🎉
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-slate-600 dark:text-slate-400 mb-8"
          >
            You finished the Digital Guardian Wellness Initiative.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap gap-3 justify-center mb-10"
          >
            <button
              onClick={() =>
                setState({
                  completedModuleIds: [],
                  passedAssessments: {},
                  currentIndex: 0,
                })
              }
              className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors"
            >
              Replay Course
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative mb-8 pb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-xl font-bold text-sm text-slate-700 dark:text-slate-200 text-center"
          >
            Coming Soon — course modules, voice narration, and final video playback are being prepared.
          </motion.p>
          <img
            src="/dg-logo.png"
            alt="Digital Guardian logo"
            className="w-auto h-14 max-w-[160px]"
          />
        </div>

        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4FD1C5]/10 text-[#2C7A7B] text-sm font-medium mb-4">
            <span>🎓</span>
            <span>Digital Guardian Wellness Initiative</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2">
            {current.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            45 minutes • 9 modules • 2 assessments • 9 action pauses
          </p>
        </motion.div>

        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">
              Module {state.currentIndex + 1} of {COURSE_MODULES.length}
            </span>
            <span className="font-medium text-[#4FD1C5]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#4FD1C5] to-[#FF9A8B]"
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-3xl overflow-hidden bg-slate-900 shadow-2xl">
              {current.hasAssessment ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#4FD1C5]/20 to-[#FF9A8B]/20">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🧠</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {current.title}
                    </h3>
                    <p className="text-white/70 mb-6">
                      Complete the assessment to continue
                    </p>
                    <button
                      onClick={() => openAssessment(current.assessmentId as "a1" | "a2")}
                      className="px-8 py-3 rounded-full bg-white text-slate-900 font-bold hover:scale-105 transition-transform"
                    >
                      Start Assessment
                    </button>
                  </div>
                </div>
              ) : loadError ? (
                <div className="absolute inset-0 flex items-center justify-center text-white/80">
                  <div className="text-center p-8">
                    <p className="text-sm text-white/70">
                      {loadError}
                    </p>
                  </div>
                </div>
              ) : playback?.type === "video" ? (
                <video
                  key={current.id}
                  className="absolute inset-0 w-full h-full object-cover"
                  controls
                  playsInline
                  poster={currentModuleEntry?.overlay || undefined}
                >
                  <source src={playback.primarySrc} />
                </video>
              ) : playback?.type === "audio" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                  <div className="text-5xl mb-2">🎙️</div>
                  <h3 className="text-xl font-bold text-white mb-1">{current.title}</h3>
                  <p className="text-sm text-white/70">Audio playback ready once narration is generated.</p>
                  <CourseAudioPlayer src={playback.primarySrc} title={current.title} />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/80">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🎬</div>
                    <h3 className="text-xl font-bold mb-2">{current.title}</h3>
                    <p className="text-sm text-white/70">
                      Media playback will begin here once course assets are available.
                    </p>
                    {current.hasActionPause && (
                      <span className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium">
                        ⏸️ Includes Action Pause
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  {current.title}
                </h2>
                <p className="text-sm text-slate-500">{current.duration}</p>
              </div>
              {current.hasActionPause && (
                <span className="px-3 py-1 rounded-full bg-[#4FD1C5]/10 text-[#2C7A7B] text-xs font-medium">
                  ⏸️ Includes Action Pause
                </span>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-full bg-[#4FD1C5] text-white font-bold shadow-lg hover:shadow-xl transition-all"
              >
                {current.hasAssessment ? "Complete Assessment" : "Mark Complete & Continue"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">Course Journey</h3>
            {COURSE_MODULES.map((module, index) => (
              <div
                key={module.id}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2 ${
                  index === state.currentIndex
                    ? "bg-[#4FD1C5]/10 border-[#4FD1C5]"
                    : state.completedModuleIds.includes(module.id)
                    ? "bg-green-50 dark:bg-green-900/20 border-green-400"
                    : index < state.currentIndex
                    ? "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    : "bg-white/50 dark:bg-slate-800/50 border-transparent opacity-50"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    state.completedModuleIds.includes(module.id)
                      ? "bg-green-400 text-white"
                      : index === state.currentIndex
                      ? "bg-[#4FD1C5] text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500"
                  }`}
                >
                  {state.completedModuleIds.includes(module.id) ? "✓" : index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    {module.title}
                  </div>
                  <div className="text-xs text-slate-500">{module.duration}</div>
                </div>
                {module.hasAssessment && <span className="text-xs">🧠</span>}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {showAssessment && activeAssessmentId && (
            <AssessmentModal
              moduleId={activeAssessmentId}
              questions={questions}
              onComplete={handleNext}
              onClose={() => {
                setShowAssessment(false);
                setActiveAssessmentId(null);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface AssessmentModalProps {
  moduleId: "a1" | "a2";
  questions: AssessmentQuestion[];
  onComplete: () => void;
  onClose: () => void;
}

const AssessmentModal = ({ moduleId, questions, onComplete, onClose }: AssessmentModalProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (index: number) => {
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);

    if (newAnswers.length === questions.length) {
      setShowResult(true);
    } else {
      setCurrentQ((prev) => prev + 1);
    }
  };

  const score = useMemo(() => {
    if (!showResult) return 0;
    const correct = answers.filter((a, i) => a === questions[i].correct).length;
    return Math.round((correct / questions.length) * 100);
  }, [showResult, answers, questions]);

  const passingScore = moduleId === "a1" ? 70 : 75;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-2xl w-full shadow-2xl"
      >
        {!showResult ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                {moduleId === "a1" ? "Assessment 1" : "Assessment 2"}
              </h3>
              <span className="text-sm text-slate-500">
                {currentQ + 1} / {questions.length}
              </span>
            </div>

            <div className="h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
              <motion.div
                className="h-full bg-[#4FD1C5]"
                animate={{ width: `${((currentQ) / questions.length) * 100}%` }}
              />
            </div>

            <div className="mb-8">
              <p className="text-lg text-slate-800 dark:text-white mb-6">
                {questions[currentQ].question}
              </p>
              <div className="space-y-3">
                {questions[currentQ].options.map((opt, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-left hover:border-[#4FD1C5] transition-colors bg-white dark:bg-slate-800"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-bold mr-3 text-slate-400">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-6xl mb-4"
            >
              {score >= passingScore ? "🎉" : "🧠"}
            </motion.div>
            <h3 className="text-2xl font-bold mb-2 text-slate-800 dark:text-white">
              {score >= passingScore ? "Assessment Complete!" : "Nice try—review and retry soon."}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              You scored {score}%
            </p>
            <p className="text-sm text-slate-500 mt-4">
              {score >= passingScore
                ? "Redirecting to the next module..."
                : "You can review the material and try again later."}
            </p>
            <button
              onClick={onComplete}
              className="mt-6 px-6 py-3 rounded-full bg-[#4FD1C5] text-white font-bold shadow-lg"
            >
              Continue
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
