"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileSearch, Save, Trash2, UploadCloud } from "lucide-react";

import { confirmPdfImportAction, parsePdfImportAction } from "@/app/(portal)/admin/import/pdf/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/form";

const PDF_CATEGORIES = [
  "Netzwerktechnik",
  "OSI-Modell",
  "TCP/IP",
  "Routing, Switching, VLAN",
  "WLAN",
  "Windows Server",
  "Linux",
  "Active Directory",
  "DNS, DHCP",
  "Backup und Restore",
  "Virtualisierung",
  "IT-Security",
  "Datenschutz und DSGVO",
  "Cloud",
  "Hardware",
  "Storage",
  "Monitoring",
  "ITIL / IT-Management",
  "Projektplanung und Dokumentation",
  "Elektrotechnik-Grundlagen",
  "Zahlensysteme und Datengrößen",
];

type PreviewQuestion = {
  tempId: string;
  question: string;
  category: string;
  pageNumber: number;
  answer: string;
  answerStatus: "open";
  sourceTitle?: string;
  confirmed: boolean;
  duplicate: boolean;
};

type PreviewState = {
  sourceDocumentId: string;
  importBatchId: string;
  title: string;
  filename: string;
  pageCount: number;
  detectedCount: number;
  duplicateCount: number;
  openAnswerCount: number;
  questions: PreviewQuestion[];
};

type ImportSummary = {
  detectedCount: number;
  importedCount: number;
  skippedCount: number;
  duplicateCount: number;
  openAnswerCount: number;
};

export function PdfImportClient() {
  const router = useRouter();
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const confirmedCount = useMemo(
    () => preview?.questions.filter((question) => question.confirmed).length ?? 0,
    [preview],
  );

  function parsePdf(formData: FormData) {
    setError("");
    setSummary(null);
    startTransition(async () => {
      try {
        const result = await parsePdfImportAction(formData);
        setPreview(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "PDF konnte nicht verarbeitet werden.");
      }
    });
  }

  function updateQuestion(tempId: string, patch: Partial<PreviewQuestion>) {
    setPreview((current) =>
      current
        ? {
            ...current,
            questions: current.questions.map((question) =>
              question.tempId === tempId ? { ...question, ...patch } : question,
            ),
          }
        : current,
    );
  }

  function removeQuestion(tempId: string) {
    updateQuestion(tempId, { confirmed: false });
  }

  function importConfirmed() {
    if (!preview) return;
    startTransition(async () => {
      const result = await confirmPdfImportAction({
        sourceDocumentId: preview.sourceDocumentId,
        importBatchId: preview.importBatchId,
        questions: preview.questions,
      });
      setSummary(result);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <form action={parsePdf} className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
          <div className="space-y-2">
            <Label>Titel der Quelle</Label>
            <Input name="title" placeholder="WKO Repetitionsfragen Systemtechnik" />
          </div>
          <div className="space-y-2">
            <Label>Quellentyp</Label>
            <Select name="sourceType" defaultValue="WKO">
              <option value="WKO">WKO/LAP-Unterlage</option>
              <option value="PDF">Private PDF</option>
              <option value="SCHOOL">Schulunterlage</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>PDF-Datei</Label>
            <Input name="pdf" type="file" accept="application/pdf,.pdf" required />
          </div>
          <Button className="self-end" disabled={pending}>
            <UploadCloud className="h-4 w-4" />
            PDF analysieren
          </Button>
        </form>
        <p className="mt-4 text-xs leading-5 text-slate-500">
          Die PDF bleibt private Quelle. Fragen werden erst nach deiner Bestätigung gespeichert.
        </p>
      </Card>

      {error ? <Card className="border-rose-400/30 bg-rose-400/10 text-sm text-rose-100">{error}</Card> : null}

      {preview ? (
        <Card>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold text-white">
                <FileSearch className="h-5 w-5 text-sky-300" />
                Import-Vorschau
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {preview.title} · {preview.filename} · {preview.pageCount} Seiten
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info">{preview.detectedCount} erkannt</Badge>
              <Badge variant="success">{confirmedCount} bestätigt</Badge>
              <Badge variant="warning">{preview.duplicateCount} Dubletten</Badge>
              <Badge variant="violet">{preview.openAnswerCount} ohne Antwort</Badge>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {preview.questions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-700 p-8 text-center text-slate-400">
                Keine Fragen erkannt. Prüfe, ob das PDF Text enthält und nicht nur gescannte Bilder.
              </div>
            ) : (
              preview.questions.map((question, index) => (
                <div
                  key={question.tempId}
                  className={`rounded-lg border p-4 ${
                    question.confirmed
                      ? "border-slate-800 bg-slate-950/45"
                      : "border-slate-800/70 bg-slate-950/20 opacity-60"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="info">#{index + 1}</Badge>
                      <Badge>Seite {question.pageNumber}</Badge>
                      <Badge variant="warning">Antwort offen</Badge>
                      {question.duplicate ? <Badge variant="danger">Dublettenverdacht</Badge> : null}
                    </div>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-2 text-sm text-slate-300">
                        <input
                          type="checkbox"
                          checked={question.confirmed}
                          onChange={(event) => updateQuestion(question.tempId, { confirmed: event.target.checked })}
                          className="h-4 w-4 accent-sky-400"
                        />
                        Importieren
                      </label>
                      <button
                        type="button"
                        onClick={() => removeQuestion(question.tempId)}
                        className="rounded-md border border-slate-700 p-2 text-slate-300 hover:border-rose-400 hover:text-rose-200"
                        title="Frage aus Import entfernen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
                    <Textarea
                      value={question.question}
                      onChange={(event) => updateQuestion(question.tempId, { question: event.target.value })}
                      className="min-h-24"
                    />
                    <div className="space-y-2">
                      <Label>Kategorie</Label>
                      <Select
                        value={question.category}
                        onChange={(event) => updateQuestion(question.tempId, { category: event.target.value })}
                      >
                        {PDF_CATEGORIES.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Select>
                      <Label>Seite im PDF</Label>
                      <Input
                        type="number"
                        min={1}
                        value={question.pageNumber}
                        onChange={(event) => updateQuestion(question.tempId, { pageNumber: Number(event.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button onClick={importConfirmed} disabled={pending || confirmedCount === 0}>
              <Save className="h-4 w-4" />
              Alle bestätigten Fragen importieren
            </Button>
            <span className="text-sm text-slate-500">{confirmedCount} Fragen werden gespeichert.</span>
          </div>
        </Card>
      ) : null}

      {summary ? (
        <Card className="border-emerald-400/20 bg-emerald-400/10">
          <div className="text-lg font-bold text-emerald-100">Import abgeschlossen</div>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            <Badge variant="info">{summary.detectedCount} erkannt</Badge>
            <Badge variant="success">{summary.importedCount} importiert</Badge>
            <Badge variant="warning">{summary.skippedCount} übersprungen</Badge>
            <Badge variant="danger">{summary.duplicateCount} Dubletten</Badge>
            <Badge variant="violet">{summary.openAnswerCount} ohne Antwort</Badge>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
