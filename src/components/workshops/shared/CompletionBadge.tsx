import { motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { Confetti } from "./Confetti";

interface Props {
  title: string;
  icon: string;
  color: string;
}

export const CompletionBadge = ({ title, icon, color }: Props) => {
  const [downloading, setDownloading] = useState(false);
  const [copying, setCopying] = useState(false);
  const [familyName, setFamilyName] = useState("");
  const [sharePlatform, setSharePlatform] = useState<"linkedin" | "twitter" | "facebook" | null>(null);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDownloading(false);
        setCopying(false);
        setSharePlatform(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Generate a PNG blob of the certificate for clipboard / download
  const renderCertToPng = useCallback(async (): Promise<Blob | null> => {
    if (!certificateRef.current) return null;
    try {
      const [{ default: html2pdf }, { default: html2canvas }] = await Promise.all([
        import("html2pdf.js"),
        import("html2canvas"),
      ]);
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: certificateRef.current.offsetWidth,
        height: certificateRef.current.offsetHeight,
        logging: false,
      });
      return new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/png", 0.98);
      });
    } catch (err) {
      console.error("Failed to render certificate PNG", err);
      return null;
    }
  }, []);

  const handleDownloadPdf = async () => {
    if (!certificateRef.current || downloading) return;
    setDownloading(true);
    try {
      const [{ default: html2pdf }, { default: saveAs }] = await Promise.all([
        import("html2pdf.js"),
        import("file-saver"),
      ]);
      await html2pdf()
        .set({
          margin: 0,
          filename: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-certificate.pdf`,
          image: { type: "jpeg" as const, quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: "in", format: "a4", orientation: "landscape" as const },
        })
        .from(certificateRef.current)
        .save();
    } catch (error) {
      console.error("Failed to generate certificate PDF", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!certificateRef.current || downloading) return;
    setDownloading(true);
    try {
      const blob = await renderCertToPng();
      if (!blob) throw new Error("PNG generation failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-certificate.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download certificate PNG", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyImage = async () => {
    if (copying) return;
    setCopying(true);
    try {
      const blob = await renderCertToPng();
      if (!blob) throw new Error("PNG generation failed");
      if (!navigator.clipboard?.write) {
        throw new Error("Clipboard image API not supported");
      }
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopying(false);
      setSharePlatform(null);
    } catch (err) {
      console.error("Failed to copy certificate image", err);
      setCopying(false);
      setSharePlatform(null);
    }
  };

  const captionTemplates: Record<
    "linkedin" | "twitter" | "facebook",
    (name: string, workshop: string) => string
  > = {
    linkedin: (name, workshop) =>
      `I'm proud to share that ${name} has completed the "${workshop}" workshop with Digital Guardian! 🎓\n\nThis family digital wellness program covered essential topics in online safety, screen time balance, and building healthy digital habits together.\n\nGrateful for the journey and looking forward to putting these skills into practice. #DigitalWellness #FamilySafety #OnlineSecurity`,
    twitter: (name, workshop) =>
      `🎉 ${name} just completed the "${workshop}" workshop with @DigitalGuardian! \n\nFamily digital wellness = stronger online habits. #DigitalWellness #FamilyFirst`,
    facebook: (name, workshop) =>
      `So proud of ${name} for completing the "${workshop}" workshop with Digital Guardian! 🎉\n\nWe learned so much about staying safe online, managing screen time, and building healthy digital habits as a family. Highly recommend this program to other families! 💙`,
  };

  const handleShare = async () => {
    const name = familyName || "my family";
    const shareData = {
      title: `Certificate of Completion - ${title}`,
      text: captionTemplates.twitter(name, title),
      url: window.location.origin + "/workshops",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.title}\n\n${shareData.text}\n${shareData.url}`
        );
        alert("Certificate caption copied to clipboard!");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Share failed", error);
      }
    }
  };

  const openShareLink = (platform: "linkedin" | "twitter" | "facebook") => {
    const name = familyName || "my family";
    const caption = captionTemplates[platform](name, title);
    let url: string;
    if (platform === "linkedin") {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + "/workshops")}`;
    } else if (platform === "twitter") {
      url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(window.location.origin + "/workshops")}`;
    } else {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + "/workshops")}&quote=${encodeURIComponent(caption)}`;
    }
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=500");
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
        {/* Decorative top badge */}
        <motion.div
          className="w-28 h-28 mx-auto rounded-full flex items-center justify-center text-5xl mb-6 shadow-2xl ring-4 ring-white dark:ring-slate-900"
          style={{ backgroundColor: color }}
          animate={{
            boxShadow: [
              `0 0 0 0px ${color}50`,
              `0 0 0 35px ${color}00`,
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          {icon}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold mb-2 text-slate-800 dark:text-white tracking-tight"
        >
          Workshop Complete! 🎉
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-600 dark:text-slate-400 mb-8 text-lg"
        >
          Your family has completed{" "}
          <span className="font-bold" style={{ color }}>
            {title}
          </span>
        </motion.p>

        {/* Action buttons row 1 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-wrap gap-3 justify-center mb-8"
        >
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors flex items-center gap-2"
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Generating...
              </>
            ) : (
              "Download PDF"
            )}
          </button>
          <button
            onClick={handleDownloadPng}
            disabled={downloading}
            className="px-6 py-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors flex items-center gap-2"
          >
            {downloading ? "Generating..." : "Download Image"}
          </button>
          <button
            onClick={() => (window.location.href = "/workshops")}
            className="px-6 py-3 rounded-full font-medium text-white shadow-lg"
            style={{ backgroundColor: color }}
          >
            Next Workshop
          </button>
        </motion.div>

        {/* Certificate preview card — improved layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-5xl mx-auto text-left mb-8"
        >
          {/* Name input */}
          <div className="mb-5">
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

          {/* Certificate */}
          <div
            ref={certificateRef}
            className="relative overflow-hidden"
            style={{
              width: "11in",
              height: "8.5in",
              maxWidth: "100%",
            }}
          >
            {/* Decorative border */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                border: `12px solid ${color}`,
                boxShadow: `inset 0 0 0 4px #fff, inset 0 0 0 8px ${color}40`,
              }}
            />
            {/* Inner decorative thin border */}
            <div
              className="absolute inset-4 pointer-events-none"
              style={{
                border: "1px solid " + color,
                opacity: 0.5,
              }}
            />

            {/* Background watermark pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-5"
              style={{
                background: `radial-gradient(circle at 20% 30%, ${color} 0%, transparent 50%), radial-gradient(circle at 80% 70%, ${color} 0%, transparent 50%)`,
              }}
            />

            <div className="absolute inset-0 flex flex-col justify-between p-12 md:p-16">
              {/* Top: Logo — prominent and centered */}
              <div className="text-center">
                <img
                  src="/dg-logo.png"
                  alt="Digital Guardian"
                  className="h-20 w-auto object-contain mx-auto"
                  style={{ maxHeight: "120px" }}
                />
                <div
                  className="mt-4 text-xs uppercase tracking-[0.25em] font-bold"
                  style={{ color }}
                >
                  Digital Guardian
                </div>
              </div>

              {/* Center: Title + recipient (largest element) */}
              <div className="text-center flex-grow flex flex-col justify-center">
                <div className="text-4xl md:text-5xl font-serif font-bold text-slate-800 dark:text-white mb-2 tracking-wide">
                  Certificate of Completion
                </div>
                <div className="w-24 h-0.5 mx-auto mb-6" style={{ backgroundColor: color }} />
                <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 font-medium">
                  This certifies that
                </p>
                <p
                  className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mt-1 break-words"
                  style={{ color }}
                >
                  {familyName || "________________________"}
                </p>
                <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-4 mb-1 font-medium">
                  has successfully completed
                </p>
                <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mt-1" style={{ color }}>
                  {title}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
                  a Digital Guardian Family Wellness Workshop
                </p>
              </div>

              {/* Bottom: date + decorative seal */}
              <div className="flex items-end justify-between">
                {/* Date, left */}
                <div className="text-left">
                  <div className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Date of Completion
                  </div>
                  <div className="text-lg font-bold text-slate-800 dark:text-white">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
                {/* Seal / badge, right */}
                <div className="text-right">
                  <div
                    className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl shadow-xl ring-2 ring-white dark:ring-slate-900"
                    style={{ backgroundColor: color }}
                  >
                    {icon}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 font-medium">
                    Guardian Digital Wellness
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action buttons row 2 — social share with caption templates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="max-w-5xl mx-auto flex flex-wrap gap-3 justify-center mb-10"
        >
          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors"
          >
            Share Caption (Copy)
          </button>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openShareLink("linkedin");
            }}
            className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors flex items-center gap-2"
          >
            LinkedIn
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openShareLink("twitter");
            }}
            className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors flex items-center gap-2"
          >
            X / Twitter
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openShareLink("facebook");
            }}
            className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors flex items-center gap-2"
          >
            Facebook
          </a>
          <button
            onClick={handleCopyImage}
            disabled={copying}
            className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-[#4FD1C5] transition-colors flex items-center gap-2"
          >
            {copying ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Copying...
              </>
            ) : (
              <>Copy Image to Clipboard</>
            )}
          </button>
        </motion.div>
      </motion.div>
    </>
  );
};
