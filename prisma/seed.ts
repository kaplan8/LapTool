import {
  Difficulty,
  PrismaClient,
  QuestionType,
  Relevance,
  SourceType,
  UserRole,
} from "@prisma/client";

import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

const categories = [
  ["Network & Infrastructure", "OSI, TCP/IP, Routing, Switching, VLAN und WLAN", "Network", "#38bdf8"],
  ["Windows & Identity", "Windows Server, Active Directory, DNS, DHCP und GPO", "Server", "#60a5fa"],
  ["Linux & Scripting", "Linux-Grundlagen, Rechte und Shell-Basics", "Terminal", "#34d399"],
  ["Security & Datenschutz", "Cyber Defense, Firewall, VPN und DSGVO", "Shield", "#22c55e"],
  ["Backup & Storage", "Backup, Restore, RAID und Storage-Grundlagen", "DatabaseBackup", "#f59e0b"],
  ["Cloud & Workplace", "Cloud-Modelle, Virtualisierung und Modern Workplace", "Cloud", "#2dd4bf"],
  ["Hardware & Troubleshooting", "Hardware, Fehleranalyse und Arbeitsplatztechnik", "Cpu", "#a78bfa"],
  ["Project & Documentation", "Projektplanung, Dokumentation und ITIL", "ClipboardList", "#f472b6"],
  ["Elektrotechnik & Grundlagen", "Grundlagen der Elektrotechnik und Sicherheit", "Zap", "#f97316"],
  ["Zahlensysteme & Datengrößen", "Bit, Byte, Binärsystem, Umrechnung und Kapazitäten", "Binary", "#c084fc"],
] as const;

type DemoQuestion = {
  question: string;
  answer: string;
  explanation?: string;
  category: string;
  type: QuestionType;
  difficulty: Difficulty;
  relevance: Relevance;
  tags: string[];
  options?: { text: string; isCorrect: boolean }[];
  criteria?: string;
};

const demoQuestions: DemoQuestion[] = [
  {
    question: "Nenne die sieben Schichten des OSI-Modells in der richtigen Reihenfolge.",
    answer: "Bitübertragung, Sicherung, Vermittlung, Transport, Sitzung, Darstellung, Anwendung.",
    explanation: "Für die LAP ist wichtig, typische Protokolle und Geräte den Schichten zuordnen zu können.",
    category: "Network & Infrastructure",
    type: QuestionType.FLASHCARD,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.VERY_HIGH,
    tags: ["osi", "netzwerk"],
  },
  {
    question: "Was ist der zentrale Unterschied zwischen TCP und UDP?",
    answer: "TCP ist verbindungsorientiert und bestätigt Pakete, UDP ist verbindungslos und verzichtet auf Bestätigungen.",
    category: "Network & Infrastructure",
    type: QuestionType.FLASHCARD,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["tcp", "udp"],
  },
  {
    question: "Welche Aufgabe hat DNS in einem Netzwerk?",
    answer: "DNS löst Namen wie server01.firma.local in IP-Adressen und weitere Ressourceneinträge auf.",
    category: "Windows & Identity",
    type: QuestionType.FLASHCARD,
    difficulty: Difficulty.EASY,
    relevance: Relevance.VERY_HIGH,
    tags: ["dns", "windows-server"],
  },
  {
    question: "Wofür wird DHCP verwendet?",
    answer: "DHCP weist Clients automatisch IP-Konfigurationen wie IP-Adresse, Subnetzmaske, Gateway und DNS-Server zu.",
    category: "Windows & Identity",
    type: QuestionType.FLASHCARD,
    difficulty: Difficulty.EASY,
    relevance: Relevance.HIGH,
    tags: ["dhcp", "netzwerk"],
  },
  {
    question: "Was bewirkt ein VLAN?",
    answer: "Ein VLAN trennt ein physisches Netzwerk logisch in mehrere Broadcast-Domänen.",
    category: "Network & Infrastructure",
    type: QuestionType.FLASHCARD,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["vlan", "switching"],
  },
  {
    question: "Was ist eine Gruppenrichtlinie in Active Directory?",
    answer: "Eine Gruppenrichtlinie steuert zentrale Einstellungen für Benutzer und Computer in einer Domäne.",
    category: "Windows & Identity",
    type: QuestionType.FLASHCARD,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["active-directory", "gpo"],
  },
  {
    question: "Was bedeutet die Linux-Berechtigung 755 bei einer Datei?",
    answer: "Der Besitzer darf lesen, schreiben und ausführen; Gruppe und Andere dürfen lesen und ausführen.",
    category: "Linux & Scripting",
    type: QuestionType.FLASHCARD,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["linux", "rechte"],
  },
  {
    question: "Erkläre die 3-2-1-Backup-Regel.",
    answer: "Drei Kopien der Daten, auf zwei unterschiedlichen Medien, davon eine Kopie extern oder offline.",
    category: "Backup & Storage",
    type: QuestionType.FLASHCARD,
    difficulty: Difficulty.EASY,
    relevance: Relevance.VERY_HIGH,
    tags: ["backup", "restore"],
  },
  {
    question: "Was ist ein Hypervisor?",
    answer: "Ein Hypervisor stellt die Virtualisierungsschicht bereit und verwaltet virtuelle Maschinen auf Hardware oder Host-OS.",
    category: "Cloud & Workplace",
    type: QuestionType.FLASHCARD,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["virtualisierung", "hypervisor"],
  },
  {
    question: "Wie viele Bits hat ein Byte?",
    answer: "Ein Byte besteht aus 8 Bits.",
    category: "Zahlensysteme & Datengrößen",
    type: QuestionType.FLASHCARD,
    difficulty: Difficulty.EASY,
    relevance: Relevance.HIGH,
    tags: ["bit", "byte"],
  },
  {
    question: "Welche IPv4-Bereiche sind private Adressbereiche nach RFC 1918?",
    answer: "10.0.0.0/8, 172.16.0.0/12 und 192.168.0.0/16.",
    category: "Network & Infrastructure",
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.VERY_HIGH,
    tags: ["ipv4", "routing"],
    options: [
      { text: "10.0.0.0/8", isCorrect: true },
      { text: "172.16.0.0/12", isCorrect: true },
      { text: "192.168.0.0/16", isCorrect: true },
      { text: "8.8.8.0/24", isCorrect: false },
    ],
  },
  {
    question: "Welcher DNS-Record ordnet einem Hostnamen typischerweise eine IPv4-Adresse zu?",
    answer: "Der A-Record.",
    category: "Windows & Identity",
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.EASY,
    relevance: Relevance.HIGH,
    tags: ["dns"],
    options: [
      { text: "A", isCorrect: true },
      { text: "MX", isCorrect: false },
      { text: "TXT", isCorrect: false },
      { text: "SRV", isCorrect: false },
    ],
  },
  {
    question: "Welche WLAN-Sicherheitsmethode ist für moderne Unternehmensnetze geeignet?",
    answer: "WPA3-Enterprise oder WPA2-Enterprise mit 802.1X, abhängig von Client- und Infrastrukturunterstützung.",
    category: "Security & Datenschutz",
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.HARD,
    relevance: Relevance.HIGH,
    tags: ["wlan", "security"],
    options: [
      { text: "WPA3-Enterprise", isCorrect: true },
      { text: "WEP", isCorrect: false },
      { text: "Offenes WLAN ohne Authentifizierung", isCorrect: false },
      { text: "WPA2-Enterprise mit 802.1X", isCorrect: true },
    ],
  },
  {
    question: "Welches Protokoll wird in Active Directory häufig für zentrale Authentifizierung verwendet?",
    answer: "Kerberos.",
    category: "Windows & Identity",
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["active-directory", "kerberos"],
    options: [
      { text: "Kerberos", isCorrect: true },
      { text: "SNMP", isCorrect: false },
      { text: "SMTP", isCorrect: false },
      { text: "NTP", isCorrect: false },
    ],
  },
  {
    question: "Welche Aussage beschreibt RAID 1 korrekt?",
    answer: "RAID 1 spiegelt Daten auf mindestens zwei Laufwerke.",
    category: "Backup & Storage",
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["raid", "storage"],
    options: [
      { text: "Daten werden gespiegelt.", isCorrect: true },
      { text: "Es ersetzt ein Backup vollständig.", isCorrect: false },
      { text: "Es benötigt mindestens drei Laufwerke.", isCorrect: false },
      { text: "Es erhöht primär die nutzbare Kapazität.", isCorrect: false },
    ],
  },
  {
    question: "Was ist ein typisches Beispiel für SaaS?",
    answer: "Eine vollständig bereitgestellte Anwendung wie Microsoft 365 oder ein webbasiertes Ticketsystem.",
    category: "Cloud & Workplace",
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.EASY,
    relevance: Relevance.MEDIUM,
    tags: ["cloud", "saas"],
    options: [
      { text: "Microsoft 365 als fertiger Dienst", isCorrect: true },
      { text: "Eine gemietete virtuelle Maschine", isCorrect: false },
      { text: "Ein selbst installiertes Betriebssystem", isCorrect: false },
      { text: "Ein physischer Switch", isCorrect: false },
    ],
  },
  {
    question: "Welche Eigenschaft hat eine Stateful Firewall?",
    answer: "Sie berücksichtigt den Zustand bestehender Verbindungen bei der Paketbewertung.",
    category: "Security & Datenschutz",
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["firewall"],
    options: [
      { text: "Sie verfolgt Verbindungszustände.", isCorrect: true },
      { text: "Sie ignoriert Session-Informationen.", isCorrect: false },
      { text: "Sie ersetzt Patchmanagement.", isCorrect: false },
      { text: "Sie ist nur für WLAN nutzbar.", isCorrect: false },
    ],
  },
  {
    question: "Welche Reihenfolge beschreibt den DHCP-DORA-Prozess?",
    answer: "Discover, Offer, Request, Acknowledge.",
    category: "Windows & Identity",
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["dhcp"],
    options: [
      { text: "Discover, Offer, Request, Acknowledge", isCorrect: true },
      { text: "Discover, Request, Offer, Acknowledge", isCorrect: false },
      { text: "Offer, Discover, Request, Acknowledge", isCorrect: false },
      { text: "Request, Discover, Acknowledge, Offer", isCorrect: false },
    ],
  },
  {
    question: "Welche Daten können personenbezogene Daten nach DSGVO sein?",
    answer: "Alle Informationen, die sich auf eine identifizierte oder identifizierbare Person beziehen.",
    category: "Security & Datenschutz",
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.VERY_HIGH,
    tags: ["dsgvo", "datenschutz"],
    options: [
      { text: "Name und E-Mail-Adresse", isCorrect: true },
      { text: "IP-Adresse in vielen Kontexten", isCorrect: true },
      { text: "Anonyme, nicht rückführbare Statistik", isCorrect: false },
      { text: "Personalnummer", isCorrect: true },
    ],
  },
  {
    question: "Welche Kennzahlen sind für Server-Monitoring typisch?",
    answer: "CPU, RAM, Datenträgerauslastung, Netzwerk, Dienststatus und Ereignisse.",
    category: "Hardware & Troubleshooting",
    type: QuestionType.MULTIPLE_CHOICE,
    difficulty: Difficulty.EASY,
    relevance: Relevance.HIGH,
    tags: ["monitoring"],
    options: [
      { text: "CPU-Auslastung", isCorrect: true },
      { text: "Freier Speicherplatz", isCorrect: true },
      { text: "Dienststatus", isCorrect: true },
      { text: "Tapetenfarbe im Büro", isCorrect: false },
    ],
  },
  {
    question: "Beschreibe zwei Vorteile eines VPN für mobile Mitarbeitende.",
    answer: "Ein VPN ermöglicht verschlüsselten Zugriff auf interne Ressourcen und reduziert Risiken in unsicheren Netzen.",
    category: "Security & Datenschutz",
    type: QuestionType.OPEN,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["vpn", "remote-access"],
    criteria: "Verschlüsselung, Authentifizierung, Zugriff auf interne Dienste, Grenzen eines VPN nennen.",
  },
  {
    question: "Warum sind Restore-Tests ein wichtiger Bestandteil einer Backup-Strategie?",
    answer: "Nur Restore-Tests zeigen, ob Daten vollständig, konsistent und innerhalb der benötigten Zeit wiederherstellbar sind.",
    category: "Backup & Storage",
    type: QuestionType.OPEN,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.VERY_HIGH,
    tags: ["restore", "backup"],
    criteria: "Wiederherstellbarkeit, RTO/RPO, Dokumentation und regelmäßige Prüfung erwähnen.",
  },
  {
    question: "Welche Inhalte gehören in eine technische Projektdokumentation?",
    answer: "Ziel, Ausgangssituation, Planung, Umsetzung, Tests, Risiken, Entscheidungen, Übergabe und Betriebshinweise.",
    category: "Project & Documentation",
    type: QuestionType.OPEN,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["projekt", "dokumentation"],
  },
  {
    question: "Nenne typische Rollen eines Windows Servers in einem Firmennetz.",
    answer: "Domain Controller, DNS, DHCP, Datei- und Druckdienste, RDS, WSUS oder Zertifizierungsstelle.",
    category: "Windows & Identity",
    type: QuestionType.OPEN,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["windows-server"],
  },
  {
    question: "Erkläre den Unterschied zwischen Incident und Problem im ITIL-Kontext.",
    answer: "Ein Incident ist eine konkrete Störung, ein Problem ist die zugrundeliegende Ursache eines oder mehrerer Incidents.",
    category: "Project & Documentation",
    type: QuestionType.OPEN,
    difficulty: Difficulty.HARD,
    relevance: Relevance.MEDIUM,
    tags: ["itil"],
  },
  {
    question: "Ein /24-Netz wird in /26-Netze unterteilt. Wie viele nutzbare Host-Adressen hat jedes /26-Subnetz?",
    answer: "Ein /26 hat 64 Adressen, davon 62 nutzbare Host-Adressen.",
    category: "Network & Infrastructure",
    type: QuestionType.CALCULATION,
    difficulty: Difficulty.HARD,
    relevance: Relevance.VERY_HIGH,
    tags: ["subnetting"],
  },
  {
    question: "Wie lange dauert die Übertragung von 1 GB über eine 100 Mbit/s-Verbindung ungefähr ohne Overhead?",
    answer: "1 GB entspricht ungefähr 8 Gbit. 8 Gbit / 100 Mbit/s ergeben etwa 80 Sekunden.",
    category: "Zahlensysteme & Datengrößen",
    type: QuestionType.CALCULATION,
    difficulty: Difficulty.HARD,
    relevance: Relevance.HIGH,
    tags: ["bandbreite", "datengrößen"],
  },
  {
    question: "Vier Festplatten mit je 2 TB werden als RAID 5 betrieben. Wie groß ist die nutzbare Kapazität?",
    answer: "Bei RAID 5 entspricht die Parität einer Platte. Nutzbar sind 3 x 2 TB = 6 TB.",
    category: "Backup & Storage",
    type: QuestionType.CALCULATION,
    difficulty: Difficulty.MEDIUM,
    relevance: Relevance.HIGH,
    tags: ["raid", "storage"],
  },
  {
    question: "Praxisfall: Mehrere Clients erhalten plötzlich APIPA-Adressen. Wie gehst du bei der Fehlersuche vor?",
    answer: "DHCP-Dienst, Scope, Lease-Bereich, VLAN/Relay, Firewall, Server-Erreichbarkeit und Client-Logs prüfen.",
    category: "Windows & Identity",
    type: QuestionType.SCENARIO,
    difficulty: Difficulty.LAP_RELEVANT,
    relevance: Relevance.VERY_HIGH,
    tags: ["dhcp", "troubleshooting"],
    criteria: "Strukturierte Analyse, DHCP-Server, Netzwerkpfad, Relay/IP-Helper, Logs und Abhilfemaßnahmen.",
  },
  {
    question: "Praxisfall: Ein Fileserver wurde verschlüsselt. Welche ersten Schritte setzt du aus Sicht der Systemtechnik?",
    answer: "System isolieren, Vorfall melden, Beweise sichern, Backups prüfen, Restore planen, Ursache analysieren und Passwörter/Keys prüfen.",
    category: "Security & Datenschutz",
    type: QuestionType.SCENARIO,
    difficulty: Difficulty.CRITICAL,
    relevance: Relevance.VERY_HIGH,
    tags: ["ransomware", "backup", "incident"],
    criteria: "Containment, Eskalation, keine übereilte Bereinigung, Backup-Integrität, Dokumentation und Datenschutz beachten.",
  },
];

async function main() {
  await prisma.examAnswer.deleteMany();
  await prisma.examSession.deleteMany();
  await prisma.learningProgress.deleteMany();
  await prisma.reviewSchedule.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.importBatch.deleteMany();
  await prisma.answerOption.deleteMany();
  await prisma.question.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sourceDocument.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Demo Admin",
      email: "admin@lap-academy.local",
      role: UserRole.ADMIN,
      dailyGoal: 30,
      lapTargetDate: new Date("2026-09-30T08:00:00.000Z"),
    },
  });

  const categoryMap = new Map<string, string>();
  for (const [name, description, icon, color] of categories) {
    const category = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        description,
        icon,
        color,
      },
    });
    categoryMap.set(name, category.id);
  }

  const demoSource = await prisma.sourceDocument.create({
    data: {
      title: "Demo-Fragen - nicht offiziell",
      type: SourceType.DEMO,
      uploadedById: admin.id,
      copyrightNote:
        "Eigenständig formulierte Demo-Daten. Keine offiziellen WKO- oder CANCOM-Prüfungsfragen.",
      isPrivate: true,
    },
  });

  for (const item of demoQuestions) {
    const categoryId = categoryMap.get(item.category);
    if (!categoryId) throw new Error(`Missing category ${item.category}`);

    await prisma.question.create({
      data: {
        question: item.question,
        answer: item.answer,
        explanation: item.explanation,
        type: item.type,
        difficulty: item.difficulty,
        relevance: item.relevance,
        sourceId: demoSource.id,
        categoryId,
        tags: JSON.stringify(item.tags),
        criteria: item.criteria,
        isDemo: true,
        isOfficial: false,
        options: item.options
          ? {
              create: item.options.map((option, index) => ({
                text: option.text,
                isCorrect: option.isCorrect,
                order: index,
              })),
            }
          : undefined,
      },
    });
  }

  console.log(`Seeded ${categories.length} categories and ${demoQuestions.length} demo questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
