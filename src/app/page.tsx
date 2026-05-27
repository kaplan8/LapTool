import { ArrowRight, BookOpenCheck, Database, GraduationCap, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const serviceAreas = ["Digital Evolution", "Modern Workplace", "Cyber Defense", "Cloud", "Network", "Managed Services"];

export default function Home() {
  return (
    <main className="min-h-screen enterprise-grid px-4 py-6 md:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col justify-between">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-400/10">
              <ShieldCheck className="h-6 w-6 text-sky-300" />
            </div>
            <div>
              <div className="font-bold text-white">LAP Systemtechnik Academy</div>
              <div className="text-xs text-slate-400">CANCOM Apprentice Learning Hub</div>
            </div>
          </div>
          <Badge variant="warning">Privates Lernprojekt</Badge>
        </div>

        <div className="grid items-center gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-5 flex flex-wrap gap-2">
              {serviceAreas.map((area) => (
                <Badge key={area} variant="info">
                  {area}
                </Badge>
              ))}
            </div>
            <h1 className="max-w-4xl text-5xl font-black tracking-normal text-white md:text-7xl">
              LAP Systemtechnik Academy
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-300">
              Dein persönliches Lernportal für die Lehrabschlussprüfung IT-Systemtechnik.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/learn" size="lg">
                <BookOpenCheck className="h-5 w-5" />
                Lernen starten
              </ButtonLink>
              <ButtonLink href="/exam" size="lg" variant="secondary">
                <GraduationCap className="h-5 w-5" />
                Prüfung simulieren
              </ButtonLink>
              <ButtonLink href="/admin/import" size="lg" variant="secondary">
                <Database className="h-5 w-5" />
                Fragen importieren
              </ButtonLink>
            </div>
          </div>

          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-slate-500">Systemtechnik Track</div>
                <div className="mt-1 text-2xl font-bold text-white">Skill Matrix Preview</div>
              </div>
              <ArrowRight className="h-5 w-5 text-sky-300" />
            </div>
            <div className="space-y-3">
              {[
                ["Network & Infrastructure", "82%", "bg-sky-400"],
                ["Windows & Identity", "68%", "bg-blue-400"],
                ["Security & Datenschutz", "74%", "bg-emerald-400"],
                ["Backup & Storage", "59%", "bg-amber-400"],
              ].map(([name, value, color]) => (
                <div key={name} className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-white">{name}</span>
                    <span className="text-slate-300">{value}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div className={`h-2 rounded-full ${color}`} style={{ width: value }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="pb-4 text-xs text-slate-500">
          Privates Lernprojekt zur LAP-Vorbereitung. Nicht offiziell von CANCOM Austria oder der WKO bereitgestellt.
        </div>
      </section>
    </main>
  );
}
