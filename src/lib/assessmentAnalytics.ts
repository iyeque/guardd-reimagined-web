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

const DEFAULT_ANALYTICS_ENDPOINT = '/api/assessment-analytics';

export const getAnalyticsEndpoint = (): string | undefined => {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).__VITE_ANALYTICS_ENDPOINT || DEFAULT_ANALYTICS_ENDPOINT;
  }
  return DEFAULT_ANALYTICS_ENDPOINT;
};

export const sendAssessmentAnalytics = async (
  payload: AssessmentAnalyticsPayload
): Promise<void> => {
  // Respect cookie consent: do not send analytics without consent
  const consentChoice = typeof window !== "undefined"
    ? localStorage.getItem("dg_cookie_consent")
    : null;
  const analyticsEnabled = typeof window !== "undefined"
    ? (window as any).__DG_ANALYTICS_ENABLED
    : undefined;

  if (consentChoice !== "accept" && analyticsEnabled !== true) {
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
      console.warn('Failed to send assessment analytics', response.status);
    }
  } catch (error) {
    console.warn('Failed to send assessment analytics', error);
  }
};

export const buildAssessmentAnalyticsPayload = (
  moduleId: string,
  questions: { question: string; correctIndex: number }[],
  answers: number[],
  workshopId?: string
): AssessmentAnalyticsPayload => {
  const correctCount = answers.filter((a, i) => a === questions[i].correctIndex).length;
  const score = Math.round((correctCount / questions.length) * 100);

  return {
    assessmentId: moduleId + '-analytics',
    moduleId,
    workshopId,
    totalQuestions: questions.length,
    correctCount,
    score,
    passed: score >= (moduleId === 'a1' ? 70 : 75),
    completedAt: Date.now(),
  };
};

export const getCommonMisconceptions = (
  answers: number[],
  questions: { correctIndex: number; explanation: string }[]
): { questionIndex: number; selectedWrongCount: number; explanation: string }[] => {
  const wrongByQuestion: Record<number, number> = {};

  answers.forEach((selected, i) => {
    if (selected !== questions[i].correctIndex && questions[i].explanation) {
      wrongByQuestion[i] = (wrongByQuestion[i] || 0) + 1;
    }
  });

  return Object.entries(wrongByQuestion)
    .map(([index, count]) => ({
      questionIndex: Number(index),
      selectedWrongCount: count,
      explanation: questions[Number(index)].explanation || '',
    }))
    .sort((a, b) => b.selectedWrongCount - a.selectedWrongCount);
};

export const formatCertificationMessage = (
  score: number,
  passed: boolean,
  misconceptions: { questionIndex: number; selectedWrongCount: number; explanation: string }[]
): string => {
  if (!passed) {
    return 'You can review the material and try again later.';
  }

  if (misconceptions.length === 0) {
    return 'You demonstrated strong understanding across all questions. Great job!';
  }

  const topIssue = misconceptions[0];
  if (!topIssue.explanation) {
    return 'You completed the assessment successfully.';
  }

  return 'You completed the assessment. ' + topIssue.explanation;
};
