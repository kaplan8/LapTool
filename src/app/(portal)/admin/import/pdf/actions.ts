"use server";

import { AnswerStatus, ImportStatus, SourceType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/demo-user";
import { prisma } from "@/lib/db/prisma";
import { extractQuestionsFromPdfPages } from "@/lib/import/pdf-question-extractor";
import { parsePdfPages } from "@/lib/import/pdf-parser";
import { slugify } from "@/lib/utils";

const MAX_PDF_SIZE = 25 * 1024 * 1024;

const pdfQuestionSchema = z.object({
  question: z.string().min(3),
  category: z.string().min(1),
  pageNumber: z.number().int().min(1),
  answer: z.string().default("Antwort offen"),
  answerStatus: z.enum(["open"]).default("open"),
  confirmed: z.boolean().default(true),
  duplicate: z.boolean().default(false),
});

const confirmSchema = z.object({
  sourceDocumentId: z.string(),
  importBatchId: z.string(),
  questions: z.array(pdfQuestionSchema),
});

export async function parsePdfImportAction(formData: FormData) {
  const user = await getCurrentUser();
  const file = formData.get("pdf");
  const title = String(formData.get("title") ?? "").trim();
  const sourceTypeInput = String(formData.get("sourceType") ?? SourceType.WKO);
  const sourceType = Object.values(SourceType).includes(sourceTypeInput as SourceType)
    ? (sourceTypeInput as SourceType)
    : SourceType.PDF;

  if (!(file instanceof File)) throw new Error("Bitte eine PDF-Datei auswählen.");
  if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
    throw new Error("Nur PDF-Dateien können importiert werden.");
  }
  if (file.size > MAX_PDF_SIZE) {
    throw new Error("PDF ist zu groß. Maximal erlaubt sind 25 MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const source = await prisma.sourceDocument.create({
    data: {
      title: title || file.name.replace(/\.pdf$/i, ""),
      type: sourceType,
      filename: file.name,
      uploadedById: user.id,
      isPrivate: true,
      copyrightNote:
        "Vom Benutzer hochgeladene private PDF-Unterlage. Offizielle Inhalte nur nutzen, wenn eine Berechtigung vorliegt.",
    },
  });

  const pages = await parsePdfPages(buffer);
  const extraction = extractQuestionsFromPdfPages(pages);
  const existingQuestions = await prisma.question.findMany({
    select: { question: true },
  });
  const existingKeys = new Set(existingQuestions.map((item) => item.question.trim().toLowerCase()));
  const questions = extraction.questions.map((question) => {
    const key = question.question.trim().toLowerCase();
    return {
      ...question,
      sourceTitle: source.title,
      confirmed: !existingKeys.has(key),
      duplicate: existingKeys.has(key),
    };
  });
  const duplicateCount = extraction.duplicateCount + questions.filter((question) => question.duplicate).length;

  const batch = await prisma.importBatch.create({
    data: {
      userId: user.id,
      sourceDocumentId: source.id,
      filename: file.name,
      type: sourceType,
      status: ImportStatus.DRAFT,
      detectedCount: extraction.detectedCount,
      duplicateCount,
      openAnswerCount: extraction.openAnswerCount,
      skippedCount: duplicateCount,
      summary: JSON.stringify({
        pages: pages.length,
        title: source.title,
        sourceType,
      }),
    },
  });

  return {
    sourceDocumentId: source.id,
    importBatchId: batch.id,
    title: source.title,
    filename: file.name,
    pageCount: pages.length,
    detectedCount: extraction.detectedCount,
    duplicateCount,
    openAnswerCount: extraction.openAnswerCount,
    questions,
  };
}

export async function confirmPdfImportAction(input: unknown) {
  const parsed = confirmSchema.parse(input);
  const source = await prisma.sourceDocument.findUnique({
    where: { id: parsed.sourceDocumentId },
  });
  if (!source) throw new Error("Quelle wurde nicht gefunden.");

  let importedCount = 0;
  let skippedCount = 0;
  let duplicateCount = 0;
  let openAnswerCount = 0;

  for (const item of parsed.questions) {
    if (!item.confirmed) {
      skippedCount += 1;
      if (item.duplicate) duplicateCount += 1;
      continue;
    }

    const existing = await prisma.question.findFirst({
      where: { question: item.question },
      select: { id: true },
    });
    if (existing) {
      skippedCount += 1;
      duplicateCount += 1;
      continue;
    }

    const category = await prisma.category.upsert({
      where: { slug: slugify(item.category) },
      create: {
        name: item.category,
        slug: slugify(item.category),
        description: "Automatisch durch PDF-Import vorgeschlagen.",
        color: "#38bdf8",
      },
      update: {},
    });

    const answer = item.answer.trim() || "Antwort offen";
    const isOpen = item.answerStatus === "open" || answer === "Antwort offen";
    await prisma.question.create({
      data: {
        question: item.question,
        answer,
        answerStatus: isOpen ? AnswerStatus.OPEN : AnswerStatus.ANSWERED,
        type: "OPEN",
        difficulty: "LAP_RELEVANT",
        relevance: "VERY_HIGH",
        categoryId: category.id,
        sourceId: source.id,
        sourcePage: item.pageNumber,
        tags: JSON.stringify(["pdf-import", source.type.toLowerCase()]),
        isOfficial: source.type === SourceType.WKO,
        isDemo: false,
        isActive: true,
      },
    });
    importedCount += 1;
    if (isOpen) openAnswerCount += 1;
  }

  await prisma.importBatch.update({
    where: { id: parsed.importBatchId },
    data: {
      status: ImportStatus.IMPORTED,
      detectedCount: parsed.questions.length,
      importedCount,
      skippedCount,
      duplicateCount,
      openAnswerCount,
      summary: JSON.stringify({
        sourceTitle: source.title,
        sourceType: source.type,
        completedAt: new Date().toISOString(),
      }),
    },
  });

  revalidatePath("/admin/import/pdf");
  revalidatePath("/questions");
  revalidatePath("/learn");
  revalidatePath("/exam");

  return {
    detectedCount: parsed.questions.length,
    importedCount,
    skippedCount,
    duplicateCount,
    openAnswerCount,
  };
}
