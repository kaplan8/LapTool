import { ImportPreview } from "@/components/admin/import-preview";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Badge variant="warning">Admin Import</Badge>
          <h1 className="mt-3 text-3xl font-bold text-white">CSV/JSON Import</h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Importierte Fragen werden vor dem Speichern geprüft. Offizielle Fragen nur importieren, wenn du zur
            Nutzung berechtigt bist.
          </p>
        </div>
        <ButtonLink href="/admin/import/pdf" variant="secondary">
          WKO-PDF importieren
        </ButtonLink>
      </div>
      <Card className="border-amber-400/20 bg-amber-400/10 text-sm leading-6 text-amber-100">
        Für WKO-/LAP-Unterlagen nutze den PDF-Import mit Vorschau und manueller Bestätigung.
      </Card>
      <ImportPreview />
    </div>
  );
}
