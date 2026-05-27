import { Difficulty, QuestionType, Relevance } from "@prisma/client";
import Link from "next/link";

import { saveQuestionAction, deleteQuestionAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { difficultyLabels, relevanceLabels, typeLabels } from "@/lib/labels";
import { prisma } from "@/lib/db/prisma";

type AdminQuestionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminQuestionsPage({ searchParams }: AdminQuestionsPageProps) {
  const params = await searchParams;
  const editId = typeof params.edit === "string" ? params.edit : undefined;
  const [categories, questions, editQuestion] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.question.findMany({
      include: { category: true, source: true, options: { orderBy: { order: "asc" } } },
      orderBy: { updatedAt: "desc" },
      take: 80,
    }),
    editId
      ? prisma.question.findUnique({
          where: { id: editId },
          include: { options: { orderBy: { order: "asc" } }, source: true },
        })
      : null,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="warning">Admin</Badge>
        <h1 className="mt-3 text-3xl font-bold text-white">Fragenverwaltung</h1>
        <p className="mt-2 text-slate-400">Manuelle Fragenanlage, Bearbeitung und private Quellenverwaltung.</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{editQuestion ? "Frage bearbeiten" : "Neue Frage erstellen"}</CardTitle>
            <CardDescription>Offizielle Inhalte nur einpflegen, wenn die Nutzung eindeutig erlaubt ist.</CardDescription>
          </div>
        </CardHeader>
        <form action={saveQuestionAction} className="grid gap-4">
          {editQuestion ? <input type="hidden" name="id" value={editQuestion.id} /> : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Frage</Label>
              <Textarea name="question" required defaultValue={editQuestion?.question} />
            </div>
            <div className="space-y-2">
              <Label>Musterantwort</Label>
              <Textarea name="answer" required defaultValue={editQuestion?.answer} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select name="categoryId" required defaultValue={editQuestion?.categoryId}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Typ</Label>
              <Select name="type" defaultValue={editQuestion?.type ?? QuestionType.FLASHCARD}>
                {Object.entries(typeLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Schwierigkeit</Label>
              <Select name="difficulty" defaultValue={editQuestion?.difficulty ?? Difficulty.MEDIUM}>
                {Object.entries(difficultyLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Relevanz</Label>
              <Select name="relevance" defaultValue={editQuestion?.relevance ?? Relevance.HIGH}>
                {Object.entries(relevanceLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Quelle</Label>
              <Input name="sourceTitle" required defaultValue={editQuestion?.source?.title ?? "Eigene Notizen"} />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input name="tags" placeholder="dns, tcp, security" defaultValue="" />
            </div>
            <div className="space-y-2">
              <Label>Bewertungskriterien</Label>
              <Input name="criteria" defaultValue={editQuestion?.criteria ?? ""} />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label>Erklärung</Label>
              <Textarea name="explanation" defaultValue={editQuestion?.explanation ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>Multiple-Choice-Optionen</Label>
              <Textarea
                name="options"
                placeholder="[x] Richtige Option&#10;[ ] Falsche Option"
                defaultValue={editQuestion?.options
                  .map((option) => `${option.isCorrect ? "[x]" : "[ ]"} ${option.text}`)
                  .join("\n")}
              />
            </div>
          </div>
          <Button type="submit">{editQuestion ? "Änderungen speichern" : "Frage erstellen"}</Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Bestehende Fragen</CardTitle>
            <CardDescription>Aktive und importierte Fragen verwalten.</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-hidden rounded-lg border border-slate-800">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-950 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Frage</th>
                <th className="px-4 py-3">Kategorie</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {questions.map((question) => (
                <tr key={question.id} className="bg-slate-950/35">
                  <td className="px-4 py-4">
                    <Link href={`/questions/${question.id}`} className="font-semibold text-white hover:text-sky-200">
                      {question.question}
                    </Link>
                    <div className="mt-2 text-xs text-slate-500">{question.source?.title ?? "Ohne Quelle"}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{question.category.name}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {question.isDemo ? <Badge variant="warning">Demo</Badge> : <Badge variant="info">Privat</Badge>}
                      {question.isActive ? <Badge variant="success">Aktiv</Badge> : <Badge variant="danger">Inaktiv</Badge>}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <Link className="rounded-md border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200" href={`/admin/questions?edit=${question.id}`}>
                        Bearbeiten
                      </Link>
                      <form action={deleteQuestionAction}>
                        <input type="hidden" name="id" value={question.id} />
                        <button className="rounded-md border border-rose-400/40 px-3 py-2 text-xs font-semibold text-rose-200">
                          Löschen
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
