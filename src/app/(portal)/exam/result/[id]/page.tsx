import { CheckCircle2, XCircle } from "lucide-react";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { typeLabels } from "@/lib/labels";
import { prisma } from "@/lib/db/prisma";
import { parseJsonArray } from "@/lib/utils";

type ExamResultPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExamResultPage({ params }: ExamResultPageProps) {
  const { id } = await params;
  const session = await prisma.examSession.findUnique({
    where: { id },
    include: {
      answers: {
        include: {
          question: {
            include: { category: true, options: true },
          },
        },
      },
    },
  });

  if (!session) notFound();
  const config = JSON.parse(session.config || "{}") as { recommendations?: string[] };
  const recommendations = config.recommendations ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Badge variant={session.passed ? "success" : "danger"}>
            {session.passed ? "Bestanden" : "Nicht bestanden"}
          </Badge>
          <h1 className="mt-3 text-3xl font-bold text-white">Prüfungsauswertung</h1>
          <p className="mt-2 text-slate-400">Punkte, Musterantworten und Empfehlungen nach Kategorie.</p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/exam">Neue Prüfung</ButtonLink>
          <ButtonLink href="/learn" variant="secondary">Schwächen lernen</ButtonLink>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <div className="text-sm text-slate-400">Punkte</div>
          <div className="mt-3 text-3xl font-bold text-white">{session.score} / {session.maxScore}</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-400">Prozent</div>
          <div className="mt-3 text-3xl font-bold text-white">{Math.round(session.percentage)}%</div>
        </Card>
        <Card>
          <div className="text-sm text-slate-400">Richtig</div>
          <div className="mt-3 text-3xl font-bold text-emerald-300">
            {session.answers.filter((answer) => answer.isCorrect).length}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-slate-400">Falsch</div>
          <div className="mt-3 text-3xl font-bold text-rose-300">
            {session.answers.filter((answer) => !answer.isCorrect).length}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Empfehlungen</CardTitle>
            <CardDescription>Wiederhole die Knowledge Areas mit der höchsten Fehlerquote.</CardDescription>
          </div>
        </CardHeader>
        {recommendations.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {recommendations.map((recommendation) => (
              <div key={recommendation} className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                {recommendation}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Stark, aktuell keine kritischen Schwächen.
          </p>
        )}
      </Card>

      <Card>
        <CardTitle>Antworten</CardTitle>
        <div className="mt-4 space-y-3">
          {session.answers.map((answer) => (
            <details key={answer.id} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
              <summary className="cursor-pointer">
                <span className="inline-flex items-center gap-2 font-semibold text-white">
                  {answer.isCorrect ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <XCircle className="h-4 w-4 text-rose-300" />}
                  {answer.question.question}
                </span>
                <span className="ml-3 text-xs text-slate-500">{typeLabels[answer.question.type]} · {answer.question.category.name}</span>
              </summary>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Deine Antwort</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                    {answer.userAnswer || parseJsonArray<string>(answer.selectedOptionIds).join(", ") || "Keine Antwort"}
                  </p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Musterantwort</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{answer.question.answer}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </Card>
    </div>
  );
}
