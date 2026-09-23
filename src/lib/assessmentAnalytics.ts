export interface AssessmentAnalyticsPayload {
  assessmentId: string;
  workshopId?: string;
  moduleId: string;
  totalQuestions: number;
  correctCount: number;
  score: number;
  passed: boolean;
  completedAt: number;
}

import { COOKIE_CONSENT_KEY } from "@/lib/profiles";

const ANALYTICS_COOKIE_KEY = COOKIE_CONSENT_KEY;

function isAnalyticsAllowed(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(ANALYTICS_COOKIE_KEY);
  return stored === "accept";
}

const DEFAULT_ANALYTICS_ENDPOINT = '/api/assessment-analytics';

export const getAnalyticsEndpoint = (): string | undefined => {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).__VITE_ANALYTICS_ENDPOINT || DEFAULT_ANALYTICS_ENDPOINT;
  }
  return DEFAULT_ANALYTICS_ENDPOINT;
};

export interface MisconceptionEntry {
  questionIndex: number;
  selectedWrongCount: number;
  explanation: string;
}

export function buildAssessmentAnalyticsPayload(
  moduleId: string,
  questions: { question: string; correctIndex: number }[],
  answers: (number | string)[]
): AssessmentAnalyticsPayload {
  const totalQuestions = questions.length;
  let correctCount = 0;
  for (let i = 0; i < totalQuestions && i < answers.length; i++) {
    const answer = answers[i];
    const expected = questions[i].correctIndex;
    const answerValue = typeof answer === 'string' ? Number(answer) : answer;
    if (answerValue === expected) {
      correctCount++;
    }
  }
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  return {
    assessmentId: moduleId,
    moduleId,
    totalQuestions,
    correctCount,
    score,
    passed: score >= 70,
    completedAt: Date.now(),
  };
}

export function getCommonMisconceptions(
  answers: (number | string)[],
  questions: { correctIndex: number; explanation: string }[]
): MisconceptionEntry[] {
  const misconceptions: MisconceptionEntry[] = [];
  for (let i = 0; i < questions.length && i < answers.length; i++) {
    const answer = answers[i];
    const expected = questions[i].correctIndex;
    const answerValue = typeof answer === 'string' ? Number(answer) : answer;
    if (answerValue !== expected) {
      const prev = misconceptions.find(m => m.questionIndex === i);
      if (prev) {
        prev.selectedWrongCount++;
      } else {
        misconceptions.push({ questionIndex: i, selectedWrongCount: 1, explanation: questions[i].explanation });
      }
    }
  }
  return misconceptions;
}

export function formatCertificationMessage(
  score: number,
  passed: boolean,
  misconceptions: MisconceptionEntry[]
): string {
  if (passed) {
    if (misconceptions.length === 0) {
      return `Excellent! You scored ${score}% with a perfect score.`;
    }
    return `Great job! You passed with ${score}%. Review a few areas to strengthen your knowledge.`;
  }
  if (misconceptions.length === 0) {
    return `You scored ${score}%. Keep learning to improve.`;
  }
  return `You scored ${score}%. Review: ${misconceptions.slice(0, 3).map(m => m.explanation).join('; ')}`;
}

export const sendAssessmentAnalytics = async (
  payload: AssessmentAnalyticsPayload
): Promise<void> => {
  if (!isAnalyticsAllowed()) {
    return;
  }

  const endpoint = getAnalyticsEndpoint();
  if (!endpoint) {
    return;
  }
  try {
    const body = {
      assessmentId: payload.assessmentId,
      moduleId: payload.moduleId,
      workshopId: payload.workshopId ?? undefined,
      totalQuestions: payload.totalQuestions,
      correctCount: payload.correctCount,
      score: payload.score,
      passed: String(payload.passed),
      completedAt: payload.completedAt,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Assessment analytics send failed', response.status, response.statusText);
    }
  } catch (err) {
    console.error('Assessment analytics network error', err);
  }
};
