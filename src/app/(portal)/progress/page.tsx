import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardData } from "@/lib/data/dashboard";

export default async function ProgressPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="info">Progress Analytics</Badge>
        <h1 className="mt-3 text-3xl font-bold text-white">Fortschritt & Schwächenanalyse</h1>
        <p className="mt-2 text-slate-400">Kategoriebezogene Mastery, Wiederholungen und Exam Readiness.</p>
      </div>

      <DashboardCharts
        categories={data.categoryStats}
        correct={data.correct}
        wrong={data.wrong}
        readiness={data.readiness}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Schwächenanalyse nach Kategorie</CardTitle>
              <CardDescription>Sortiert nach niedrigster Mastery.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {[...data.categoryStats].sort((a, b) => a.mastery - b.mastery).map((category) => (
              <div key={category.id} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    {category.mastery < 40 ? <AlertTriangle className="h-4 w-4 text-amber-300" /> : <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
                    {category.name}
                  </div>
                  <Badge variant={category.mastery < 40 ? "warning" : "success"}>{category.mastery}%</Badge>
                </div>
                <Progress value={category.mastery} className="mt-3" indicatorClassName={category.mastery < 40 ? "bg-amber-400" : "bg-emerald-400"} />
                <p className="mt-2 text-xs text-slate-500">
                  {category.learned}/{category.total} gelernt · {category.correctCount} richtig · {category.wrongCount} falsch
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Lernplan-Empfehlung</CardTitle>
              <CardDescription>Pragmatische nächste Schritte für die laufende Woche.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {data.weakCategories.map((category, index) => (
              <div key={category.id} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
                <Badge variant="info">Block {index + 1}</Badge>
                <div className="mt-3 font-semibold text-white">{category.name}</div>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  20 Minuten Wiederholung, danach 10 Karteikarten und eine kurze Prüfungssimulation mit diesem Schwerpunkt.
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
