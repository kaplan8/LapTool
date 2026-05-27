import { Database, FileUp, FolderTree, ShieldAlert } from "lucide-react";

import { deleteDemoQuestionsAction, hideDemoQuestionsAction, showDemoQuestionsAction } from "./actions";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export default async function AdminPage() {
  const [questions, categories, sources, imports] = await Promise.all([
    prisma.question.count(),
    prisma.category.count(),
    prisma.sourceDocument.count(),
    prisma.importBatch.count(),
  ]);
  const [activeDemo, hiddenDemo, importedQuestions] = await Promise.all([
    prisma.question.count({ where: { isDemo: true, isActive: true } }),
    prisma.question.count({ where: { isDemo: true, isActive: false } }),
    prisma.question.count({ where: { isDemo: false } }),
  ]);
  const stats = [
    { label: "Fragen", value: questions, icon: Database },
    { label: "Kategorien", value: categories, icon: FolderTree },
    { label: "Quellen", value: sources, icon: ShieldAlert },
    { label: "Import-Batches", value: imports, icon: FileUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="warning">Admin Center</Badge>
        <h1 className="mt-3 text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 max-w-3xl text-slate-400">
          Fragen, Kategorien, Quellen und Imports verwalten. Standard ist private Nutzung.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <Icon className="h-5 w-5 text-sky-300" />
            <div className="mt-4 text-3xl font-bold text-white">{String(value)}</div>
            <div className="text-sm text-slate-400">{label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Rechtlicher Admin-Hinweis</CardTitle>
            <CardDescription>
              Offizielle Logos, Markenfarben und Inhalte dürfen nur mit Berechtigung eingebunden werden.
            </CardDescription>
          </div>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/admin/questions">Fragen verwalten</ButtonLink>
          <ButtonLink href="/admin/import" variant="secondary">CSV/JSON importieren</ButtonLink>
          <ButtonLink href="/admin/import/pdf" variant="secondary">WKO-PDF importieren</ButtonLink>
          <ButtonLink href="/admin/categories" variant="secondary">Kategorien verwalten</ButtonLink>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Demo-Fragen steuern</CardTitle>
            <CardDescription>
              Nach echten PDF-Imports verwenden Lern- und Prüfungsmodus standardmäßig importierte Fragen. Hier kannst du
              Demo-Fragen zusätzlich ausblenden oder löschen.
            </CardDescription>
          </div>
          <Badge variant={importedQuestions > 0 ? "success" : "warning"}>
            {importedQuestions} importierte Fragen
          </Badge>
        </CardHeader>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge>{activeDemo} aktive Demo-Fragen</Badge>
          <Badge>{hiddenDemo} ausgeblendete Demo-Fragen</Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <form action={hideDemoQuestionsAction}>
            <button className="rounded-md border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100">
              Demo-Fragen ausblenden
            </button>
          </form>
          <form action={showDemoQuestionsAction}>
            <button className="rounded-md border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-100">
              Demo-Fragen wieder aktivieren
            </button>
          </form>
          <form action={deleteDemoQuestionsAction}>
            <button className="rounded-md border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-100">
              Demo-Fragen löschen
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
