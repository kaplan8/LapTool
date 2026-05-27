"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Flag } from "lucide-react";

import { finishExamAction } from "@/app/(portal)/exam/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { typeLabels } from "@/lib/labels";

type ExamQuestion = {
  examAnswerId: string;
  questionId: string;
  question: string;
  answer: string;
  type: keyof typeof typeLabels;
  category: string;
  options: { id: string; text: string }[];
};

type AnswerState = {
  userAnswer: string;
  selectedOptionIds: string[];
  manualCorrect: boolean;
};

export function ExamSessionClient({
  sessionId,
  durationSeconds,
  questions,
}: {
  sessionId: string;
  durationSeconds: number;
  questions: ExamQuestion[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(durationSeconds);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [pending, startTransition] = useTransition();
  const current = questions[index];
  const answeredCount = Object.values(answers).filter(
    (answer) => answer.userAnswer || answer.selectedOptionIds.length || answer.manualCorrect,
  ).length;

  const timeLabel = useMemo(() => {
    const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
    const seconds = (remaining % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remaining]);

  useEffect(() => {
    if (remaining <= 0) {
      finish();
      return;
    }
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  });

  function updateAnswer(patch: Partial<AnswerState>) {
    setAnswers((state) => ({
      ...state,
      [current.examAnswerId]: {
        ...(state[current.examAnswerId] ?? {
          userAnswer: "",
          selectedOptionIds: [],
          manualCorrect: false,
        }),
        ...patch,
      },
    }));
  }

  function toggleOption(optionId: string) {
    const state = answers[current.examAnswerId] ?? { userAnswer: "", selectedOptionIds: [], manualCorrect: false };
    const selected = new Set(state.selectedOptionIds);
    if (selected.has(optionId)) selected.delete(optionId);
    else selected.add(optionId);
    updateAnswer({ selectedOptionIds: Array.from(selected) });
  }

  function finish() {
    startTransition(async () => {
      const payload = questions.map((question) => ({
        examAnswerId: question.examAnswerId,
        questionId: question.questionId,
        userAnswer: answers[question.examAnswerId]?.userAnswer ?? "",
        selectedOptionIds: answers[question.examAnswerId]?.selectedOptionIds ?? [],
        manualCorrect: answers[question.examAnswerId]?.manualCorrect ?? false,
      }));
      const result = await finishExamAction(sessionId, payload);
      router.push(`/exam/result/${result.sessionId}`);
    });
  }

  if (!current) {
    return <Card>Keine Prüfungsfragen gefunden.</Card>;
  }

  const currentAnswer = answers[current.examAnswerId] ?? { userAnswer: "", selectedOptionIds: [], manualCorrect: false };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Badge variant="info">Prüfungssimulation</Badge>
          <h1 className="mt-3 text-3xl font-bold text-white">LAP Simulation</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={remaining < 300 ? "danger" : "warning"}>
            <Clock className="mr-1 h-3.5 w-3.5" />
            {timeLabel}
          </Badge>
          <Badge>{answeredCount}/{questions.length} beantwortet</Badge>
          <Button onClick={finish} disabled={pending} variant="success">
            <Flag className="h-4 w-4" />
            Prüfung abgeben
          </Button>
        </div>
      </div>

      <Progress value={(answeredCount / questions.length) * 100} />

      <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
        <Card className="min-h-[520px] p-7">
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">{current.category}</Badge>
            <Badge>{typeLabels[current.type]}</Badge>
            <Badge variant="violet">Frage {index + 1} / {questions.length}</Badge>
          </div>
          <p className="mt-8 text-2xl font-semibold leading-10 text-white">{current.question}</p>

          {current.type === "MULTIPLE_CHOICE" ? (
            <div className="mt-8 grid gap-3">
              {current.options.map((option) => (
                <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/45 p-4 text-slate-200">
                  <input
                    type="checkbox"
                    checked={currentAnswer.selectedOptionIds.includes(option.id)}
                    onChange={() => toggleOption(option.id)}
                    className="h-4 w-4 accent-sky-400"
                  />
                  {option.text}
                </label>
              ))}
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <textarea
                value={currentAnswer.userAnswer}
                onChange={(event) => updateAnswer({ userAnswer: event.target.value })}
                className="min-h-40 w-full rounded-lg border border-slate-700 bg-slate-950/70 p-4 text-slate-100 outline-none focus:border-sky-400"
                placeholder="Antwort notieren..."
              />
              <label className="flex items-center gap-3 rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
                <input
                  type="checkbox"
                  checked={currentAnswer.manualCorrect}
                  onChange={(event) => updateAnswer({ manualCorrect: event.target.checked })}
                  className="h-4 w-4 accent-emerald-400"
                />
                Nach Selbstvergleich als richtig markieren
              </label>
              <details className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
                <summary className="cursor-pointer font-semibold text-sky-200">Musterantwort anzeigen</summary>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{current.answer}</p>
              </details>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <Button variant="secondary" disabled={index === 0} onClick={() => setIndex((value) => Math.max(0, value - 1))}>
              Zurück
            </Button>
            <Button disabled={index === questions.length - 1} onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))}>
              Weiter
            </Button>
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            Navigation
          </div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, questionIndex) => {
              const hasAnswer = answers[question.examAnswerId];
              return (
                <button
                  key={question.examAnswerId}
                  onClick={() => setIndex(questionIndex)}
                  className={`h-10 rounded-md text-sm font-semibold ${
                    questionIndex === index
                      ? "bg-sky-400 text-slate-950"
                      : hasAnswer
                        ? "bg-emerald-400/20 text-emerald-100"
                        : "bg-slate-900 text-slate-400"
                  }`}
                >
                  {questionIndex + 1}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
