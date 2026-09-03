// Phase 4 helper: prepare course audio assets and metadata for voice-cloning generation.
//
// Recommended workflow:
// 1. Draft narration with Kokoro-based local CPU generation.
// 2. Refine cloned voice with Step Audio EditX or equivalent.
// 3. Export per-module MP3/WAV to public/course-assets/audio/.
// 4. Run this script to verify manifest mapping and generate a module audio index.
// 5. Continue to avatar/lipsync phase.
//
// Usage:
//   node scripts/generate-course-audio.mjs
//   node scripts/generate-course-audio.mjs --check-only

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const manifestPath = resolve(projectRoot, "public/course-assets/manifest.json");
const audioIndexPath = resolve(projectRoot, "public/course-assets/audio/index.json");

const checkOnly = process.argv.includes("--check-only");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const modules = manifest.modules || [];

const modulesWithoutAssets = modules.filter((m) => {
  const audioRel = (m.assets && m.assets.audio) || "";
  const audioAbs = resolve(projectRoot, `public${audioRel}`);
  return !existsSync(audioAbs);
});

if (modulesWithoutAssets.length > 0) {
  console.log(`Missing audio assets: ${modulesWithoutAssets.map((m) => m.id).join(", ")}`);
  if (!checkOnly) {
    console.log("Creating placeholder audio index for missing assets.");
    const index = modulesWithoutAssets.map((m) => ({
      id: m.id,
      title: m.title,
      audio: m.assets.audio,
      status: "missing",
      notes: "Generate narration audio and place at the path above.",
    }));
    writeFileSync(audioIndexPath, JSON.stringify({ generatedAt: new Date().toISOString(), modules: index }, null, 2));
    console.log(`Wrote audio index to ${audioIndexPath}`);
  }
} else {
  console.log("All manifest audio paths exist.");
  if (!checkOnly) {
    const index = modules.map((m) => ({
      id: m.id,
      title: m.title,
      audio: m.assets.audio,
      status: "ready",
    }));
    writeFileSync(audioIndexPath, JSON.stringify({ generatedAt: new Date().toISOString(), modules: index }, null, 2));
    console.log(`Wrote audio index to ${audioIndexPath}`);
  }
}

console.log("Phase 4 audio preparation complete.");
