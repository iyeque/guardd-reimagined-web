import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Confetti } from "./Confetti";

interface Props {
  title: string;
  icon: string;
  color: string;
}

export const CompletionBadge = ({ title, icon, color }: Props) => {
  const [downloading, setDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDownloading(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleDownload = async () => {
    if (!certificateRef.current || downloading) return;
    setDownloading(true);
    try {
      const [{ default: html2pdf }, { default: saveAs }] = await Promise.all([
        import("html2pdf.js"),
        import("file-saver"),
      ]);

      const element = certificateRef.current;
      const opt = {
        margin: 0.5,
        filename: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-certificate.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      } as any;

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Failed to generate certificate", error);
      setDownloading(false);
    }
  };

  return (
    <>
      <Confetti />
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 1 }}
        className="text-center py-12 px-4"
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
          Workshop Complete! 🎉
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
          className="flex flex-wrap gap-4 justify-center mb-10"
        >
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors"
          >
            {downloading ? "Generating..." : "Download Certificate"}
          </button>
          <button
            onClick={() => (window.location.href = "/workshops")}
            className="px-6 py-3 rounded-full font-medium text-white shadow-lg"
            style={{ backgroundColor: color }}
          >
            Next Workshop
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-2xl mx-auto text-left"
        >
          <div
            ref={certificateRef}
            className="p-8 rounded-3xl border-2 bg-white dark:bg-slate-900"
            style={{ borderColor: color }}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🏅</div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                Certificate of Completion
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                This certifies that a family completed
              </p>
              <p className="text-xl font-bold mt-1" style={{ color }}>
                {title}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Date: {new Date().toLocaleDateString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Guardian-Digital Wellness Workshop
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
