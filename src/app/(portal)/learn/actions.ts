"use server";

import { ReviewRating } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/demo-user";
import { prisma } from "@/lib/db/prisma";
import { calculateNextReview } from "@/lib/spaced-repetition/scheduler";
import type { ReviewRating as DomainReviewRating } from "@/types/domain";

const reviewSchema = z.object({
  questionId: z.string(),
  rating: z.enum(["again", "hard", "good", "easy"]),
});

const ratingMap: Record<DomainReviewRating, ReviewRating> = {
  again: ReviewRating.AGAIN,
  hard: ReviewRating.HARD,
  good: ReviewRating.GOOD,
  easy: ReviewRating.EASY,
};

export async function reviewQuestionAction(input: { questionId: string; rating: DomainReviewRating }) {
  const parsed = reviewSchema.parse(input);
  const user = await getCurrentUser();
  const current = await prisma.learningProgress.findUnique({
    where: { userId_questionId: { userId: user.id, questionId: parsed.questionId } },
  });
  const next = calculateNextReview(
    current
      ? {
          repetitions: current.repetitions,
          easeFactor: current.easeFactor,
          intervalDays: current.intervalDays,
        }
      : null,
    parsed.rating,
  );
  const isCorrect = parsed.rating === "good" || parsed.rating === "easy";
  const currentCorrect = current?.correctCount ?? 0;
  const currentWrong = current?.wrongCount ?? 0;
  const correctCount = currentCorrect + (isCorrect ? 1 : 0);
  const wrongCount = currentWrong + (isCorrect ? 0 : 1);
  const total = correctCount + wrongCount;
  const masteryLevel = Math.min(100, Math.round((correctCount / Math.max(1, total)) * 70 + next.repetitions * 6));

  await prisma.learningProgress.upsert({
    where: { userId_questionId: { userId: user.id, questionId: parsed.questionId } },
    create: {
      userId: user.id,
      questionId: parsed.questionId,
      repetitions: next.repetitions,
      easeFactor: next.easeFactor,
      intervalDays: next.intervalDays,
      lastReviewedAt: new Date(),
      nextReviewAt: next.nextReviewAt,
      lastRating: ratingMap[parsed.rating],
      correctCount,
      wrongCount,
      masteryLevel,
    },
    update: {
      repetitions: next.repetitions,
      easeFactor: next.easeFactor,
      intervalDays: next.intervalDays,
      lastReviewedAt: new Date(),
      nextReviewAt: next.nextReviewAt,
      lastRating: ratingMap[parsed.rating],
      correctCount,
      wrongCount,
      masteryLevel,
    },
  });

  revalidatePath("/learn");
  revalidatePath("/dashboard");

  return {
    nextReviewAt: next.nextReviewAt.toISOString(),
    masteryLevel,
  };
}
