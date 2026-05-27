import { Difficulty, QuestionType, Relevance, ReviewRating, SourceType, UserRole } from "@prisma/client";

export const roleLabels: Record<UserRole, string> = {
  STUDENT: "Schüler/Lehrling",
  ADMIN: "Admin",
  TEACHER: "Ausbilder/Lehrer",
};

export const typeLabels: Record<QuestionType, string> = {
  FLASHCARD: "Karteikarte",
  MULTIPLE_CHOICE: "Multiple Choice",
  OPEN: "Offene Frage",
  CALCULATION: "Rechenfrage",
  SCENARIO: "Praxis-Szenario",
};

export const difficultyLabels: Record<Difficulty, string> = {
  EASY: "Einfach",
  MEDIUM: "Mittel",
  HARD: "Schwer",
  LAP_RELEVANT: "LAP-relevant",
  CRITICAL: "Kritisch",
};

export const relevanceLabels: Record<Relevance, string> = {
  LOW: "Niedrig",
  MEDIUM: "Mittel",
  HIGH: "Hoch",
  VERY_HIGH: "Sehr hoch",
};

export const sourceTypeLabels: Record<SourceType, string> = {
  DEMO: "Demo",
  WKO: "WKO",
  SCHOOL: "Schulunterlage",
  NOTE: "Notiz",
  PDF: "PDF",
  CSV: "CSV",
  JSON: "JSON",
  URL: "URL",
  OTHER: "Sonstige Quelle",
};

export const ratingLabels: Record<ReviewRating, string> = {
  AGAIN: "Nicht gewusst",
  HARD: "Schwer",
  GOOD: "Gut",
  EASY: "Einfach",
};

export function mapImportedType(type: string): QuestionType {
  const normalized = type.toLowerCase();
  if (normalized === "multiple_choice") return QuestionType.MULTIPLE_CHOICE;
  if (normalized === "open") return QuestionType.OPEN;
  if (normalized === "calculation") return QuestionType.CALCULATION;
  if (normalized === "scenario") return QuestionType.SCENARIO;
  return QuestionType.FLASHCARD;
}

export function mapImportedDifficulty(difficulty: string): Difficulty {
  const normalized = difficulty.toLowerCase();
  if (normalized === "easy") return Difficulty.EASY;
  if (normalized === "hard") return Difficulty.HARD;
  if (normalized === "lap_relevant") return Difficulty.LAP_RELEVANT;
  if (normalized === "critical") return Difficulty.CRITICAL;
  return Difficulty.MEDIUM;
}

export function mapImportedRelevance(relevance: string): Relevance {
  const normalized = relevance.toLowerCase();
  if (normalized === "low") return Relevance.LOW;
  if (normalized === "medium") return Relevance.MEDIUM;
  if (normalized === "very_high") return Relevance.VERY_HIGH;
  return Relevance.HIGH;
}
