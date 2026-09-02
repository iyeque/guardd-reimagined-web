import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Workshop } from "@/data/workshops";
import { useWorkshopProgress } from "@/hooks/useWorkshopProgress";

interface Props {
  workshop: Workshop;
  index: number;
}

export const WorkshopCard = ({ workshop, index }: Props) => {
  const navigate = useNavigate();
  const { progress } = useWorkshopProgress(workshop.id, workshop.modules.length);
  const isCompleted = progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      whileHover={{ y: -8 }}
      onClick={() => navigate(`/workshop/${workshop.id}`)}
      className="relative group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 group-hover:shadow-2xl">
        <div className="h-2 w-full" style={{ backgroundColor: workshop.color }} />

        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: workshop.lightColor }}
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              {workshop.icon}
            </motion.div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>{workshop.duration}</span>
              <span>•</span>
              <span>{workshop.ageGroup}</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white group-hover:text-[#4FD1C5] transition-colors">
              {workshop.title}
            </h3>
            {workshop.role && (
              <span className="shrink-0 px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-700/90 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                {workshop.role === 'Parents' ? '👨‍👩‍👧 For Parents' : workshop.role === 'Teens' ? '👦 For Teens' : '👨‍👩‍👧‍👦 Whole Family'}
              </span>
            )}
          </div>

          <p className="text-sm font-medium mb-3" style={{ color: workshop.color }}>
            {workshop.subtitle}
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">
            {workshop.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {workshop.modules.slice(0, 3).map((m) => (
              <span
                key={m.id}
                className="text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                {m.type === 'lesson' ? '📖' : m.type === 'quiz' ? '❓' : m.type === 'checklist' ? '✅' : m.type === 'reflection' ? '💭' : '🚀'} {m.title}
              </span>
            ))}
            {(workshop.modulesCount ?? workshop.modules.length) > 3 && (
              <span className="text-xs px-2 py-1 rounded-md bg-[#4FD1C5]/10 text-[#2C7A7B] dark:text-[#4FD1C5]">
                +{(workshop.modulesCount ?? workshop.modules.length) - 3} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {progress > 0 ? (
              <div className="flex-1 mr-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500 dark:text-slate-400">Progress</span>
                  <span className="font-medium" style={{ color: workshop.color }}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: workshop.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            ) : (
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {isCompleted ? " Completed" : "Start Workshop"}
              </span>
            )}

            <div className="flex items-center gap-2">
              {workshop.hasAssessment && (
                <span className="text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 px-2 py-1 rounded-full">
                  🧠 Quiz
                </span>
              )}
              {workshop.actionPauseCount && workshop.actionPauseCount > 0 && (
                <span className="text-xs font-medium text-[#2C7A7B] dark:text-[#4FD1C5] bg-[#4FD1C5]/10 px-2 py-1 rounded-full">
                  ⏸️ {workshop.actionPauseCount}
                </span>
              )}
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: workshop.lightColor }}
                >
                  ✅
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
          style={{ backgroundColor: workshop.color }}
        />
      </div>
    </motion.div>
  );
};
