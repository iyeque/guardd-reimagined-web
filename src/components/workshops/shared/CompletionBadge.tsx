import { motion } from "framer-motion";

interface Props {
  title: string;
  icon: string;
  color: string;
}

export const CompletionBadge = ({ title, icon, color }: Props) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 1 }}
      className="text-center py-12"
    >
      <motion.div
        className="w-32 h-32 mx-auto rounded-full flex items-center justify-center text-6xl mb-6 shadow-2xl"
        style={{ backgroundColor: color }}
        animate={{
          boxShadow: [
            `0 0 0 0px ${color}40`,
            `0 0 0 30px ${color}00`,
          ],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {icon}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold mb-2 text-slate-800 dark:text-white"
      >
        Workshop Complete!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-slate-600 dark:text-slate-400 mb-8"
      >
        Your family has completed{" "}
        <span className="font-bold" style={{ color }}>
          {title}
        </span>
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-4 justify-center"
      >
        <button className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors">
          Download Certificate
        </button>
        <button
          className="px-6 py-3 rounded-full font-medium text-white shadow-lg"
          style={{ backgroundColor: color }}
        >
          Next Workshop
        </button>
      </motion.div>
    </motion.div>
  );
};
