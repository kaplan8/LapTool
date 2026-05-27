import { Search } from "lucide-react";
import Link from "next/link";
import { Difficulty, QuestionType } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/form";
import { difficultyLabels, relevanceLabels, typeLabels } from "@/lib/labels";
import { prisma } from "@/lib/db/prisma";
import { parseJsonArray } from "@/lib/utils";

type QuestionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function QuestionsPage({ searchParams }: QuestionsPageProps) {
  const params = await searchParams;
  const search = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const type = typeof params.type === "string" ? params.type : "";
  const difficulty = typeof params.difficulty === "string" ? params.difficulty : "";

  const [categories, questions, sources] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.question.findMany({
      where: {
        isActive: true,
        ...(search ? { question: { contains: search } } : {}),
        ...(category ? { category: { slug: category } } : {}),
        ...(type && Object.values(QuestionType).includes(type as QuestionType) ? { type: type as QuestionType } : {}),
        ...(difficulty && Object.values(Difficulty).includes(difficulty as Difficulty)
          ? { difficulty: difficulty as Difficulty }
          : {}),
      },
      include: {
        category: true,
        source: true,
        progress: true,
      },
      orderBy: [{ category: { name: "asc" } }, { createdAt: "desc" }],
    }),
    prisma.sourceDocument.findMany({ orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Badge variant="info">Knowledge Areas</Badge>
          <h1 className="mt-3 text-3xl font-bold text-white">Fragenkatalog</h1>
          <p className="mt-2 text-slate-400">Suche, filtere und prüfe alle aktiven Fragen samt Quellen.</p>
        </div>
        <ButtonLink href="/admin/questions" variant="secondary">Frage erstellen</ButtonLink>
      </div>

      <Card>
        <form className="grid gap-3 lg:grid-cols-[1fr_220px_220px_220px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
            <Input name="q" defaultValue={search} placeholder="Frage, Tag oder Begriff suchen" className="pl-9" />
          </div>
          <Select name="category" defaultValue={category}>
            <option value="">Alle Kategorien</option>
            {categories.map((item) => (
              <option key={item.id} value={item.slug}>{item.name}</option>
            ))}
          </Select>
          <Select name="difficulty" defaultValue={difficulty}>
            <option value="">Alle Schwierigkeiten</option>
            {Object.entries(difficultyLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
          <Select name="type" defaultValue={type}>
            <option value="">Alle Fragetypen</option>
            {Object.entries(typeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
          <button className="rounded-md bg-sky-400 px-4 text-sm font-semibold text-slate-950">Filtern</button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{questions.length} Fragen</CardTitle>
            <CardDescription>{sources.length} Quellen im System, importierte Inhalte bleiben privat.</CardDescription>
          </div>
        </CardHeader>

        {questions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-400">
            Keine Fragen vorhanden. Importiere deinen ersten Fragenkatalog.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-800">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase tracking-[0.12em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Frage</th>
                  <th className="px-4 py-3">Kategorie</th>
                  <th className="px-4 py-3">Typ</th>
                  <th className="px-4 py-3">Relevanz</th>
                  <th className="px-4 py-3">Quelle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {questions.map((question) => (
                  <tr key={question.id} className="bg-slate-950/35 transition hover:bg-slate-900/70">
                    <td className="px-4 py-4">
                      <Link href={`/questions/${question.id}`} className="font-semibold text-white hover:text-sky-200">
                        {question.question}
                      </Link>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {question.isDemo ? <Badge variant="warning">Demo-Frage - nicht offiziell</Badge> : null}
                        {question.answerStatus === "OPEN" ? <Badge variant="warning">Antwort offen</Badge> : null}
                        {parseJsonArray<string>(question.tags).slice(0, 3).map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{question.category.name}</td>
                    <td className="px-4 py-4"><Badge variant="info">{typeLabels[question.type]}</Badge></td>
                    <td className="px-4 py-4">
                      <Badge variant={question.relevance === "VERY_HIGH" ? "success" : "default"}>
                        {relevanceLabels[question.relevance]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-400">{question.source?.title ?? "Ohne Quelle"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
