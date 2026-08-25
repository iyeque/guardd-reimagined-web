import axios from "axios";
import { db } from "./db.js";
import { faqChunks } from "../shared/schema.js";
import { eq } from "drizzle-orm";

export interface ScoredChunk {
  id: number;
  title: string;
  content: string;
  category: string;
  score: number;
}

function simpleTfIdfScore(query: string, text: string): number {
  const qTerms = query.toLowerCase().split(/\W+/).filter(Boolean);
  const tLower = text.toLowerCase();
  let score = 0;
  for (const term of qTerms) {
    if (tLower.includes(term)) score += 1;
  }
  return score;
}

export async function searchFaqChunks(query: string, topK = 3): Promise<ScoredChunk[]> {
  const rows = await db.select().from(faqChunks);
  const scored: ScoredChunk[] = rows
    .map((r) => ({
      ...r,
      score: simpleTfIdfScore(query, `${r.title} ${r.content} ${r.category}`),
    }))
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export async function getFaqChunk(id: number) {
  const [row] = await db.select().from(faqChunks).where(eq(faqChunks.id, id)).limit(1);
  return row ?? null;
}

export async function generateOpenRouterAnswer(question: string, context: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const endpoint =
    process.env.OPENROUTER_ENDPOINT ||
    "https://openrouter.ai/api/v1/chat/completions";
  const model = process.env.OPENROUTER_MODEL || "google/gemma-4-26b-a4b-it:free";

  if (!apiKey) {
    return context.split("\n\n")[0]?.replace(/\[.*?\]\s*/g, "") || "I couldn't find a specific answer.";
  }

  try {
    const response = await axios.post(
      endpoint,
      {
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a family digital wellness advisor. Prefer the provided context when relevant. If the question is about digital wellness, screen time, online safety, parenting with technology, mental health and device use, or closely related topics, answer helpfully from general digital wellness knowledge. If it is unrelated, decline politely and suggest a related topic like digital safety, screen-time agreements, breathing exercises, or the Cyber-Safe Quiz. Keep answers under 120 words, practical, warm, and never invent statistics.",
          },
          {
            role: "user",
            content: `Question: ${question}\n\nContext:\n${context}`,
          },
        ],
        max_tokens: 220,
        temperature: 0.3,
      },
      { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
    );

    const data = response.data as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text === "string" && text.trim()) return text.trim();
  } catch (err) {
    console.error("OpenRouter FAQ generation failed:", err instanceof Error ? err.message : String(err));
  }

  return context.split("\n\n")[0]?.replace(/\[.*?\]\s*/g, "") || "I don't have enough information to answer that. Try asking about digital safety, screen-time agreements, breathing exercises, or the Cyber-Safe Quiz.";
}
