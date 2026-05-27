import { BarChart3, BookOpenCheck, CalendarCheck, Flame, Gauge, GraduationCap, Target, Trophy } from "lucide-react";

import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { SkillMatrix } from "@/components/dashboard/skill-matrix";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Badge variant="info">Digital Evolution Academy</Badge>
          <h1 className="mt-3 text-3xl font-bold text-white md:text-4xl">Apprentice Dashboard</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Fokus auf LAP-relevante Knowledge Areas, fällige Wiederholungen und prüfungsnahe Simulationen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/learn">
            <BookOpenCheck className="h-4 w-4" />
            Lernen starten
          </ButtonLink>
          <ButtonLink href="/exam" variant="secondary">
            <GraduationCap className="h-4 w-4" />
            Prüfung simulieren
          </ButtonLink>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Exam Readiness Score"
          value={`${data.readiness}%`}
          detail="Kombiniert Fortschritt, Mastery und letzte Prüfung."
          icon={<Gauge className="h-5 w-5" />}
        />
        <StatCard
          label="Heute fällige Karteikarten"
          value={data.dueCards}
          detail="Neue und fällige Wiederholungen im Systemtechnik Track."
          icon={<CalendarCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Gesamtfortschritt"
          value={`${data.progressPercent}%`}
          detail={`${data.learnedQuestions} von ${data.totalQuestions} Fragen gelernt.`}
          icon={<Target className="h-5 w-5" />}
        />
        <StatCard
          label="Lernstreak"
          value={`${data.streak} Tage`}
          detail={`${data.dailyGoal} Fragen Tagesziel, ${data.learningTimeMinutes} Minuten Lernzeit.`}
          icon={<Flame className="h-5 w-5" />}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Skill Matrix</CardTitle>
              <CardDescription>IT-Service-Bereiche als Kompetenzprofil für die LAP.</CardDescription>
            </div>
            <Badge variant="success">{data.masteredQuestions} gemeistert</Badge>
          </CardHeader>
          <SkillMatrix skills={data.categoryStats} />
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Schwächste Themen</CardTitle>
              <CardDescription>Empfohlene nächste Lerneinheiten.</CardDescription>
            </div>
            <BarChart3 className="h-5 w-5 text-sky-300" />
          </CardHeader>
          <div className="space-y-4">
            {data.weakCategories.length === 0 ? (
              <p className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                Stark, aktuell keine kritischen Schwächen.
              </p>
            ) : (
              data.weakCategories.map((category) => (
                <div key={category.id} className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-white">{category.name}</div>
                    <Badge variant={category.mastery < 30 ? "danger" : "warning"}>{category.mastery}% Mastery</Badge>
                  </div>
                  <Progress value={category.mastery} className="mt-3" indicatorClassName="bg-amber-400" />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <DashboardCharts
        categories={data.categoryStats}
        correct={data.correct}
        wrong={data.wrong}
        readiness={data.readiness}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardTitle>Letzte Prüfungssimulation</CardTitle>
          <div className="mt-4 flex items-end gap-2">
            <div className="text-3xl font-bold text-white">{data.lastExam ? `${Math.round(data.lastExam.percentage)}%` : "-"}</div>
            {data.lastExam ? <Badge variant={data.lastExam.passed ? "success" : "danger"}>{data.lastExam.passed ? "Bestanden" : "Nicht bestanden"}</Badge> : null}
          </div>
          <p className="mt-3 text-sm text-slate-400">
            {data.lastExam ? formatDateTime(data.lastExam.finishedAt) : "Starte deine erste Prüfungssimulation."}
          </p>
        </Card>
        <Card>
          <CardTitle>Tagesziel</CardTitle>
          <div className="mt-4 text-3xl font-bold text-white">
            {Math.min(data.reviews, data.dailyGoal)} / {data.dailyGoal}
          </div>
          <Progress value={(Math.min(data.reviews, data.dailyGoal) / data.dailyGoal) * 100} className="mt-4" indicatorClassName="bg-emerald-400" />
        </Card>
        <Card>
          <CardTitle>Wiederholungen</CardTitle>
          <div className="mt-4 flex items-center gap-3">
            <Trophy className="h-8 w-8 text-amber-300" />
            <div>
              <div className="text-3xl font-bold text-white">{data.reviews}</div>
              <p className="text-sm text-slate-400">{data.correct} richtig, {data.wrong} falsch</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
