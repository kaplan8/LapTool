"use server";

import { QuestionType, SourceType } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/demo-user";
import { prisma } from "@/lib/db/prisma";
import { calculateScore, evaluateMultipleChoice, getExamRecommendations, selectRandomQuestions } from "@/lib/exam/exam";

const finishAnswerSchema = z.object({
  examAnswerId: z.string(),
  questionId: z.string(),
  userAnswer: z.string().optional(),
  selectedOptionIds: z.array(z.string()).default([]),
  manualCorrect: z.boolean().default(false),
});

export async function startExamAction(formData: FormData) {
  const user = await getCurrentUser();
  const questionCount = Number(formData.get("questionCount") ?? 20);
  const durationMinutes = Number(formData.get("durationMinutes") ?? 30);
  const categoryIds = formData.getAll("categoryIds").map(String).filter(Boolean);
  const typeValues = formData.getAll("types").map(String).filter(Boolean);
  const types = typeValues.filter((type): type is QuestionType => Object.values(QuestionType).includes(type as QuestionType));
  const sourceMode = String(formData.get("sourceMode") ?? "imported");
  const excludeDemo = formData.get("excludeDemo") === "on";

  const pool = await prisma.question.findMany({
    where: {
      isActive: true,
      ...(categoryIds.length ? { categoryId: { in: categoryIds } } : {}),
      ...(types.length ? { type: { in: types } } : {}),
      ...(sourceMode === "imported" ? { isDemo: false } : {}),
      ...(sourceMode === "wko" ? { source: { type: SourceType.WKO } } : {}),
      ...(excludeDemo ? { isDemo: false } : {}),
    },
    include: { category: true },
  });
  const selected = selectRandomQuestions(pool, questionCount);

  const session = await prisma.examSession.create({
    data: {
      userId: user.id,
      durationSeconds: durationMinutes * 60,
      mode: "mixed",
      config: JSON.stringify({ questionCount, durationMinutes, categoryIds, types }),
      answers: {
        create: selected.map((question) => ({
          questionId: question.id,
          maxPoints: question.type === QuestionType.SCENARIO ? 2 : 1,
        })),
      },
    },
  });

  redirect(`/exam/session/${session.id}`);
}

export async function finishExamAction(sessionId: string, answers: z.infer<typeof finishAnswerSchema>[]) {
  const parsed = z.array(finishAnswerSchema).parse(answers);
  const session = await prisma.examSession.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        include: {
          question: {
            include: { options: true, category: true },
          },
        },
      },
    },
  });
  if (!session) throw new Error("Prüfungssession nicht gefunden.");

  const byAnswerId = new Map(parsed.map((answer) => [answer.examAnswerId, answer]));
  const scoreInputs = [];
  const recommendationInputs = [];

  for (const answer of session.answers) {
    const submitted = byAnswerId.get(answer.id);
    const selectedOptionIds = submitted?.selectedOptionIds ?? [];
    const isMultipleChoice = answer.question.type === QuestionType.MULTIPLE_CHOICE;
    const isCorrect = isMultipleChoice
      ? evaluateMultipleChoice(answer.question.options, selectedOptionIds)
      : Boolean(submitted?.manualCorrect);
    const pointsAwarded = isCorrect ? answer.maxPoints : 0;

    await prisma.examAnswer.update({
      where: { id: answer.id },
      data: {
        userAnswer: submitted?.userAnswer ?? "",
        selectedOptionIds: JSON.stringify(selectedOptionIds),
        isCorrect,
        pointsAwarded,
        reviewedManually: !isMultipleChoice,
      },
    });

    scoreInputs.push({ isCorrect, maxPoints: answer.maxPoints, pointsAwarded });
    recommendationInputs.push({ categoryName: answer.question.category.name, isCorrect });
  }

  const score = calculateScore(scoreInputs);
  const durationSeconds = Math.max(0, Math.round((Date.now() - session.startedAt.getTime()) / 1000));

  await prisma.examSession.update({
    where: { id: sessionId },
    data: {
      finishedAt: new Date(),
      durationSeconds,
      score: score.score,
      maxScore: score.maxScore,
      percentage: score.percentage,
      passed: score.passed,
      config: JSON.stringify({
        ...(JSON.parse(session.config || "{}") as Record<string, unknown>),
        recommendations: getExamRecommendations(recommendationInputs),
      }),
    },
  });

  return { sessionId };
}
