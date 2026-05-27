"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2, FileJson, Table2, UploadCloud, XCircle } from "lucide-react";

import { importQuestionsAction } from "@/app/(portal)/admin/import/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, Textarea } from "@/components/ui/form";
import { detectDuplicates, parseCsvQuestions, parseJsonQuestions, validateImportedQuestions } from "@/lib/import/parser";
import type { ImportedQuestion } from "@/types/domain";

const csvExample =
  "question,answer,category,difficulty,type,source,relevance,tags,explanation,optionA,optionB,optionC,optionD,correctOptions\n" +
  "\"Was ist DNS?\",\"Namensauflösung\",\"Network & Infrastructure\",mittel,multiple_choice,\"Eigene Notizen\",hoch,\"dns,netzwerk\",\"\",A-Record,MX,TXT,SRV,A";

export function ImportPreview() {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [raw, setRaw] = useState(csvExample);
  const [result, setResult] = useState<string>("");
  const [pending, startTransition] = useTransition();

  const parsed = useMemo(() => {
    try {
      const items = format === "csv" ? parseCsvQuestions(raw) : parseJsonQuestions(raw);
      const validation = validateImportedQuestions(items);
      const duplicates = detectDuplicates(items);
      return { items, validation, duplicates, error: "" };
    } catch (error) {
      return {
        items: [] as ImportedQuestion[],
        validation: { valid: [], invalid: [] },
        duplicates: [],
        error: error instanceof Error ? error.message : "Import konnte nicht gelesen werden.",
      };
    }
  }, [format, raw]);

  function importNow() {
    startTransition(async () => {
      const response = await importQuestionsAction(parsed.validation.valid);
      setResult(`${response.imported} Fragen importiert, ${response.skipped} übersprungen.`);
    });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-bold text-white">Importdaten</div>
            <p className="mt-1 text-sm text-slate-400">Dateiupload folgt später; im MVP kannst du CSV/JSON einfügen.</p>
          </div>
          <Select value={format} onChange={(event) => setFormat(event.target.value as "csv" | "json")} className="w-36">
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </Select>
        </div>
        <Textarea value={raw} onChange={(event) => setRaw(event.target.value)} className="min-h-[420px] font-mono text-xs" />
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          {format === "csv" ? <Table2 className="h-5 w-5 text-sky-300" /> : <FileJson className="h-5 w-5 text-sky-300" />}
          Importvorschau
        </div>

        {parsed.error ? (
          <div className="rounded-lg border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-100">{parsed.error}</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3">
                <div className="text-2xl font-bold text-white">{parsed.items.length}</div>
                <div className="text-xs text-slate-500">gelesen</div>
              </div>
              <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-3">
                <div className="text-2xl font-bold text-emerald-200">{parsed.validation.valid.length}</div>
                <div className="text-xs text-emerald-100">gültig</div>
              </div>
              <div className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-3">
                <div className="text-2xl font-bold text-rose-200">{parsed.validation.invalid.length}</div>
                <div className="text-xs text-rose-100">Fehler</div>
              </div>
            </div>

            {parsed.duplicates.length ? (
              <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-sm text-amber-100">
                Dubletten erkannt: {parsed.duplicates.join(", ")}
              </div>
            ) : null}

            <div className="max-h-72 space-y-2 overflow-auto pr-1">
              {parsed.items.map((item, index) => {
                const invalid = parsed.validation.invalid.find((issue) => issue.index === index);
                return (
                  <div key={`${item.question}-${index}`} className="rounded-lg border border-slate-800 bg-slate-950/45 p-3">
                    <div className="flex items-start gap-2">
                      {invalid ? <XCircle className="mt-0.5 h-4 w-4 text-rose-300" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-300" />}
                      <div>
                        <div className="font-semibold text-white">{item.question || "Ohne Fragetext"}</div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <Badge>{item.category || "Keine Kategorie"}</Badge>
                          <Badge variant="info">{item.type}</Badge>
                        </div>
                        {invalid ? <div className="mt-2 text-xs text-rose-200">{invalid.errors.join(" ")}</div> : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button onClick={importNow} disabled={pending || parsed.validation.valid.length === 0}>
              <UploadCloud className="h-4 w-4" />
              Gültige Fragen importieren
            </Button>
            {result ? <p className="text-sm text-emerald-200">{result}</p> : null}
          </div>
        )}
      </Card>
    </div>
  );
}
