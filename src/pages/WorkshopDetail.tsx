import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { workshops } from "@/data/workshops";
import { useWorkshopProgress } from "@/hooks/useWorkshopProgress";
import { QuizCard } from "@/components/workshops/shared/QuizCard";
import { WorkshopProgress } from "@/components/workshops/WorkshopProgress";
import { ChecklistItem } from "@/components/workshops/shared/ChecklistItem";
import { ReflectionBox } from "@/components/workshops/shared/ReflectionBox";
import { CompletionBadge } from "@/components/workshops/shared/CompletionBadge";

export const WorkshopDetail = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  const { completeModule, rawProgress } = useWorkshopProgress();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);

  const workshop = workshops.find((w) => w.id === workshopId);

  if (!workshop) {
    return <div className="min-h-screen pt-24 px-4">Workshop not found</div>;
  }

  const currentModule = workshop.modules[currentModuleIndex];
  const completedCount = Object.values(rawProgress[workshop.id] || {}).filter(Boolean).length;
  const progress = workshop.modules.length > 0 ? (completedCount / workshop.modules.length) * 100 : 0;
  const isWorkshopComplete = currentModuleIndex >= workshop.modules.length;

  const handleModuleComplete = (moduleId: string) => {
    completeModule(workshop.id, moduleId);

    setTimeout(() => {
      if (currentModuleIndex < workshop.modules.length - 1) {
        setCurrentModuleIndex((prev) => prev + 1);
      } else {
        setCurrentModuleIndex((prev) => prev + 1);
      }
    }, 1500);
  };

  const renderModuleContent = () => {
    if (!currentModule) return null;

    switch (currentModule.type) {
      case "lesson":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur border border-white/20">
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                {currentModule.content}
              </p>
            </div>
            <motion.button
              onClick={() => handleModuleComplete(currentModule.id)}
              className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg"
              style={{ backgroundColor: workshop.color }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Got it! Continue
            </motion.button>
          </motion.div>
        );

      case "quiz":
        return (
          <div className="space-y-6">
            {(currentModule.items as any[])?.map((item: any, idx: number) => (
              <QuizCard
                key={idx}
                {...item}
                color={workshop.color}
                onComplete={(correct: boolean) => {
                  if (idx === (currentModule.items?.length || 0) - 1) {
                    handleModuleComplete(currentModule.id);
                  }
                }}
              />
            ))}
          </div>
        );

      case "checklist":
        return (
          <div className="space-y-4">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {currentModule.content}
            </p>
            <ChecklistItems
              items={(currentModule.items as any[]) || []}
              color={workshop.color}
              onComplete={() => handleModuleComplete(currentModule.id)}
            />
          </div>
        );

      case "reflection":
        return (
          <div className="space-y-6">
            <p className="text-slate-700 dark:text-slate-300">{currentModule.content}</p>
            <ReflectionBox
              prompt="Take a moment to reflect. How does this apply to your family?"
              color={workshop.color}
              onSave={() => handleModuleComplete(currentModule.id)}
            />
          </div>
        );

      case "activity":
        return (
          <div className="space-y-6">
            <p className="text-slate-700 dark:text-slate-300">{currentModule.content}</p>
            <div className="grid gap-4">
              {(currentModule.items as any[])?.map((item: any, idx: number) => (
                <motion.div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <h4 className="font-bold text-slate-800 dark:text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {item.description}
                  </p>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Action:
                    </span>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-1">
                      {item.action}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.button
              onClick={() => handleModuleComplete(currentModule.id)}
              className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg"
              style={{ backgroundColor: workshop.color }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Activity Complete!
            </motion.button>
          </div>
        );

      default:
        return null;
    }
  };

  if (isWorkshopComplete) {
    return (
      <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
        <CompletionBadge title={workshop.title} icon={workshop.icon} color={workshop.color} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.button
          onClick={() => navigate("/workshops")}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Back to Workshops
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 rounded-3xl bg-white/60 dark:bg-slate-800/60 backdrop-blur border border-white/20 shadow-lg"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg"
              style={{ backgroundColor: workshop.lightColor }}
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-4xl">{workshop.icon}</span>
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                {workshop.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">{workshop.subtitle}</p>
              <span className="text-slate-500 dark:text-slate-400">
                Module {currentModuleIndex + 1} of {workshop.modules.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <WorkshopProgress progress={progress} color={workshop.color} />

          {/* Module Navigation Dots */}
          <div className="flex gap-2 justify-center mt-6">
            {workshop.modules.map((module, idx) => (
              <motion.button
                key={module.id}
                onClick={() => setCurrentModuleIndex(idx)}
                className={`h-2.5 rounded-full transition-colors ${
                  idx === currentModuleIndex
                    ? "w-8 bg-slate-800 dark:bg-white"
                    : "w-2.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400"
                }`}
                whileTap={{ scale: 0.9 }}
                aria-label={`Go to module ${idx + 1}: ${module.title}`}
              />
            ))}
          </div>
        </motion.div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {currentModule.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">{currentModule.content}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentModule.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderModuleContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

function ChecklistItems({
  items,
  color,
  onComplete,
}: {
  items: any[];
  color: string;
  onComplete: () => void;
}) {
  const [checkedCount, setCheckedCount] = useState(0);
  const totalItems = items.length;

  const handleToggle = (checked: boolean) => {
    const newCount = checkedCount + (checked ? 1 : -1);
    setCheckedCount(newCount);
    if (newCount === totalItems) {
      onComplete();
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <ChecklistItem
          key={idx}
          text={item.text}
          icon={item.icon}
          color={color}
          onToggle={handleToggle}
        />
      ))}
      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        {checkedCount}/{totalItems} completed
      </div>
    </div>
  );
}
