import { notFound } from "next/navigation";

import { ExamSessionClient } from "@/components/exam/exam-session-client";
import { prisma } from "@/lib/db/prisma";

type ExamSessionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExamSessionPage({ params }: ExamSessionPageProps) {
  const { id } = await params;
  const session = await prisma.examSession.findUnique({
    where: { id },
    include: {
      answers: {
        include: {
          question: {
            include: {
              category: true,
              options: { orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!session) notFound();

  return (
    <ExamSessionClient
      sessionId={session.id}
      durationSeconds={session.durationSeconds ?? 1800}
      questions={session.answers.map((answer) => ({
        examAnswerId: answer.id,
        questionId: answer.questionId,
        question: answer.question.question,
        answer: answer.question.answer,
        type: answer.question.type,
        category: answer.question.category.name,
        options: answer.question.options.map((option) => ({ id: option.id, text: option.text })),
      }))}
    />
  );
}
