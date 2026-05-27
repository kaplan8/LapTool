import { QuestionType } from "@prisma/client";

import { startExamAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label, Select } from "@/components/ui/form";
import { typeLabels } from "@/lib/labels";
import { prisma } from "@/lib/db/prisma";

export default async function ExamPage() {
  const [categories, importedCount] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { questions: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.question.count({ where: { isActive: true, isDemo: false } }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Badge variant="info">Exam Simulation</Badge>
        <h1 className="mt-3 text-3xl font-bold text-white">Prüfungsmodus starten</h1>
        <p className="mt-2 text-slate-400">Konfiguriere eine ruhige, prüfungsnahe LAP-Simulation mit Timer.</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Prüfungskonfiguration</CardTitle>
            <CardDescription>Standard ist gemischt über alle Knowledge Areas.</CardDescription>
          </div>
        </CardHeader>
        <form action={startExamAction} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Anzahl Fragen</Label>
              <Select name="questionCount" defaultValue="20">
                {[10, 20, 30, 50].map((count) => <option key={count} value={count}>{count} Fragen</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zeitlimit</Label>
              <Select name="durationMinutes" defaultValue="30">
                {[15, 30, 60, 90].map((minutes) => <option key={minutes} value={minutes}>{minutes} Minuten</option>)}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Fragenquelle</Label>
              <Select name="sourceMode" defaultValue={importedCount > 0 ? "imported" : "all"}>
                <option value="imported">Aktive importierte Fragen</option>
                <option value="wko">Nur WKO-Import</option>
                <option value="all">Alle Fragen</option>
              </Select>
            </div>
            <label className="flex items-center gap-3 self-end rounded-lg border border-slate-800 bg-slate-950/45 p-3 text-sm text-slate-200">
              <input
                name="excludeDemo"
                type="checkbox"
                defaultChecked={importedCount > 0}
                className="h-4 w-4 accent-sky-400"
              />
              Demo-Fragen ausschließen
            </label>
          </div>

          <div>
            <Label>Kategorien</Label>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/45 p-3 text-sm text-slate-200">
                  <span>{category.name}</span>
                  <span className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{category._count.questions}</span>
                    <input name="categoryIds" type="checkbox" value={category.id} className="h-4 w-4 accent-sky-400" />
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Fragetypen</Label>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {Object.values(QuestionType).map((type) => (
                <label key={type} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/45 p-3 text-sm text-slate-200">
                  <input name="types" type="checkbox" value={type} className="h-4 w-4 accent-sky-400" />
                  {typeLabels[type]}
                </label>
              ))}
            </div>
          </div>

          <Button type="submit">Prüfung starten</Button>
        </form>
      </Card>
    </div>
  );
}
