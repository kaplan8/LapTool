# LAP Systemtechnik Academy

Privates Lernportal zur Vorbereitung auf die österreichische Lehrabschlussprüfung Informationstechnologie - Schwerpunkt Systemtechnik. Das Tool kombiniert Fragenkatalog, Karteikarten-Lernen, einfache Spaced Repetition, Prüfungssimulation, Fortschrittsanalyse sowie CSV/JSON/PDF-Import.

## Features

- Apprentice Dashboard mit Exam Readiness, Tagesziel, Skill Matrix und Schwächenanalyse
- Lernmodus mit Karteikarten, SM-2-ähnlicher Wiederholungsplanung und Quellenfiltern
- Prüfungsmodus mit Timer, WKO-/Import-Filter, Multiple Choice, offenen Fragen, Rechenfragen und Szenarien
- Fragenkatalog mit Suche, Filtern, Antwortstatus und Detailseiten
- Admin-Bereich für Fragen, Kategorien, Demo-Steuerung, CSV/JSON-Import und PDF-Import
- WKO-/LAP-PDF-Import mit SourceDocument, Vorschau, Dublettenprüfung, Seitenangabe und Import-Historie
- Demo-Daten für LAP-nahe Systemtechnik-Themen, klar als nicht offiziell markiert
- Rechtlicher Hinweis und Quellenverwaltung pro Frage

## Tech Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Prisma ORM mit lokaler SQLite-Datenbank
- Supabase/PostgreSQL-freundliches Datenmodell
- Zod, Vitest, Lucide Icons, pdf-parse

## Lokale Installation

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm db:seed
pnpm dev
```

Danach ist die App unter `http://localhost:3000` erreichbar.

## Environment Variables

Kopiere `.env.example` nach `.env`.

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-random-secret-for-real-auth"
OPENAI_API_KEY=""
```

`OPENAI_API_KEY` ist nur für spätere KI-Erweiterungen vorgesehen und wird im MVP nicht benötigt.

## WKO-/LAP-PDF importieren

1. Öffne `/admin/import/pdf`.
2. Gib einen Quellentitel ein, z. B. `WKO Repetitionsfragen IT-Systemtechnik`.
3. Wähle den Quellentyp `WKO/LAP-Unterlage`.
4. Lade die PDF-Datei hoch und klicke auf `PDF analysieren`.
5. Prüfe die Import-Vorschau:
   - Fragetext bearbeiten
   - Kategorie korrigieren
   - Seite prüfen
   - Dubletten abwählen
   - nicht gewünschte Fragen aus dem Import entfernen
6. Klicke auf `Alle bestätigten Fragen importieren`.

Der Import speichert ein `SourceDocument` mit Titel, Dateiname, Upload-Datum, Quellentyp und privater Nutzung. Jede importierte Frage wird dieser Quelle zugeordnet und erhält bei PDF-Fragen ohne erkannte Antwort `answerStatus = OPEN` sowie `answer = "Antwort offen"`.

Wichtig: Der PDF-Import extrahiert Text aus PDFs. Gescannte PDFs ohne eingebetteten Text benötigen später OCR; solche Scans können nicht zuverlässig vollständig erkannt werden.

## Vollständigkeit prüfen

Nach jedem PDF-Import zeigt `/admin/import/pdf` eine Zusammenfassung und Import-Historie:

- erkannte Fragen
- importierte Fragen
- übersprungene Fragen
- Dubletten
- Fragen ohne Antwort

Diese Zahlen werden im `ImportBatch` gespeichert. Vergleiche die erkannte Anzahl mit dem PDF-Inhaltsverzeichnis oder der erwarteten Fragenanzahl.

## Demo-Fragen deaktivieren oder löschen

Öffne `/admin` und nutze den Bereich `Demo-Fragen steuern`.

- `Demo-Fragen ausblenden`: setzt Demo-Fragen auf inaktiv.
- `Demo-Fragen wieder aktivieren`: macht Demo-Fragen wieder sichtbar.
- `Demo-Fragen löschen`: entfernt Demo-Fragen aus der Datenbank.

Nach echten Imports verwenden Lern- und Prüfungsmodus standardmäßig aktive importierte Fragen. Demo-Fragen werden nur gemischt, wenn du sie bewusst auswählst.

## Lern- und Prüfungsfilter

Im Lernmodus `/learn` gibt es:

- `Aktive importierte Fragen`
- `Alle WKO-Fragen lernen`
- `Nur Fragen ohne Antwort`
- `Nur fällige Fragen`
- Kategorieauswahl

Im Prüfungsmodus `/exam` gibt es:

- `Aktive importierte Fragen`
- `Nur WKO-Import`
- `Alle Fragen`
- `Demo-Fragen ausschließen`
- Kategorie- und Fragetypauswahl

## Importformat CSV

Unterstützte Spalten:

```csv
question,answer,category,difficulty,type,source,relevance,tags,explanation,optionA,optionB,optionC,optionD,correctOptions
```

`correctOptions` akzeptiert Werte wie `A`, `A,C` oder `B;D`.

## Importformat JSON

```json
[
  {
    "question": "Was ist DNS?",
    "answer": "Namensauflösung in IP-Adressen.",
    "category": "Network & Infrastructure",
    "difficulty": "mittel",
    "type": "flashcard",
    "source": "Eigene Notizen",
    "relevance": "hoch",
    "tags": ["dns", "netzwerk"],
    "explanation": "DNS steht für Domain Name System.",
    "options": []
  }
]
```

## Rechtlicher Hinweis

Dieses Tool ist eine private Lernhilfe. Offizielle LAP-Fragen können abweichen. Für Inhalte aus offiziellen Unterlagen gelten die jeweiligen Nutzungs- und Urheberrechte. Demo-Fragen sind nicht offiziell. Die App wird nicht offiziell von CANCOM Austria oder der WKO bereitgestellt.

## Deployment auf Vercel

Für Vercel empfiehlt sich Supabase/PostgreSQL:

1. Supabase-Projekt anlegen.
2. `DATABASE_URL` als PostgreSQL Connection String in Vercel setzen.
3. `pnpm prisma:generate` im Build ausführen lassen.
4. Migrationen kontrolliert gegen die Produktionsdatenbank ausführen.

## Nächste Schritte

- OCR für gescannte PDFs
- KI-Antwortvorschläge als `KI-Vorschlag - bitte prüfen`
- Echte Auth mit Supabase Auth oder Auth.js
- Ausbilder-/Lehrer-Dashboard
- PWA/Offline-Modus und Lernkalender
