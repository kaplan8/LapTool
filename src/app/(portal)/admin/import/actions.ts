"use server";

import { SourceType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/demo-user";
import { prisma } from "@/lib/db/prisma";
import { mapImportedDifficulty, mapImportedRelevance, mapImportedType } from "@/lib/labels";
import { validateImportedQuestions } from "@/lib/import/parser";
import { slugify } from "@/lib/utils";

const optionSchema = z.object({
  text: z.string(),
  isCorrect: z.boolean(),
});

const importedQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  category: z.string(),
  difficulty: z.string(),
  type: z.string(),
  source: z.string(),
  relevance: z.string(),
  tags: z.array(z.string()),
  explanation: z.string(),
  options: z.array(optionSchema),
});

export async function importQuestionsAction(input: unknown) {
  const user = await getCurrentUser();
  const items = z.array(importedQuestionSchema).parse(input);
  const validation = validateImportedQuestions(items);
  if (validation.invalid.length) {
    return { imported: 0, skipped: validation.invalid.length, errors: validation.invalid.map((item) => item.errors).flat() };
  }

  let imported = 0;
  for (const item of validation.valid) {
    const category = await prisma.category.upsert({
      where: { slug: slugify(item.category) },
      create: {
        name: item.category,
        slug: slugify(item.category),
        description: "Automatisch durch Import angelegt.",
        color: "#38bdf8",
      },
      update: {},
    });

    const sourceId = `import-${slugify(item.source) || "quelle"}`;
    const source = await prisma.sourceDocument.upsert({
      where: { id: sourceId },
      create: {
        id: sourceId,
        title: item.source,
        type: SourceType.OTHER,
        uploadedById: user.id,
        isPrivate: true,
        copyrightNote: "Vom Benutzer importierte private Lernquelle.",
      },
      update: { title: item.source },
    });

    await prisma.question.create({
      data: {
        question: item.question,
        answer: item.answer,
        explanation: item.explanation,
        categoryId: category.id,
        sourceId: source.id,
        difficulty: mapImportedDifficulty(item.difficulty),
        type: mapImportedType(item.type),
        relevance: mapImportedRelevance(item.relevance),
        tags: JSON.stringify(item.tags),
        isOfficial: false,
        isDemo: false,
        isActive: true,
        options: item.options.length
          ? {
              create: item.options.map((option, index) => ({
                text: option.text,
                isCorrect: option.isCorrect,
                order: index,
              })),
            }
          : undefined,
      },
    });
    imported += 1;
  }

  await prisma.importBatch.create({
    data: {
      userId: user.id,
      filename: "textarea-import",
      type: SourceType.JSON,
      status: "IMPORTED",
      importedCount: imported,
      skippedCount: 0,
    },
  });

  revalidatePath("/questions");
  revalidatePath("/admin/import");
  return { imported, skipped: 0, errors: [] };
}
