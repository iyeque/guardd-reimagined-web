import { useState } from "react";
import { motion } from "framer-motion";

interface Props {
  prompt: string;
  onSave: (response: string) => void;
  color: string;
}

export const ReflectionBox = ({ prompt, onSave, color }: Props) => {
  const [response, setResponse] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (response.trim()) {
      onSave(response);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-700 dark:text-slate-300 italic">{prompt}</p>

      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder="Write your thoughts here..."
        className="w-full p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-[#4FD1C5] outline-none resize-none h-32 text-slate-700 dark:text-slate-300 transition-colors"
      />

      <motion.button
        onClick={handleSave}
        className="px-6 py-3 rounded-full font-medium text-white shadow-lg"
        style={{ backgroundColor: color }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {saved ? " Saved!" : "Save Reflection"}
      </motion.button>
    </div>
  );
};
