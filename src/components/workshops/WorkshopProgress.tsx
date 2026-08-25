import { motion } from "framer-motion";

interface Props {
  progress: number;
  color: string;
}

export const WorkshopProgress = ({ progress, color }: Props) => {
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-slate-500 dark:text-slate-400">Progress</span>
        <span className="font-medium" style={{ color }}>
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};
