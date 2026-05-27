import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { difficultyLabels, relevanceLabels, typeLabels } from "@/lib/labels";
import { prisma } from "@/lib/db/prisma";
import { formatDateTime, parseJsonArray } from "@/lib/utils";

type QuestionDetailProps = {
  params: Promise<{ id: string }>;
};

export default async function QuestionDetailPage({ params }: QuestionDetailProps) {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      category: true,
      source: true,
      options: { orderBy: { order: "asc" } },
      progress: true,
    },
  });

  if (!question) notFound();
  const tags = parseJsonArray<string>(question.tags);
  const progress = question.progress[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Badge variant="info">{question.category.name}</Badge>
          <h1 className="mt-3 max-w-4xl text-3xl font-bold text-white">{question.question}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>{typeLabels[question.type]}</Badge>
            <Badge variant="violet">{difficultyLabels[question.difficulty]}</Badge>
            <Badge variant="success">{relevanceLabels[question.relevance]}</Badge>
            {question.answerStatus === "OPEN" ? <Badge variant="warning">Antwort offen</Badge> : null}
            {question.isDemo ? <Badge variant="warning">Demo-Frage - nicht offiziell</Badge> : null}
          </div>
        </div>
        <ButtonLink href={`/admin/questions?edit=${question.id}`} variant="secondary">Bearbeiten</ButtonLink>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.45fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Musterantwort</CardTitle>
              <CardDescription>Zum Selbstvergleich im Lern- und Prüfungsmodus.</CardDescription>
            </div>
          </CardHeader>
          <p className="whitespace-pre-wrap text-slate-200">{question.answer}</p>
          {question.explanation ? (
            <div className="mt-6 rounded-lg border border-sky-400/20 bg-sky-400/10 p-4">
              <div className="text-sm font-semibold text-sky-100">Manuelle Erklärung</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{question.explanation}</p>
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-400">
              KI-Erklärungen sind vorbereitet, aber im MVP nicht aktiv. Admins können Erklärungen manuell pflegen.
            </div>
          )}
        </Card>

        <Card>
          <CardTitle>Quelle & Statistik</CardTitle>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Quelle</dt>
              <dd className="text-right text-slate-200">{question.source?.title ?? "Keine Quelle"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Letzte Wiederholung</dt>
              <dd className="text-right text-slate-200">{formatDateTime(progress?.lastReviewedAt)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Nächste Wiederholung</dt>
              <dd className="text-right text-slate-200">{formatDateTime(progress?.nextReviewAt)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-500">Erfolgsquote</dt>
              <dd className="text-right text-slate-200">
                {progress && progress.correctCount + progress.wrongCount > 0
                  ? `${Math.round((progress.correctCount / (progress.correctCount + progress.wrongCount)) * 100)}%`
                  : "Noch offen"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {question.options.length > 0 ? (
        <Card>
          <CardTitle>Antwortoptionen</CardTitle>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {question.options.map((option) => (
              <div key={option.id} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
                <Badge variant={option.isCorrect ? "success" : "default"}>{option.isCorrect ? "Richtig" : "Falsch"}</Badge>
                <p className="mt-3 text-slate-200">{option.text}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <CardTitle>Tags</CardTitle>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.length > 0 ? tags.map((tag) => <Badge key={tag}>{tag}</Badge>) : <span className="text-sm text-slate-500">Keine Tags</span>}
        </div>
      </Card>
    </div>
  );
}
