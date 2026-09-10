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
  const [familyName, setFamilyName] = useState("");
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
      const html2pdfOpt = {
        margin: 0,
        filename: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-certificate.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" as const },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      await html2pdf().set(html2pdfOpt).from(element).save();
    } catch (error) {
      console.error("Failed to generate certificate", error);
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Certificate of Completion - ${title}`,
      text: `I just completed the "${title}" workshop with ${familyName || "my family"}! 🎉`,
      url: window.location.origin + "/workshops",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n${shareData.url}`
        );
        alert("Certificate link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed", error);
    }
  };

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + "/workshops")}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just completed the "${title}" workshop with ${familyName || "my family"}! 🎉`)}&url=${encodeURIComponent(window.location.origin + "/workshops")}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + "/workshops")}`,
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
          className="flex flex-wrap gap-3 justify-center mb-8"
        >
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors"
          >
            {downloading ? "Generating..." : "Download Certificate"}
          </button>
          <button
            onClick={handleShare}
            className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors"
          >
            Share
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
          className="max-w-5xl mx-auto text-left mb-8"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              Family / Recipient Name
            </label>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Enter family or recipient name"
              className="w-full md:w-1/2 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:border-[#4FD1C5] outline-none"
            />
          </div>

          <div
            ref={certificateRef}
            className="p-8 bg-white dark:bg-slate-900 overflow-hidden"
            style={{
              width: "11in",
              height: "8.5in",
              borderColor: color,
              borderWidth: "2px",
              borderStyle: "solid",
              borderRadius: "0px",
            }}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-center mb-6">
                <img
                  src="/dg-logo.png"
                  alt="Digital Guardian"
                  className="h-12 w-auto object-contain"
                />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between gap-8 flex-grow">
                <div className="flex-1 text-center md:text-left">
                  <div className="text-5xl mb-3">🏅</div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Certificate of Completion
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    This certifies that
                  </p>
                  <p className="text-xl font-bold mt-1 text-slate-800 dark:text-white">
                    {familyName || "________________________"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    has completed
                  </p>
                  <p className="text-2xl font-bold mt-1" style={{ color }}>
                    {title}
                  </p>
                </div>
                <div className="flex-shrink-0 text-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    Completion Date
                  </div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white mt-1">
                    {new Date().toLocaleDateString()}
                  </div>
                  <div className="mt-4">
                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-3xl" style={{ backgroundColor: color }}>
                      {icon}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Guardian-Digital Wellness Workshop
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="max-w-5xl mx-auto flex flex-wrap gap-3 justify-center mb-10"
        >
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors"
          >
            LinkedIn
          </a>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors"
          >
            X / Twitter
          </a>
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors"
          >
            Facebook
          </a>
        </motion.div>
      </motion.div>
    </>
  );
};
