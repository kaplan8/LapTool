"use client";

import { useMemo, useState, useTransition } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

import { reviewQuestionAction } from "@/app/(portal)/learn/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { difficultyLabels, typeLabels } from "@/lib/labels";

type LearningQuestion = {
  id: string;
  question: string;
  answer: string;
  explanation: string | null;
  category: string;
  difficulty: keyof typeof difficultyLabels;
  type: keyof typeof typeLabels;
  source: string;
  isDemo: boolean;
  due: boolean;
};

const ratingButtons = [
  { rating: "again" as const, label: "Nicht gewusst", variant: "danger" as const },
  { rating: "hard" as const, label: "Schwer", variant: "secondary" as const },
  { rating: "good" as const, label: "Gut", variant: "primary" as const },
  { rating: "easy" as const, label: "Einfach", variant: "success" as const },
];

export function LearningSession({ questions }: { questions: LearningQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [pending, startTransition] = useTransition();
  const current = questions[index];
  const progress = questions.length === 0 ? 100 : Math.round((reviewed / questions.length) * 100);

  const sessionLabel = useMemo(() => {
    const due = questions.filter((question) => question.due).length;
    return due > 0 ? `${due} fällige Karten` : "Neue und zufällige Karten";
  }, [questions]);

  if (!current) {
    return (
      <Card className="mx-auto max-w-3xl text-center">
        <Sparkles className="mx-auto h-10 w-10 text-emerald-300" />
        <h2 className="mt-4 text-2xl font-bold text-white">Alles erledigt für heute</h2>
        <p className="mt-2 text-slate-400">
          Session abgeschlossen: {reviewed} Karten, {correct} sicher beantwortet.
        </p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          <RotateCcw className="h-4 w-4" />
          Neue Session laden
        </Button>
      </Card>
    );
  }

  function rate(rating: "again" | "hard" | "good" | "easy") {
    startTransition(async () => {
      await reviewQuestionAction({ questionId: current.id, rating });
      setReviewed((value) => value + 1);
      if (rating === "good" || rating === "easy") setCorrect((value) => value + 1);
      setRevealed(false);
      setIndex((value) => value + 1);
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Badge variant="info">{sessionLabel}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-white">Lernmodus</h1>
        </div>
        <div className="w-full md:w-64">
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>Session</span>
            <span>{reviewed}/{questions.length}</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      <Card className="min-h-[420px] p-8">
        <div className="flex flex-wrap gap-2">
          <Badge variant="info">{current.category}</Badge>
          <Badge>{typeLabels[current.type]}</Badge>
          <Badge variant="violet">{difficultyLabels[current.difficulty]}</Badge>
          {current.isDemo ? <Badge variant="warning">Demo-Frage - nicht offiziell</Badge> : null}
        </div>

        <div className="mt-8 rounded-lg border border-slate-800 bg-slate-950/45 p-6">
          <div className="text-sm uppercase tracking-[0.16em] text-slate-500">Vorderseite</div>
          <p className="mt-4 text-2xl font-semibold leading-10 text-white">{current.question}</p>
        </div>

        {revealed ? (
          <div className="mt-5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-6">
            <div className="text-sm uppercase tracking-[0.16em] text-emerald-200">Rückseite</div>
            <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-slate-100">{current.answer}</p>
            {current.explanation ? <p className="mt-4 text-sm leading-6 text-slate-300">{current.explanation}</p> : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">Quelle: {current.source}</div>
          {!revealed ? (
            <Button onClick={() => setRevealed(true)}>Antwort anzeigen</Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ratingButtons.map((button) => (
                <Button
                  key={button.rating}
                  variant={button.variant}
                  disabled={pending}
                  onClick={() => rate(button.rating)}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
