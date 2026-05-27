export type ChoiceOption = {
  id: string;
  isCorrect: boolean;
};

export type ScoreInput = {
  isCorrect: boolean;
  maxPoints?: number;
  pointsAwarded?: number | null;
};

export type ScoreResult = {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
};

export type RecommendationInput = {
  categoryName: string;
  isCorrect: boolean;
};

export function evaluateMultipleChoice(options: ChoiceOption[], selectedOptionIds: string[]) {
  const selected = new Set(selectedOptionIds);
  const correctIds = options.filter((option) => option.isCorrect).map((option) => option.id);

  if (selected.size !== correctIds.length) return false;
  return correctIds.every((id) => selected.has(id));
}

export function calculateScore(answers: ScoreInput[], passThreshold = 60): ScoreResult {
  const maxScore = answers.reduce((sum, answer) => sum + (answer.maxPoints ?? 1), 0);
  const score = answers.reduce((sum, answer) => {
    if (typeof answer.pointsAwarded === "number") return sum + answer.pointsAwarded;
    return sum + (answer.isCorrect ? answer.maxPoints ?? 1 : 0);
  }, 0);
  const percentage = maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);

  return {
    score,
    maxScore,
    percentage,
    passed: percentage >= passThreshold,
  };
}

export function getExamRecommendations(items: RecommendationInput[]) {
  const grouped = new Map<string, { total: number; wrong: number }>();

  for (const item of items) {
    const current = grouped.get(item.categoryName) ?? { total: 0, wrong: 0 };
    current.total += 1;
    current.wrong += item.isCorrect ? 0 : 1;
    grouped.set(item.categoryName, current);
  }

  return Array.from(grouped.entries())
    .map(([categoryName, stats]) => ({
      categoryName,
      wrongRate: stats.total === 0 ? 0 : stats.wrong / stats.total,
      wrong: stats.wrong,
    }))
    .filter((entry) => entry.wrong > 0)
    .sort((a, b) => b.wrongRate - a.wrongRate || b.wrong - a.wrong)
    .map((entry) => `${entry.categoryName}: ${Math.round(entry.wrongRate * 100)} % Fehlerquote wiederholen.`);
}

export function selectRandomQuestions<T extends { id: string }>(questions: T[], count: number) {
  return [...questions]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.max(0, Math.min(count, questions.length)));
}
