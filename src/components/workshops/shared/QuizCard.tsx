import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onComplete: (correct: boolean) => void;
  color: string;
}

export const QuizCard = ({
  question,
  options,
  correctIndex,
  explanation,
  onComplete,
  color,
}: Props) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
    onComplete(index === correctIndex);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-slate-800 dark:text-white">
        {question}
      </h4>

      <div className="space-y-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleSelect(index)}
            className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
              showResult
                ? index === correctIndex
                  ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                  : index === selected
                  ? "border-red-400 bg-red-50 dark:bg-red-900/20"
                  : "border-slate-200 dark:border-slate-700 opacity-50"
                : "border-slate-200 dark:border-slate-700 hover:border-[#4FD1C5] bg-white dark:bg-slate-800"
            }`}
            whileHover={!showResult ? { scale: 1.02 } : {}}
            whileTap={!showResult ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  showResult
                    ? index === correctIndex
                      ? "bg-green-400 text-white"
                      : index === selected
                      ? "bg-red-400 text-white"
                      : "bg-slate-200 dark:bg-slate-700"
                    : "bg-slate-100 dark:bg-slate-700"
                }`}
              >
                {showResult && index === correctIndex
                  ? ""
                  : showResult && index === selected
                  ? ""
                  : String.fromCharCode(65 + index)}
              </div>
              <span className="text-slate-700 dark:text-slate-300">
                {option}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-xl ${
              selected === correctIndex
                ? "bg-green-50 dark:bg-green-900/20"
                : "bg-amber-50 dark:bg-amber-900/20"
            }`}
          >
            <p className="text-sm">
              <span className="font-bold">
                {selected === correctIndex ? " Correct! " : " Not quite. "}
              </span>
              {explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
