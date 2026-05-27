import type { ReviewRating } from "../../types/domain";

export type ReviewInput = {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
} | null;

export type ReviewResult = {
  repetitions: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewAt: Date;
};

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function clampEase(easeFactor: number) {
  return Math.max(MIN_EASE_FACTOR, Number(easeFactor.toFixed(2)));
}

export function calculateNextReview(
  current: ReviewInput,
  rating: ReviewRating,
  reviewedAt = new Date(),
): ReviewResult {
  const repetitions = current?.repetitions ?? 0;
  const easeFactor = current?.easeFactor ?? DEFAULT_EASE_FACTOR;
  const intervalDays = current?.intervalDays ?? 0;

  if (rating === "again") {
    return {
      repetitions: 0,
      easeFactor: clampEase(easeFactor - 0.25),
      intervalDays: 1,
      nextReviewAt: addDays(reviewedAt, 1),
    };
  }

  if (rating === "hard") {
    const nextInterval = Math.max(1, Math.ceil(intervalDays * 1.2));
    return {
      repetitions: Math.max(1, repetitions),
      easeFactor: clampEase(easeFactor - 0.15),
      intervalDays: nextInterval,
      nextReviewAt: addDays(reviewedAt, nextInterval),
    };
  }

  if (rating === "easy") {
    const nextRepetitions = repetitions + 1;
    const nextInterval =
      nextRepetitions === 1 ? 3 : Math.max(4, Math.ceil(intervalDays * (easeFactor + 0.35)));

    return {
      repetitions: nextRepetitions,
      easeFactor: clampEase(easeFactor + 0.15),
      intervalDays: nextInterval,
      nextReviewAt: addDays(reviewedAt, nextInterval),
    };
  }

  const nextRepetitions = repetitions + 1;
  const nextInterval =
    nextRepetitions === 1
      ? 1
      : nextRepetitions === 2
        ? 3
        : Math.max(2, Math.ceil(intervalDays * easeFactor));

  return {
    repetitions: nextRepetitions,
    easeFactor: clampEase(easeFactor),
    intervalDays: nextInterval,
    nextReviewAt: addDays(reviewedAt, nextInterval),
  };
}
