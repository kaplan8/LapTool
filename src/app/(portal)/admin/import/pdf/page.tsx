import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfImportClient } from "@/components/admin/pdf-import-client";
import { prisma } from "@/lib/db/prisma";
import { sourceTypeLabels } from "@/lib/labels";
import { formatDateTime } from "@/lib/utils";

export default async function PdfImportPage() {
  const batches = await prisma.importBatch.findMany({
    where: { type: { in: ["PDF", "WKO", "SCHOOL"] } },
    include: { sourceDocument: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Badge variant="warning">PDF Import</Badge>
          <h1 className="mt-3 text-3xl font-bold text-white">WKO-/LAP-PDF importieren</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            PDF hochladen, Fragen extrahieren, Kategorien prüfen und erst danach bestätigte Fragen speichern.
          </p>
        </div>
        <ButtonLink href="/admin/import" variant="secondary">CSV/JSON Import</ButtonLink>
      </div>

      <Card className="border-amber-400/20 bg-amber-400/10 text-sm leading-6 text-amber-100">
        Offizielle Unterlagen dürfen nur importiert werden, wenn du zur Nutzung berechtigt bist. Automatisch erkannte Fragen
        bleiben privat und erhalten eine Quellenzuordnung.
      </Card>

      <PdfImportClient />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Import-Historie</CardTitle>
            <CardDescription>Vollständigkeitsprüfung pro PDF-ImportBatch.</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-hidden rounded-lg border border-slate-800">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-950 text-xs uppercase tracking-[0.12em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Quelle</th>
                <th className="px-4 py-3">Datum</th>
                <th className="px-4 py-3">Typ</th>
                <th className="px-4 py-3">Erkannt</th>
                <th className="px-4 py-3">Importiert</th>
                <th className="px-4 py-3">Dubletten</th>
                <th className="px-4 py-3">Ohne Antwort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {batches.map((batch) => (
                <tr key={batch.id} className="bg-slate-950/35">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-white">{batch.sourceDocument?.title ?? batch.filename}</div>
                    <div className="mt-1 text-xs text-slate-500">{batch.filename}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{formatDateTime(batch.createdAt)}</td>
                  <td className="px-4 py-4"><Badge>{sourceTypeLabels[batch.type]}</Badge></td>
                  <td className="px-4 py-4 text-slate-300">{batch.detectedCount}</td>
                  <td className="px-4 py-4 text-emerald-200">{batch.importedCount}</td>
                  <td className="px-4 py-4 text-amber-200">{batch.duplicateCount}</td>
                  <td className="px-4 py-4 text-violet-200">{batch.openAnswerCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
