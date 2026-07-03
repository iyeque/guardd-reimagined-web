import { db } from "../server/db.js";
import { faqChunks } from "../shared/schema.js";

const seed = [
  {
    category: "breathing",
    title: "4-7-8 Breathing Exercise",
    content:
      "Breathe in through your nose for 4 counts, hold for 7 counts, and exhale slowly through your mouth for 8 counts. This activates the parasympathetic nervous system and reduces cortisol. Practice 3 rounds when you feel overwhelmed.",
  },
  {
    category: "breathing",
    title: "Box Breathing for Kids",
    content:
      "Imagine tracing a square. Inhale for 4, hold for 4, exhale for 4, rest for 4. Great for pre-homework anxiety or before a big presentation.",
  },
  {
    category: "agreement",
    title: "Family Digital Agreement",
    content:
      "A written family plan covering: device-free times (dinner, rides), app limits, privacy rules, and consequences. Research shows consistent agreements reduce conflict by 40% versus ad-hoc rules.",
  },
  {
    category: "agreement",
    title: "Accountability Check-Ins",
    content:
      "Schedule a 5-minute weekly huddle to review screen-time compliance, adjust limits, and celebrate wins. Treat it like a family budget meeting.",
  },
  {
    category: "quiz",
    title: "Cyber-Safe Quiz Overview",
    content:
      "The interactive quiz covers phishing recognition, password hygiene, oversharing risks, and app permissions. Available in the app's Educational Games section.",
  },
  {
    category: "quiz",
    title: "Phishing Red Flags",
    content:
      "Check sender address carefully, hover before clicking, never enter credentials from an email link. When in doubt, type the known URL directly into your browser.",
  },
  {
    category: "screen-time",
    title: "20-20-20 Rule",
    content:
      "Every 20 minutes, look at something 20 feet away for 20 seconds. Reduces digital eye strain and headaches during school or work.",
  },
  {
    category: "screen-time",
    title: "Screen-Time Reports",
    content:
      "Weekly summaries help parents understand usage patterns. If daily average exceeds 4 hours on school days, consider co-viewing alternatives or moving entertainment apps to a common area.",
  },
  {
    category: "roadmap",
    title: "WellnessCompanion v2.0",
    content:
      "The AI assistant seeds from in-app content: breathing exercises, agreement builder tips, quiz explanations, and curated events. Always sourced from the app itself.",
  },
];

async function main() {
  await db.insert(faqChunks).values(seed);
  console.log(`Seeded ${seed.length} FAQ chunks.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
