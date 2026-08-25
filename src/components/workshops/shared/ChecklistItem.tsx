import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  text: string;
  icon: string;
  onToggle: (checked: boolean) => void;
  color: string;
}

export const ChecklistItem = ({ text, icon, onToggle, color }: Props) => {
  const [checked, setChecked] = useState(false);

  const handleToggle = () => {
    const newState = !checked;
    setChecked(newState);
    onToggle(newState);
  };

  return (
    <motion.button
      onClick={handleToggle}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
        checked
          ? "border-green-400 bg-green-50 dark:bg-green-900/20"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#4FD1C5]"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
          checked ? "bg-green-400 text-white" : "bg-slate-100 dark:bg-slate-700"
        }`}
        animate={checked ? { rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] } : {}}
      >
        {checked ? "" : icon}
      </motion.div>
      <span
        className={`flex-1 font-medium ${
          checked
            ? "text-green-700 dark:text-green-400 line-through"
            : "text-slate-700 dark:text-slate-300"
        }`}
      >
        {text}
      </span>
    </motion.button>
  );
};
