"use server";

import { AnswerStatus, Difficulty, QuestionType, Relevance, SourceType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/demo-user";
import { prisma } from "@/lib/db/prisma";
import { slugify } from "@/lib/utils";

const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(3),
  answer: z.string().min(1),
  explanation: z.string().optional(),
  categoryId: z.string().min(1),
  type: z.nativeEnum(QuestionType),
  difficulty: z.nativeEnum(Difficulty),
  relevance: z.nativeEnum(Relevance),
  sourceTitle: z.string().min(1),
  tags: z.string().optional(),
  options: z.string().optional(),
  criteria: z.string().optional(),
});

function parseOptionLines(value?: string) {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const isCorrect = line.startsWith("[x]") || line.startsWith("[X]");
      return {
        text: line.replace(/^\[[xX ]\]\s*/, ""),
        isCorrect,
        order: index,
      };
    })
    .filter((option) => option.text.length > 0);
}

export async function saveQuestionAction(formData: FormData) {
  const user = await getCurrentUser();
  const parsed = questionSchema.parse({
    id: formData.get("id")?.toString() || undefined,
    question: formData.get("question"),
    answer: formData.get("answer"),
    explanation: formData.get("explanation")?.toString() || undefined,
    categoryId: formData.get("categoryId"),
    type: formData.get("type"),
    difficulty: formData.get("difficulty"),
    relevance: formData.get("relevance"),
    sourceTitle: formData.get("sourceTitle"),
    tags: formData.get("tags")?.toString() || "",
    options: formData.get("options")?.toString() || "",
    criteria: formData.get("criteria")?.toString() || "",
  });

  const source = await prisma.sourceDocument.upsert({
    where: { id: `manual-${slugify(parsed.sourceTitle)}` },
    create: {
      id: `manual-${slugify(parsed.sourceTitle)}`,
      title: parsed.sourceTitle,
      type: SourceType.NOTE,
      uploadedById: user.id,
      isPrivate: true,
      copyrightNote: "Vom Benutzer manuell angelegte private Lernquelle.",
    },
    update: { title: parsed.sourceTitle },
  });

  const tags = parsed.tags
    ? parsed.tags
        .split(/[;,]/)
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
  const options = parseOptionLines(parsed.options);
  const answerStatus = parsed.answer.trim() && parsed.answer.trim() !== "Antwort offen" ? AnswerStatus.ANSWERED : AnswerStatus.OPEN;

  if (parsed.id) {
    await prisma.answerOption.deleteMany({ where: { questionId: parsed.id } });
    await prisma.question.update({
      where: { id: parsed.id },
      data: {
        question: parsed.question,
        answer: parsed.answer,
        answerStatus,
        explanation: parsed.explanation,
        categoryId: parsed.categoryId,
        type: parsed.type,
        difficulty: parsed.difficulty,
        relevance: parsed.relevance,
        sourceId: source.id,
        tags: JSON.stringify(tags),
        criteria: parsed.criteria,
        isDemo: false,
        options: options.length ? { create: options } : undefined,
      },
    });
  } else {
    await prisma.question.create({
      data: {
        question: parsed.question,
        answer: parsed.answer,
        answerStatus,
        explanation: parsed.explanation,
        categoryId: parsed.categoryId,
        type: parsed.type,
        difficulty: parsed.difficulty,
        relevance: parsed.relevance,
        sourceId: source.id,
        tags: JSON.stringify(tags),
        criteria: parsed.criteria,
        isDemo: false,
        isOfficial: false,
        options: options.length ? { create: options } : undefined,
      },
    });
  }

  revalidatePath("/questions");
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function deleteQuestionAction(formData: FormData) {
  const id = z.string().parse(formData.get("id"));
  await prisma.question.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/questions");
  revalidatePath("/admin/questions");
}
