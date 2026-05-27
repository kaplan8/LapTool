export type PdfPageText = {
  pageNumber: number;
  text: string;
};

export type PdfExtractedQuestion = {
  tempId: string;
  question: string;
  category: string;
  pageNumber: number;
  answer: string;
  answerStatus: "open";
  sourceTitle?: string;
};

export type PdfExtractionResult = {
  questions: PdfExtractedQuestion[];
  detectedCount: number;
  duplicateCount: number;
  openAnswerCount: number;
};

const CATEGORY_KEYWORDS: Array<{ category: string; keywords: string[] }> = [
  { category: "DNS, DHCP", keywords: ["dns", "dhcp", "domain name", "zone", "resolver", "lease", "dora"] },
  { category: "OSI-Modell", keywords: ["osi", "schicht", "layer"] },
  { category: "TCP/IP", keywords: ["tcp", "udp", "ip-adresse", "ipv4", "ipv6", "subnet", "port"] },
  { category: "Routing, Switching, VLAN", keywords: ["routing", "router", "switch", "switching", "vlan", "trunk"] },
  { category: "WLAN", keywords: ["wlan", "wifi", "802.11", "ssid", "wpa", "funknetz"] },
  { category: "Windows Server", keywords: ["windows server", "serverrolle", "wsus", "rds", "dateiserver"] },
  { category: "Active Directory", keywords: ["active directory", "domain controller", "domäne", "gpo", "gruppenrichtlinie", "kerberos"] },
  { category: "Linux", keywords: ["linux", "chmod", "bash", "shell", "systemd", "sudo", "dateirechte"] },
  { category: "Backup und Restore", keywords: ["backup", "restore", "rto", "rpo", "sicherung", "wiederherstellung"] },
  { category: "Virtualisierung", keywords: ["virtualisierung", "hypervisor", "vm", "virtuelle maschine", "snapshot"] },
  { category: "IT-Security", keywords: ["firewall", "vpn", "malware", "ransomware", "security", "verschlüsselung", "authentifizierung"] },
  { category: "Datenschutz und DSGVO", keywords: ["dsgvo", "datenschutz", "personenbezogen", "betroffenenrechte"] },
  { category: "Cloud", keywords: ["cloud", "iaas", "paas", "saas", "tenant", "azure", "microsoft 365"] },
  { category: "Hardware", keywords: ["hardware", "mainboard", "cpu", "ram", "netzteil", "bios", "uefi"] },
  { category: "Storage", keywords: ["storage", "raid", "nas", "san", "festplatte", "ssd", "volume"] },
  { category: "Monitoring", keywords: ["monitoring", "snmp", "log", "event", "alarm", "metriken"] },
  { category: "ITIL / IT-Management", keywords: ["itil", "incident", "problem", "change", "sla", "service management"] },
  { category: "Projektplanung und Dokumentation", keywords: ["projekt", "dokumentation", "planung", "meilenstein", "übergabe"] },
  { category: "Elektrotechnik-Grundlagen", keywords: ["spannung", "strom", "widerstand", "ohm", "volt", "ampere", "leistung"] },
  { category: "Zahlensysteme und Datengrößen", keywords: ["bit", "byte", "binär", "hexadezimal", "mbyte", "gbyte", "datenmenge"] },
  { category: "Netzwerktechnik", keywords: ["netzwerk", "ethernet", "lan", "wan", "gateway", "mac-adresse"] },
];

const QUESTION_STARTERS = [
  "nennen sie",
  "erklären sie",
  "erklaeren sie",
  "beschreiben sie",
  "welche",
  "was ist",
  "was sind",
  "wie funktioniert",
  "wie gehen sie",
  "warum",
  "wodurch",
  "wofür",
  "wofuer",
  "unterscheiden sie",
  "definieren sie",
  "berechnen sie",
  "zeichnen sie",
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeQuestionKey(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/^[\d\s.)-]+/, "")
    .replace(/[?!.:;]+$/g, "")
    .trim();
}

function stripQuestionPrefix(value: string) {
  return normalizeWhitespace(value.replace(/^\s*(?:[-•●▪*]|\d{1,3}[.)]|\(?[a-z]\))\s*/i, ""));
}

function isRepeatedNoise(line: string, repeatedLines: Set<string>) {
  const normalized = normalizeWhitespace(line).toLowerCase();
  return normalized.length > 12 && repeatedLines.has(normalized);
}

function isNoiseLine(line: string, repeatedLines: Set<string>) {
  const normalized = normalizeWhitespace(line);
  const lower = normalized.toLowerCase();

  if (!normalized) return true;
  if (/^\d{1,4}$/.test(normalized)) return true;
  if (/^seite\s+\d+(\s+von\s+\d+)?$/i.test(normalized)) return true;
  if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(normalized)) return true;
  if (lower.includes("inhaltsverzeichnis")) return true;
  if (/^\d+\.?\s+[\wäöüß -]{2,}\s+\d{1,3}$/i.test(normalized)) return true;
  if (isRepeatedNoise(normalized, repeatedLines)) return true;

  return false;
}

function looksLikeQuestionStart(line: string) {
  const stripped = stripQuestionPrefix(line);
  const lower = stripped.toLowerCase();
  const hasListPrefix = /^\s*(?:[-•●▪*]|\d{1,3}[.)]|\(?[a-z]\))\s+/i.test(line);
  const hasStarter = QUESTION_STARTERS.some((starter) => lower.startsWith(starter));
  const hasQuestionMark = stripped.includes("?") && stripped.length >= 8;

  return hasQuestionMark || hasStarter || (hasListPrefix && hasStarter);
}

function shouldContinueQuestion(line: string) {
  const stripped = stripQuestionPrefix(line);
  if (!stripped) return false;
  if (/^(antwort|lösung|loesung|musterantwort|notizen?)\s*:/i.test(stripped)) return false;
  if (/^[A-D][.)]\s+/.test(stripped)) return false;
  return !looksLikeQuestionStart(line);
}

function collectRepeatedLines(pages: PdfPageText[]) {
  const counts = new Map<string, number>();
  for (const page of pages) {
    const pageLines = new Set(
      page.text
        .split(/\r?\n/)
        .map((line) => normalizeWhitespace(line).toLowerCase())
        .filter((line) => line.length > 12),
    );
    for (const line of pageLines) counts.set(line, (counts.get(line) ?? 0) + 1);
  }
  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count >= 2 && count >= Math.ceil(pages.length * 0.5))
      .map(([line]) => line),
  );
}

export function suggestPdfCategory(question: string) {
  const lower = question.toLowerCase();
  let best = { category: "Netzwerktechnik", score: 0 };

  for (const item of CATEGORY_KEYWORDS) {
    const score = item.keywords.reduce((sum, keyword) => sum + (lower.includes(keyword) ? 1 : 0), 0);
    if (score > best.score) best = { category: item.category, score };
  }

  return best.category;
}

export function extractQuestionsFromPdfPages(pages: PdfPageText[]): PdfExtractionResult {
  const repeatedLines = collectRepeatedLines(pages);
  const questions: PdfExtractedQuestion[] = [];
  const seen = new Set<string>();
  let duplicateCount = 0;
  let current: { text: string; pageNumber: number } | null = null;

  function commitCurrent() {
    if (!current) return;
    const question = stripQuestionPrefix(current.text);
    const pageNumber = current.pageNumber;
    const key = normalizeQuestionKey(question);
    current = null;

    if (!key || question.length < 10) return;
    if (seen.has(key)) {
      duplicateCount += 1;
      return;
    }
    seen.add(key);

    questions.push({
      tempId: `pdf-${questions.length + 1}`,
      question,
      category: suggestPdfCategory(question),
      pageNumber,
      answer: "Antwort offen",
      answerStatus: "open",
    });
  }

  for (const page of pages) {
    const lines = page.text
      .split(/\r?\n/)
      .map((line) => normalizeWhitespace(line.replace(/\u00ad/g, "")))
      .filter((line) => !isNoiseLine(line, repeatedLines));

    for (const line of lines) {
      if (looksLikeQuestionStart(line)) {
        commitCurrent();
        current = { text: stripQuestionPrefix(line), pageNumber: page.pageNumber };
      } else if (current && shouldContinueQuestion(line)) {
        current.text = normalizeWhitespace(`${current.text} ${line}`);
      } else if (current) {
        commitCurrent();
      }
    }
  }
  commitCurrent();

  return {
    questions,
    detectedCount: questions.length + duplicateCount,
    duplicateCount,
    openAnswerCount: questions.length,
  };
}
