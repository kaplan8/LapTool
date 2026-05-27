export const QUESTION_TYPES = [
  "flashcard",
  "multiple_choice",
  "open",
  "calculation",
  "scenario",
] as const;

export const DIFFICULTIES = ["easy", "medium", "hard", "lap_relevant", "critical"] as const;

export const RELEVANCE_LEVELS = ["low", "medium", "high", "very_high"] as const;

export const REVIEW_RATINGS = ["again", "hard", "good", "easy"] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];
export type Difficulty = (typeof DIFFICULTIES)[number];
export type Relevance = (typeof RELEVANCE_LEVELS)[number];
export type ReviewRating = (typeof REVIEW_RATINGS)[number];

export type ImportedAnswerOption = {
  text: string;
  isCorrect: boolean;
};

export type ImportedQuestion = {
  question: string;
  answer: string;
  category: string;
  difficulty: string;
  type: string;
  source: string;
  relevance: string;
  tags: string[];
  explanation: string;
  options: ImportedAnswerOption[];
};

export type ValidationIssue = {
  item: ImportedQuestion;
  errors: string[];
  index: number;
};
