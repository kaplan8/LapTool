import Papa from "papaparse";

import {
  DIFFICULTIES,
  QUESTION_TYPES,
  RELEVANCE_LEVELS,
  type ImportedQuestion,
  type ValidationIssue,
} from "../../types/domain";

type CsvRow = Record<string, string | undefined>;

const normalize = (value: unknown) => String(value ?? "").trim();

const normalizeKey = (value: string) => value.trim().toLowerCase();

const splitTags = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value.map(normalize).filter(Boolean);
  return normalize(value)
    .split(/[;,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
};

function normalizeDifficulty(value: string) {
  const difficulty = normalizeKey(value);
  const map: Record<string, string> = {
    einfach: "easy",
    leicht: "easy",
    easy: "easy",
    mittel: "medium",
    medium: "medium",
    schwer: "hard",
    hard: "hard",
    "lap-relevant": "lap_relevant",
    lap_relevant: "lap_relevant",
    kritisch: "critical",
    critical: "critical",
  };
  return map[difficulty] ?? difficulty;
}

function normalizeType(value: string) {
  const type = normalizeKey(value);
  const map: Record<string, string> = {
    karteikarte: "flashcard",
    flashcard: "flashcard",
    multiplechoice: "multiple_choice",
    multiple_choice: "multiple_choice",
    "multiple-choice": "multiple_choice",
    offen: "open",
    open: "open",
    rechenfrage: "calculation",
    calculation: "calculation",
    szenario: "scenario",
    scenario: "scenario",
  };
  return map[type] ?? type;
}

function normalizeRelevance(value: string) {
  const relevance = normalizeKey(value);
  const map: Record<string, string> = {
    niedrig: "low",
    low: "low",
    mittel: "medium",
    medium: "medium",
    hoch: "high",
    high: "high",
    "sehr hoch": "very_high",
    very_high: "very_high",
    kritisch: "very_high",
  };
  return map[relevance] ?? relevance;
}

function csvOptions(row: CsvRow) {
  const correct = normalize(row.correctOptions)
    .toUpperCase()
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return ["A", "B", "C", "D"]
    .map((letter) => ({
      text: normalize(row[`option${letter}`]),
      isCorrect: correct.includes(letter),
    }))
    .filter((option) => option.text.length > 0);
}

export function parseCsvQuestions(csv: string): ImportedQuestion[] {
  const result = Papa.parse<CsvRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  return result.data.map((row) => ({
    question: normalize(row.question),
    answer: normalize(row.answer),
    category: normalize(row.category),
    difficulty: normalizeDifficulty(normalize(row.difficulty)),
    type: normalizeType(normalize(row.type)),
    source: normalize(row.source || "Import"),
    relevance: normalizeRelevance(normalize(row.relevance)),
    tags: splitTags(row.tags),
    explanation: normalize(row.explanation),
    options: csvOptions(row),
  }));
}

export function parseJsonQuestions(json: string): ImportedQuestion[] {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) {
    throw new Error("JSON-Import muss ein Array von Fragen enthalten.");
  }

  return parsed.map((item) => ({
    question: normalize(item.question),
    answer: normalize(item.answer),
    category: normalize(item.category),
    difficulty: normalizeDifficulty(normalize(item.difficulty)),
    type: normalizeType(normalize(item.type)),
    source: normalize(item.source || "Import"),
    relevance: normalizeRelevance(normalize(item.relevance)),
    tags: splitTags(item.tags),
    explanation: normalize(item.explanation),
    options: Array.isArray(item.options)
      ? item.options
          .map((option: { text?: unknown; isCorrect?: unknown }) => ({
            text: normalize(option.text),
            isCorrect: Boolean(option.isCorrect),
          }))
          .filter((option: { text: string }) => option.text.length > 0)
      : [],
  }));
}

export function validateImportedQuestions(questions: ImportedQuestion[]) {
  const valid: ImportedQuestion[] = [];
  const invalid: ValidationIssue[] = [];

  questions.forEach((question, index) => {
    const errors: string[] = [];

    if (!question.question) errors.push("Frage darf nicht leer sein.");
    if (!question.answer) errors.push("Antwort darf nicht leer sein.");
    if (!question.category) errors.push("Kategorie muss angegeben werden.");
    if (!QUESTION_TYPES.includes(question.type as never)) errors.push("Fragetyp ist ungültig.");
    if (!DIFFICULTIES.includes(question.difficulty as never)) errors.push("Schwierigkeit ist ungültig.");
    if (!RELEVANCE_LEVELS.includes(question.relevance as never)) errors.push("Prüfungsrelevanz ist ungültig.");
    if (question.type === "multiple_choice" && question.options.length < 2) {
      errors.push("Multiple-Choice-Fragen benötigen mindestens zwei Antwortoptionen.");
    }
    if (question.type === "multiple_choice" && !question.options.some((option) => option.isCorrect)) {
      errors.push("Multiple-Choice-Fragen benötigen mindestens eine richtige Option.");
    }

    if (errors.length > 0) {
      invalid.push({ item: question, errors, index });
    } else {
      valid.push(question);
    }
  });

  return { valid, invalid };
}

export function detectDuplicates(questions: ImportedQuestion[], existingQuestions: string[] = []) {
  const seen = new Set(existingQuestions.map((question) => normalizeKey(question)));
  const duplicates = new Set<string>();

  for (const question of questions) {
    const key = normalizeKey(question.question);
    if (!key) continue;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }

  return Array.from(duplicates);
}
