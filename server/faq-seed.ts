import { db } from "./db.js";
import { faqChunks } from "../shared/schema.js";

export const faqSeed = [
  // Core hero actions / immediate FAQ topics
  { category: "breathing", title: "4-7-8 Breathing Exercise", content: "Breathe in through your nose for 4 counts, hold for 7 counts, and exhale slowly through your mouth for 8 counts. This activates the parasympathetic nervous system and reduces cortisol. Practice 3 rounds when you feel overwhelmed." },
  { category: "breathing", title: "Box Breathing for Kids", content: "Imagine tracing a square. Inhale for 4, hold for 4, exhale for 4, rest for 4. Great for pre-homework anxiety or before a big presentation." },
  { category: "breathing", title: "Three Deep Breaths Together", content: "A family reset: one person leads, everyone follows. Inhale through the nose, exhale through the mouth. Works well before transitions like dinner, homework, or bedtime." },
  { category: "agreement", title: "Family Digital Agreement", content: "A written family plan covering: device-free times (dinner, rides), app limits, privacy rules, and consequences. Research shows consistent agreements reduce conflict by 40% versus ad-hoc rules." },
  { category: "agreement", title: "Accountability Check-Ins", content: "Schedule a 5-minute weekly huddle to review screen-time compliance, adjust limits, and celebrate wins. Treat it like a family budget meeting." },
  { category: "agreement", title: "Device-Free Family Walk", content: "Plan a short walk with no phones. Use it to practice presence, conversation, and conflict de-escalation. Even 15 minutes can improve mood and reduce background stress." },
  { category: "quiz", title: "Cyber-Safe Quiz Overview", content: "The interactive quiz covers phishing recognition, password hygiene, oversharing risks, and app permissions. Available in the app's Educational Games section." },
  { category: "quiz", title: "Phishing Red Flags", content: "Check sender address carefully, hover before clicking, never enter credentials from an email link. When in doubt, type the known URL directly into your browser." },
  { category: "screen-time", title: "20-20-20 Rule", content: "Every 20 minutes, look at something 20 feet away for 20 seconds. Reduces digital eye strain and headaches during school or work." },
  { category: "screen-time", title: "Screen-Time Reports", content: "Weekly summaries help parents understand usage patterns. If daily average exceeds 4 hours on school days, consider co-viewing alternatives or moving entertainment apps to a common area." },
  { category: "digital-wellness", title: "Digital Wellness", content: "Digital wellness means using technology intentionally, not compulsively. It includes boundaries, recovery habits, critical thinking about content, and protecting attention as a finite resource." },
  { category: "mental-health", title: "Digital Mental Health Basics", content: "Frequent notifications can raise baseline anxiety. Mindful usage, app limits, and screen-free zones support emotional regulation and reduce compulsive checking." },
  { category: "video", title: "Wellness Video Library", content: "Curated short-form videos on digital wellness topics suitable for family viewing. Use them as discussion starters rather than passive content." },
  { category: "roadmap", title: "WellnessCompanion v2.0", content: "The AI assistant seeds from in-app content: breathing exercises, agreement builder tips, quiz explanations, and curated events. Always sourced from the app itself." },

  // Basic definitions / common questions outside current RAG
  { category: "safety", title: "What Is Bullying?", content: "Bullying is repeated, intentional aggression involving a power imbalance. It can be physical, verbal, social, or online. Cyberbullying extends this to digital platforms and can be relentless because content persists and spreads quickly." },
  { category: "safety", title: "What Is Cyberbullying?", content: "Cyberbullying is bullying using digital tools: social media, messages, games, or apps. Warning signs include sudden device avoidance, mood changes after using devices, secretive behavior, and withdrawal from friends or family." },
  { category: "safety", title: "How to Respond to Cyberbullying", content: "Do not engage or retaliate. Save evidence, adjust privacy settings, block the harasser, and report via platform tools. For serious threats or sexual exploitation, contact school officials or law enforcement." },
  { category: "safety", title: "What Is a Digital Footprint?", content: "A digital footprint is the trail of data you leave online: posts, comments, likes, searches, and shared locations. Future employers, schools, and relationships often review this data." },
  { category: "privacy", title: "Privacy Settings Starter Checklist", content: "Review location sharing, ad tracking, photo visibility, and connected apps. Treat apps as guests in your digital home: revoke access you no longer recognize or need." },
  { category: "citizenship", title: "Digital Citizenship Basics", content: "Good digital citizenship means respecting others online, protecting personal information, evaluating content critically, and understanding that online actions have offline consequences." },
  { category: "critical-thinking", title: "How to Spot Misinformation", content: "Check source, date, and evidence before sharing. Look for emotional manipulation, missing citations, and confirmation bias. Fact-checking and lateral reading are reliable defenses." },
  { category: "mental-health", title: "Doomscrolling and Mood", content: "Doomscrolling is compulsive consumption of negative news. It raises anxiety and disrupts sleep. Counter it with time limits, topic filters, and intentional positive or neutral breaks." },
  { category: "safety", title: "Grooming Warning Signs", content: "Grooming behaviors include secrecy about online friends, sudden gifts or attention from unknown adults, pressure to share private images, and requests to move conversations to private platforms." },
  { category: "safety", title: "What Is Phishing?", content: "Phishing is a social engineering attack that tricks people into revealing passwords, payment details, or personal data. It often arrives by email, SMS, or messaging apps with urgent language and fake login pages." },
  { category: "grounding", title: "When the Chat Doesn’t Have an Answer", content: "If no specific answer is found, this assistant will say so honestly and suggest related topics such as digital safety, screen-time agreements, breathing exercises, or the Cyber-Safe Quiz." },
];

export async function ensureFaqChunks() {
  try {
    const existing = await db.select().from(faqChunks);
    if (existing.length === 0) {
      await db.insert(faqChunks).values(faqSeed);
      console.log(`[faq] auto-seeded ${faqSeed.length} chunks`);
    } else {
      console.log(`[faq] ${existing.length} chunks already present`);
    }
  } catch (err) {
    console.error("[faq] ensureFaqChunks failed:", err);
  }
}
