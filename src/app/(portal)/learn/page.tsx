import { AnswerStatus, SourceType } from "@prisma/client";

import { LearningSession } from "@/components/learning/learning-session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/form";
import { getCurrentUser } from "@/lib/auth/demo-user";
import { prisma } from "@/lib/db/prisma";

type LearnPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LearnPage({ searchParams }: LearnPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const [importedCount, categories] = await Promise.all([
    prisma.question.count({ where: { isActive: true, isDemo: false } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  const sourceMode = typeof params.source === "string" ? params.source : importedCount > 0 ? "imported" : "all";
  const categoryId = typeof params.category === "string" ? params.category : "";
  const openOnly = params.openOnly === "on";
  const dueOnly = params.dueOnly === "on";

  const questions = await prisma.question.findMany({
    where: {
      isActive: true,
      ...(categoryId ? { categoryId } : {}),
      ...(openOnly ? { answerStatus: AnswerStatus.OPEN } : {}),
      ...(sourceMode === "imported" ? { isDemo: false } : {}),
      ...(sourceMode === "demo" ? { isDemo: true } : {}),
      ...(sourceMode === "wko" ? { source: { type: SourceType.WKO } } : {}),
    },
    include: {
      category: true,
      source: true,
      progress: { where: { userId: user.id } },
    },
    orderBy: [{ relevance: "desc" }, { createdAt: "asc" }],
  });

  const now = new Date();
  const sessionQuestions = questions
    .map((question) => {
      const progress = question.progress[0];
      const due = !progress?.nextReviewAt || progress.nextReviewAt <= now;
      return {
        id: question.id,
        question: question.question,
        answer: question.answer,
        explanation: question.explanation,
        category: question.category.name,
        difficulty: question.difficulty,
        type: question.type,
        source: question.source?.title ?? "Ohne Quelle",
        isDemo: question.isDemo,
        due,
      };
    })
    .filter((question) => (dueOnly ? question.due : true))
    .sort((a, b) => Number(b.due) - Number(a.due))
    .slice(0, 30);

  return (
    <div className="space-y-5">
      <Card>
        <form className="grid gap-3 lg:grid-cols-[240px_1fr_repeat(2,190px)_auto]">
          <Select name="source" defaultValue={sourceMode}>
            <option value="imported">Aktive importierte Fragen</option>
            <option value="wko">Alle WKO-Fragen lernen</option>
            <option value="all">Alle Fragen inkl. Demo</option>
            <option value="demo">Nur Demo-Fragen</option>
          </Select>
          <Select name="category" defaultValue={categoryId}>
            <option value="">Alle Kategorien</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-300">
            <input name="openOnly" type="checkbox" defaultChecked={openOnly} className="h-4 w-4 accent-sky-400" />
            Nur Fragen ohne Antwort
          </label>
          <label className="flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950/70 px-3 text-sm text-slate-300">
            <input name="dueOnly" type="checkbox" defaultChecked={dueOnly} className="h-4 w-4 accent-sky-400" />
            Nur fällige Fragen
          </label>
          <Button>Filter anwenden</Button>
        </form>
        {importedCount > 0 ? (
          <p className="mt-3 text-xs text-slate-500">
            Standard: Demo-Fragen werden nicht gemischt. Wähle die Option Alle Fragen inkl. Demo, wenn du sie bewusst
            einbeziehen willst.
          </p>
        ) : (
          <div className="mt-3">
            <Badge variant="warning">Noch keine echten importierten Fragen vorhanden</Badge>
          </div>
        )}
      </Card>
      <LearningSession questions={sessionQuestions} />
    </div>
  );
}
