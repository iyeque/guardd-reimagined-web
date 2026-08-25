import { motion } from "framer-motion";
import { useState } from "react";
import { ChecklistItem } from "@/components/workshops/shared/ChecklistItem";

interface ActivityItem {
  title: string;
  description: string;
  action: string;
}

interface ActivityModuleProps {
  title: string;
  content: string;
  items: ActivityItem[];
  color: string;
  onComplete: () => void;
}

export const SocialMediaWorkshop = ({
  title,
  content,
  items,
  color,
  onComplete,
}: ActivityModuleProps) => {
  const [done, setDone] = useState(false);

  const finish = () => {
    setDone(true);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <p className="text-slate-700 dark:text-slate-300">{content}</p>
      <div className="grid gap-4">
        {items.map((item, idx) => (
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
        onClick={finish}
        disabled={done}
        className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg disabled:opacity-70"
        style={{ backgroundColor: color }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {done ? "Activity Complete!" : "Mark Activity Complete"}
      </motion.button>
    </div>
  );
};

export const CybersecurityWorkshop = ({
  title,
  content,
  items,
  color,
  onComplete,
}: ActivityModuleProps) => {
  const [done, setDone] = useState(false);

  const finish = () => {
    setDone(true);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <p className="text-slate-700 dark:text-slate-300">{content}</p>
      <div className="grid gap-4">
        {items.map((item, idx) => (
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
        onClick={finish}
        disabled={done}
        className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg disabled:opacity-70"
        style={{ backgroundColor: color }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {done ? "Activity Complete!" : "Mark Activity Complete"}
      </motion.button>
    </div>
  );
};

export const ScreenTimeWorkshop = ({
  title,
  content,
  items,
  color,
  onComplete,
}: ActivityModuleProps) => {
  const [done, setDone] = useState(false);

  const finish = () => {
    setDone(true);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <p className="text-slate-700 dark:text-slate-300">{content}</p>
      <div className="grid gap-4">
        {items.map((item, idx) => (
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
        onClick={finish}
        disabled={done}
        className="w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg disabled:opacity-70"
        style={{ backgroundColor: color }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {done ? "Activity Complete!" : "Mark Activity Complete"}
      </motion.button>
    </div>
  );
};
