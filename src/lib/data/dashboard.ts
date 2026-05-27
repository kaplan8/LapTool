import { QuestionType } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth/demo-user";
import { prisma } from "@/lib/db/prisma";

export async function getDashboardData() {
  const user = await getCurrentUser();
  const [questions, progress, lastExam, categories] = await Promise.all([
    prisma.question.findMany({
      where: { isActive: true },
      include: {
        category: true,
        source: true,
        progress: { where: { userId: user.id } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.learningProgress.findMany({
      where: { userId: user.id },
      include: { question: { include: { category: true } } },
    }),
    prisma.examSession.findFirst({
      where: { userId: user.id, finishedAt: { not: null } },
      orderBy: { finishedAt: "desc" },
    }),
    prisma.category.findMany({
      include: {
        questions: {
          where: { isActive: true },
          include: { progress: { where: { userId: user.id } } },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalQuestions = questions.length;
  const learnedQuestions = progress.filter((item) => item.lastReviewedAt).length;
  const masteredQuestions = progress.filter((item) => item.masteryLevel >= 80).length;
  const dueCards = questions.filter((question) => {
    const item = question.progress[0];
    return !item?.nextReviewAt || item.nextReviewAt <= new Date();
  }).length;
  const correct = progress.reduce((sum, item) => sum + item.correctCount, 0);
  const wrong = progress.reduce((sum, item) => sum + item.wrongCount, 0);
  const progressPercent = totalQuestions === 0 ? 0 : Math.round((learnedQuestions / totalQuestions) * 100);
  const readiness = Math.round(
    progressPercent * 0.35 +
      (lastExam?.percentage ?? 0) * 0.35 +
      (totalQuestions === 0 ? 0 : (masteredQuestions / totalQuestions) * 100) * 0.3,
  );

  const categoryStats = categories.map((category) => {
    const learned = category.questions.filter((question) => question.progress[0]?.lastReviewedAt).length;
    const correctCount = category.questions.reduce(
      (sum, question) => sum + (question.progress[0]?.correctCount ?? 0),
      0,
    );
    const wrongCount = category.questions.reduce((sum, question) => sum + (question.progress[0]?.wrongCount ?? 0), 0);
    const mastery =
      category.questions.length === 0
        ? 0
        : Math.round(
            category.questions.reduce((sum, question) => sum + (question.progress[0]?.masteryLevel ?? 0), 0) /
              category.questions.length,
          );

    return {
      id: category.id,
      name: category.name,
      color: category.color ?? "#38bdf8",
      total: category.questions.length,
      learned,
      mastery,
      correctCount,
      wrongCount,
      progress: category.questions.length === 0 ? 0 : Math.round((learned / category.questions.length) * 100),
    };
  });

  const weakCategories = [...categoryStats]
    .filter((category) => category.total > 0)
    .sort((a, b) => a.mastery - b.mastery || b.wrongCount - a.wrongCount)
    .slice(0, 3);

  const byType = questions.reduce<Record<QuestionType, number>>(
    (acc, question) => {
      acc[question.type] += 1;
      return acc;
    },
    {
      FLASHCARD: 0,
      MULTIPLE_CHOICE: 0,
      OPEN: 0,
      CALCULATION: 0,
      SCENARIO: 0,
    },
  );

  return {
    user,
    totalQuestions,
    learnedQuestions,
    dueCards,
    masteredQuestions,
    correct,
    wrong,
    progressPercent,
    readiness,
    lastExam,
    categoryStats,
    weakCategories,
    byType,
    dailyGoal: user.dailyGoal,
    learningTimeMinutes: Math.max(20, learnedQuestions * 4),
    reviews: correct + wrong,
    streak: 7,
  };
}
