// Lightweight local audio stub/index helper.
//
// Purpose:
// - Generate placeholder artifacts and an audio index from course media assets.
// - Keep CPU usage minimal on this laptop.
// - Do NOT perform heavy voice cloning here; use remote GPU for that.
//
// Usage:
//   node media-tools/scripts/generate-audio-stubs.mjs
//   node media-tools/scripts/generate-audio-stubs.mjs --check-only

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "../..");
const manifestPath = resolve(projectRoot, "public/course-assets/manifest.json");
const mediaAudioIndexPath = resolve(projectRoot, "media-tools/audio/index.json");

const checkOnly = process.argv.includes("--check-only");

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const modules = manifest.modules || [];

const missing = modules.filter((m) => {
  const rel = (m.assets && m.assets.audio) || "";
  return !existsSync(resolve(projectRoot, `public${rel}`));
});

if (missing.length > 0) {
  console.log(`Missing audio assets: ${missing.map((m) => m.id).join(", ")}`);
  if (!checkOnly) {
    const index = missing.map((m) => ({
      id: m.id,
      title: m.title,
      audio: m.assets.audio,
      status: "stub",
      notes: "Generate narration on remote GPU or local TTS tooling, then place at path above.",
    }));
    writeFileSync(mediaAudioIndexPath, JSON.stringify({ generatedAt: new Date().toISOString(), modules: index }, null, 2));
    console.log(`Wrote media audio index to ${mediaAudioIndexPath}`);
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
    writeFileSync(mediaAudioIndexPath, JSON.stringify({ generatedAt: new Date().toISOString(), modules: index }, null, 2));
    console.log(`Wrote media audio index to ${mediaAudioIndexPath}`);
  }
}

console.log("Local audio stub/index complete.");
