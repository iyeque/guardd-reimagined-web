import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  Box,
  Copy,
  Check,
  Upload,
  AlertTriangle,
  Loader2,
  Download,
} from "lucide-react";
import {
  buildTransferBlob,
  previewBlob,
  decodeBlob,
  applyTransferBlob,
  type TransferBlob,
  type TransferPreview,
  type ImportMode,
  MAX_QR_UTF8_BYTES,
} from "@/lib/crossDeviceSync";

type Step = "preview" | "import";

const ProfileTransfer = () => {
  const [step, setStep] = useState<Step>("preview");
  const [blob, setBlob] = useState<TransferBlob | null>(null);
  const [preview, setPreview] = useState<TransferPreview | null>(null);
  const [pasteCode, setPasteCode] = useState("");
  const [importMode, setImportMode] = useState<"replace" | "merge">("replace");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    writtenProfiles: number;
    writtenKeys: number;
    errors: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const textRef = useRef<HTMLTextAreaElement | null>(null);

  const regenerate = useCallback(() => {
    const b = buildTransferBlob();
    setBlob(b);
    setPreview(previewBlob(b));
  }, []);

  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const handleCopy = async () => {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview.encodedString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable in some contexts — silently fail.
    }
  };

  const handlePasteChange = (code: string) => {
    setPasteCode(code);
    setImportError(null);
    if (!code.trim()) {
      setPreview(null);
      return;
    }
    const decoded = decodeBlob(code);
    if (!decoded) {
      setPreview(null);
      setImportError("Not a valid transfer code.");
      return;
    }
    setPreview(previewBlob(decoded));
  };

  const handleImport = () => {
    const code = pasteCode.trim();
    if (!code) return;
    const decoded = decodeBlob(code);
    if (!decoded) {
      setImportError("Not a valid transfer code.");
      return;
    }
    setImporting(true);
    setImportError(null);
    // Defer side effects to avoid React state mutation during render.
    setTimeout(() => {
      try {
        const r = applyTransferBlob(decoded, importMode);
        setImportResult(r);
        setImporting(false);
        if (r.errors.length > 0) setImportError(r.errors.join("; "));
      } catch (err) {
        setImportError(String(err));
        setImporting(false);
      }
    }, 0);
  };

  // ---- Preview (export) step ----
  if (step === "preview" && preview) {
    const canQr = preview.encodedSizeBytes <= MAX_QR_UTF8_BYTES;

    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Transfer profiles
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Export your profiles and their local data to a single transfer
              code. Scan the QR or copy the code on another device, then import
              it there.
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              This code is not encrypted. Anyone with the code or a photo of the
              QR can import your profiles and local data. Only share it with
              people you trust.
            </div>
          </div>

          {/* Export card */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-[#4FD1C5]" />
                Export (this device)
              </h2>
              <button
                onClick={regenerate}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Refresh
              </button>
            </div>

            {/* Summary */}
            <div className="flex gap-4 mb-4 text-sm">
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  Profiles:
                </span>{" "}
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {preview.profileCount}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">
                  Local keys:
                </span>{" "}
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {preview.scopedKeyCount}
                </span>
              </div>
              {preview.currentProfileId && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Current:
                  </span>{" "}
                  <span className="font-medium text-slate-800 dark:text-slate-200 font-mono text-xs">
                    {preview.currentProfileId.slice(0, 8)}…
                  </span>
                </div>
              )}
            </div>

            {/* Profile + key detail */}
            {preview.scopedKeyDetails.length > 0 && (
              <div className="mb-4 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                {preview.scopedKeyDetails.map((d) => (
                  <div key={d.profileId} className="flex gap-2">
                    <span className="font-mono text-slate-400 w-24 truncate">
                      {d.profileId.slice(0, 8)}…
                    </span>
                    <span className="font-mono text-slate-400">
                      {d.keyCount} key{d.keyCount === 1 ? "" : "s"}:{" "}
                      {d.exampleKeys.join(", ")}
                      {d.exampleKeys.length < d.keyCount ? ` +${d.keyCount - d.exampleKeys.length} more` : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* QR + code */}
            <div className="space-y-4">
              {canQr && blob ? (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <QRCodeSVG
                      value={preview.encodedString}
                      size={220}
                      level="M"
                      bgColor="white"
                      fgColor="#0f172a"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/40 px-4 py-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    Transfer code is too large for a single QR.
                    <br />
                    Copy the code below instead.
                  </div>
                </div>
              )}

              {/* Text area with copy */}
              <div className="relative">
                <textarea
                  readOnly
                  value={preview.encodedString}
                  ref={textRef}
                  className="w-full h-28 text-xs font-mono bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
                  spellCheck={false}
                />
                <button
                  onClick={handleCopy}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-400 text-center">
                Code is {preview.encodedSizeBytes.toLocaleString()} bytes
                {canQr ? " — fits in one QR" : " — too large for one QR, use copy"}
              </p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Device-level settings (theme, cookie consent, game score) are not
            included. Each device keeps its own.
          </div>
        </div>
      </div>
    );
  }

  // ---- Import step ----
  if (step === "import") {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 pt-28 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => setStep('preview')}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to export
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Import profiles
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Paste the transfer code from another device, or scan the QR there.
              Choose how to apply it below.
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
              Importing will write the sender's profiles and local data to this
              device.{" "}
              <strong className="font-semibold">
                Replace mode wipes your existing profile data first.
              </strong>{" "}
              Merge keeps your existing device-only profiles and adds new ones
              from the sender.
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <h2 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Box className="w-4 h-4 text-[#4FD1C5]" />
                Source preview
              </h2>

              <div className="flex gap-4 mb-4 text-sm">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Profiles:
                  </span>{" "}
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {preview.profileCount}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">
                    Local keys:
                  </span>{" "}
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {preview.scopedKeyCount}
                  </span>
                </div>
                {preview.currentProfileId && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">
                      Current:
                    </span>{" "}
                    <span className="font-medium text-slate-800 dark:text-slate-200 font-mono text-xs">
                      {preview.currentProfileId.slice(0, 8)}…
                    </span>
                  </div>
                )}
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                {preview.scopedKeyDetails.map((d) => (
                  <div key={d.profileId} className="flex gap-2">
                    <span className="font-mono text-slate-400 w-24 truncate">
                      {d.profileId.slice(0, 8)}…
                    </span>
                    <span className="font-mono text-slate-400">
                      {d.keyCount} key{d.keyCount === 1 ? "" : "s"}:{" "}
                      {d.exampleKeys.join(", ")}
                      {d.exampleKeys.length < d.keyCount ? ` +${d.keyCount - d.exampleKeys.length} more` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paste input */}
          <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2 block">
              Transfer code
            </label>
            <textarea
              value={pasteCode}
              onChange={(e) => handlePasteChange(e.target.value)}
              className="w-full h-32 text-xs font-mono bg-white border border-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#4FD1C5]"
              placeholder="Paste the code here, or scan the QR on the exporting device"
            />
            {importError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {importError}
              </p>
            )}
          </div>

          {/* Mode choice (only if there is a preview to import) */}
          {preview && (
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4">
                How to apply
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    importMode === "replace"
                      ? "border-[#4FD1C5] bg-[#4FD1C5]/5 dark:bg-[#4FD1C5]/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === "replace"}
                    onChange={() => setImportMode("replace")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Replace (recommended)
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Clears existing profile data on this device, then writes
                      everything from the source. Use this when moving to a new
                      device or restoring from a backup.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    importMode === "merge"
                      ? "border-[#4FD1C5] bg-[#4FD1C5]/5 dark:bg-[#4FD1C5]/10"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === "merge"}
                    onChange={() => setImportMode("merge")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      Merge
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Adds profiles that don't exist here and updates existing
                      profiles' local keys. Keeps your current device-only
                      profiles and device-level settings. Existing profiles with
                      the same id are overwritten with the source version.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Error */}
          {importError && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300">
              {importError}
            </div>
          )}

          {/* Import result */}
          {importResult && (
            <div className="mb-6 p-4 rounded-2xl bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800/40 text-sm text-green-800 dark:text-green-300">
              Imported {importResult.writtenProfiles} profile
              {importResult.writtenProfiles === 1 ? "" : "s"} and{" "}
              {importResult.writtenKeys} local key{importResult.writtenKeys === 1 ? "" : "s"}.
              {importResult.errors.length > 0 && (
                <span className="block mt-1 text-amber-700 dark:text-amber-300">
                  Note: {importResult.errors.join(", ")}
                </span>
              )}
            </div>
          )}

          {/* Action */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep("preview")}
              className="flex-1 px-4 py-3 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!pasteCode.trim() || importing}
              className="flex-1 px-4 py-3 text-sm font-bold rounded-xl bg-[#4FD1C5] text-white hover:bg-[#4FD1C5]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Importing…
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Import
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProfileTransfer;
