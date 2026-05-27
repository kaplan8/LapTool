# LAP Systemtechnik Academy - Agent Rules

## Projektziel

Dieses Projekt ist ein privates Lernportal zur Vorbereitung auf die österreichische Lehrabschlussprüfung im Lehrberuf Informationstechnologie - Schwerpunkt Systemtechnik. Das MVP soll Dashboard, Fragenkatalog, Lernmodus, Prüfungsmodus, Admin-Verwaltung, Import/Export und Fortschrittsanalyse bedienbar abdecken.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-inspirierte Komponentenstruktur
- Prisma ORM
- Lokale Entwicklung mit SQLite
- Produktion vorbereitet für PostgreSQL/Supabase
- Zod für Validierung
- Vitest für Unit Tests

## Coding Style

- Komponentenbasiert und server-first arbeiten.
- Fachlogik liegt in `src/lib/*` und bleibt möglichst framework-unabhängig.
- Datenbankzugriff läuft über `src/lib/db/prisma.ts`.
- Eingaben werden validiert, bevor sie gespeichert werden.
- Keine hardcodierten Secrets.
- UI-Texte sind auf Lernende in Österreich ausgerichtet.

## Komponentenstruktur

- `src/app/*`: Routen, Server Components und Route-spezifische Actions
- `src/components/layout`: AppShell, Sidebar, Header
- `src/components/dashboard`: Dashboard-Karten, Charts, Skill Matrix
- `src/components/learning`: Flashcards und Review-Controls
- `src/components/exam`: Timer, Renderer, Ergebnisansicht
- `src/components/questions`: Katalog, Filter, Detailansicht
- `src/components/admin`: Import, Verwaltung, Admin-Forms
- `src/components/ui`: wiederverwendbare UI-Primitives
- `src/lib/spaced-repetition`: Wiederholungsalgorithmus
- `src/lib/exam`: Prüfungslogik
- `src/lib/import`: CSV/JSON Parser und Validierung

## Design-Regeln

- Neutrales internes Branding: "LAP Systemtechnik Academy".
- CANCOM-Austria-inspirierte Enterprise-IT-Anmutung, aber keine echten Logos oder geschützten Assets ohne Bereitstellung durch den Benutzer.
- Dark Mode ist Standard.
- Ruhige, professionelle IT-Academy-Oberfläche mit klaren Tabellen, Badges, Diagrammen und Skill Matrix.
- Keine Behauptung, dass die App offiziell von CANCOM Austria oder der WKO bereitgestellt wird.

## Rechtliche Regeln zu offiziellen Fragen

- Keine geschützten offiziellen Fragen ungeprüft in Code, Seed oder Tests kopieren.
- Keine Paywalls umgehen.
- Keine fremden Seiten ohne Erlaubnis scrapen.
- Demo-Fragen müssen als Demo-Daten und "nicht offiziell" gekennzeichnet sein.
- Offizielle WKO-Unterlagen oder LAP-Fragen dürfen nur durch den Benutzer importiert werden oder wenn die Nutzung eindeutig erlaubt ist.
- Jede importierte Frage muss eine Quelle speichern können.
- Importierte Inhalte bleiben standardmäßig privat.

## Test- und Build-Kommandos

- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`
- `pnpm prisma:generate`
- `pnpm prisma:migrate`
- `pnpm db:seed`

## Seed-Hinweis

Der Seed enthält ausschließlich eigenständig formulierte Demo-Fragen. Keine offiziellen WKO-, CANCOM- oder geschützten Prüfungsfragen ungeprüft in `prisma/seed.ts` übernehmen.
