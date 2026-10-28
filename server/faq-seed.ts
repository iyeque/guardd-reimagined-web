import { db } from "./db.js";
import { faqChunks } from "../shared/schema.js";

export const faqSeed = [
  // breathing / regulation
  { category: "breathing", title: "4-7-8 Breathing Exercise", content: "Breathe in through your nose for 4 counts, hold for 7 counts, and exhale slowly through your mouth for 8 counts. This activates the parasympathetic nervous system and reduces cortisol. Practice 3 rounds when you feel overwhelmed." },
  { category: "breathing", title: "Box Breathing for Kids", content: "Imagine tracing a square. Inhale for 4, hold for 4, exhale for 4, rest for 4. Great for pre-homework anxiety or before a big presentation." },
  { category: "breathing", title: "Three Deep Breaths Together", content: "A family reset: one person leads, everyone follows. Inhale through the nose, exhale through the mouth. Works well before transitions like dinner, homework, or bedtime." },

  // agreements / habits
  { category: "agreement", title: "Family Digital Agreement", content: "A written family plan covering: device-free times (dinner, rides), app limits, privacy rules, and consequences. Research shows consistent agreements reduce conflict by 40% versus ad-hoc rules." },
  { category: "agreement", title: "Accountability Check-Ins", content: "Schedule a 5-minute weekly huddle to review screen-time compliance, adjust limits, and celebrate wins. Treat it like a family budget meeting." },
  { category: "agreement", title: "Device-Free Family Walk", content: "Plan a short walk with no phones. Use it to practice presence, conversation, and conflict de-escalation. Even 15 minutes can improve mood and reduce background stress." },

  // quiz / safety basics
  { category: "quiz", title: "Cyber-Safe Quiz Overview", content: "The interactive quiz covers phishing recognition, password hygiene, oversharing risks, and app permissions. Available in the app's Educational Games section." },
  { category: "quiz", title: "Phishing Red Flags", content: "Check sender address carefully, hover before clicking, never enter credentials from an email link. When in doubt, type the known URL directly into your browser." },

  // screen-time / focus
  { category: "screen-time", title: "20-20-20 Rule", content: "Every 20 minutes, look at something 20 feet away for 20 seconds. Reduces digital eye strain and headaches during school or work." },
  { category: "screen-time", title: "Screen-Time Reports", content: "Weekly summaries help parents understand usage patterns. If daily average exceeds 4 hours on school days, consider co-viewing alternatives or moving entertainment apps to a common area." },
  { category: "screen-time", title: "Single-Tasking Over Multitasking", content: "Switching between apps fragments attention. Encourage single-tasking during homework: phone in another room, one tab or notebook at a time." },
  { category: "screen-time", title: "Tech Bedtime Routine", content: "Avoid screens 45-60 minutes before bed. Blue light suppresses melatonin. Replace scrolling with reading, sketching, or quiet conversation." },

  // digital wellness / mental health
  { category: "digital-wellness", title: "Digital Wellness", content: "Digital wellness means using technology intentionally, not compulsively. It includes boundaries, recovery habits, critical thinking about content, and protecting attention as a finite resource." },
  { category: "mental-health", title: "Digital Mental Health Basics", content: "Frequent notifications can raise baseline anxiety. Mindful usage, app limits, and screen-free zones support emotional regulation and reduce compulsive checking." },
  { category: "mental-health", title: "Doomscrolling and Mood", content: "Doomscrolling is compulsive consumption of negative news. It raises anxiety and disrupts sleep. Counter it with time limits, topic filters, and intentional positive or neutral breaks." },
  { category: "mental-health", title: "Comparison and Self-Worth", content: "Curated social media content can distort self-image. Remind kids that highlight reels are edited. Encourage offline activities tied to mastery, not likes." },

  // safety / privacy / citizenship
  { category: "safety", title: "What Is Bullying?", content: "Bullying is repeated, intentional aggression involving a power imbalance. It can be physical, verbal, social, or online. Cyberbullying extends this to digital platforms and can be relentless because content persists and spreads quickly." },
  { category: "safety", title: "What Is Cyberbullying?", content: "Cyberbullying is bullying using digital tools: social media, messages, games, or apps. Warning signs include sudden device avoidance, mood changes after using devices, secretive behavior, and withdrawal from friends or family." },
  { category: "safety", title: "How to Respond to Cyberbullying", content: "Do not engage or retaliate. Save evidence, adjust privacy settings, block the harasser, and report via platform tools. For serious threats or sexual exploitation, contact school officials or law enforcement." },
  { category: "safety", title: "What Is a Digital Footprint?", content: "A digital footprint is the trail of data you leave online: posts, comments, likes, searches, and shared locations. Future employers, schools, and relationships often review this data." },
  { category: "safety", title: "Grooming Warning Signs", content: "Grooming behaviors include secrecy about online friends, sudden gifts or attention from unknown adults, pressure to share private images, and requests to move conversations to private platforms." },
  { category: "safety", title: "What Is Phishing?", content: "Phishing is a social engineering attack that tricks people into revealing passwords, payment details, or personal data. It often arrives by email, SMS, or messaging apps with urgent language and fake login pages." },
  { category: "privacy", title: "Privacy Settings Starter Checklist", content: "Review location sharing, ad tracking, photo visibility, and connected apps. Treat apps as guests in your digital home: revoke access you no longer recognize or need." },
  { category: "privacy", title: "Location Sharing Rules", content: "Disable location tagging by default. Explain that real-time location sharing can reveal routines and home address. If location sharing is used, choose time-limited options." },
  { category: "citizenship", title: "Digital Citizenship Basics", content: "Good digital citizenship means respecting others online, protecting personal information, evaluating content critically, and understanding that online actions have offline consequences." },
  { category: "critical-thinking", title: "How to Spot Misinformation", content: "Check source, date, and evidence before sharing. Look for emotional manipulation, missing citations, and confirmation bias. Fact-checking and lateral reading are reliable defenses." },

  // family / parenting strategies
  { category: "parenting", title: "Modeling Healthy Device Use", content: "Children imitate adult behavior more than they follow rules. Put your own phone away during meals and conversations; model ‘just because I can check doesn’t mean I should.’" },
  { category: "parenting", title: "Co-Viewing and Co-Playing", content: "Watch or play together rather than policing from another room. Ask open-ended questions: 'What do you like about this?' 'How does this character make decisions?'" },
  { category: "parenting", title: "Setting App Limits Without Conflict", content: "Involve kids in setting limits. Explain rationale: sleep, focus, mood. Use timers or built-in app limits instead of surprise takedowns." },
  { category: "parenting", title: "Earned Access vs Punitive Removal", content: "Prefer earned access: chores, reading, or outdoor time unlock screen time. Punitive removal often increases secrecy and reduces trust." },
  { category: "parenting", title: "Talking to Teens About Social Media", content: "Ask about experiences rather than lecturing. Explore privacy settings together, discuss algorithms, and validate that social pressure is real while building critical thinking." },

  // age-specific guidance
  { category: "age-guidance", title: "Under 5: Media Guidelines", content: "Prioritize video calls, co-viewed high-quality content, and hands-on play. Avoid solo scrolling. Keep screens out of bedrooms and bedtime routines." },
  { category: "age-guidance", title: "Ages 6-11: Balanced Media Diet", content: "Combine educational content with creative play and outdoor time. Use consistent limits, family media agreements, and regular check-ins about online experiences." },
  { category: "age-guidance", title: "Tweens and Early Social Access", content: "Introduce social media slowly with high supervision. Discuss digital footprints, oversharing, and peer influence before giving independent access." },
  { category: "age-guidance", title: "Teens: Autonomy With Guardrails", content: "Shift from monitoring to mentoring. Agree on privacy norms, review apps together, and keep the door open for mistakes without immediate punishment." },

  // video / resources
  { category: "video", title: "Wellness Video Library", content: "Curated short-form videos on digital wellness topics suitable for family viewing. Use them as discussion starters rather than passive content." },
  { category: "video", title: "Using Videos as Teaching Moments", content: "Pause to ask questions, challenge claims, and compare on-screen advice with your family values. Active watching builds media literacy." },

  // site navigation / how to use the app
  { category: "navigation", title: "Contact Us", content: "To contact the Digital Guardian Wellness team, visit the Contact page at /contact. You can send a message or reach out about partnerships, feedback, or support. [Contact us](/contact)" },
  { category: "navigation", title: "Family Commitments", content: "Family Commitments let you set screen-time and behaviour rules that the browser extension enforces. Create and manage them on the Family Commitments page. [Family Commitments](/family-commitments)" },
  { category: "navigation", title: "Family Agreements", content: "Family Agreements are shared digital-wellness pledges your family signs together. View and create them on the Family Agreements page. [Family Agreements](/family-agreements)" },
  { category: "navigation", title: "Educational Games", content: "Play cybersecurity, privacy, and wellness games in the Educational Games section. [Educational Games](/games)" },
  { category: "navigation", title: "Videos", content: "Watch curated wellness and safety videos in the Videos section. [Videos](/videos)" },
  { category: "navigation", title: "Screen Time", content: "Track and manage screen time on the Screen Time page. [Screen Time](/screen-time)" },
  { category: "navigation", title: "Community Hub", content: "Join the Community Hub for events, discussions, and regional chapters. [Community Hub](/community)" },
  { category: "navigation", title: "Browser Extension", content: "Install the Digital Guardian browser extension from the Chrome Web Store to enforce family commitments. [Install extension](https://chromewebstore.google.com/detail/caebokejnkeoehkmmhbjcnbfiobngnai)" },
  { category: "roadmap", title: "WellnessCompanion v2.0", content: "The AI assistant seeds from in-app content: breathing exercises, agreement builder tips, quiz explanations, and curated events. Always sourced from the app itself." },
  { category: "grounding", title: "When the Chat Doesn't Have an Answer", content: "If no specific answer is found, this assistant will say so honestly and suggest related topics such as digital safety, screen-time agreements, breathing exercises, or the Cyber-Safe Quiz." },

  // additional digital wellness coverage
  { category: "focus", title: "Attention as a Finite Resource", content: "Every notification competes for attention. Reducing alerts, batching checks, and creating focus blocks helps preserve concentration depth." },
  { category: "focus", title: "Deep Work and Device Boundaries", content: "Create device-free zones for homework, reading, or creative projects. Even 25-minute focus blocks can rebuild tolerance for sustained attention." },
  { category: "sleep", title: "Evening Wind-Down Alternatives", content: "Replace late-night scrolling with reading, journaling, drawing, or calm music. Consistent wind-down routines improve sleep onset and reduce nighttime awakenings." },
  { category: "sleep", title: "Sleep and Blue Light", content: "Evening screen exposure can delay melatonin release. Use night modes, reduce brightness, and ideally move screens out of the bedroom." },
  { category: "gaming", title: "Healthy Gaming Habits", content: "Set time limits, use timers, and balance gaming with physical activity. Watch for signs: irritability when stopped, declining schoolwork, or withdrawal from offline friends." },
  { category: "gaming", title: "Recognizing Problematic Use", content: "Warning signs include loss of interest in other activities, secrecy, declining grades, and mood swings when access is limited. Early conversations work better than ultimatums." },
  { category: "social", title: "Social Media Boundaries", content: "Discuss what to share, who to connect with, and how algorithms shape feeds. Regular audits of apps, followers, and notifications reduce pressure and risk." },
  { category: "social", title: "Dealing With FOMO", content: "Fear of missing out thrives on passive scrolling. Counter it with scheduled check-ins, offline plans, and reminders that curated feeds hide ordinary moments." },
  { category: "communication", title: "Family Check-In Prompts", content: "Use simple prompts: 'What felt good online this week?' 'What felt stressful?' 'Do you want help changing anything?' Keep it low-pressure and recurring." },
  { category: "communication", title: "Repair After Conflict", content: "If screen-time enforcement turns into a fight, repair first: apologize for yelling, revisit rules together, and invite their input on the next agreement." },
  { category: "literacy", title: "Evaluating Online Sources", content: "Teach lateral reading: open new tabs to check sources instead of staying on the original page. Look for author credentials, publication date, and evidence." },
  { category: "literacy", title: "Understanding Algorithms", content: "Explain that feeds are optimized for engagement, not accuracy or well-being. Encourage active searching and diversified sources instead of infinite scrolling." },
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
