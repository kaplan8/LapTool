import { describe, expect, it } from "vitest";

import { extractQuestionsFromPdfPages, suggestPdfCategory } from "./pdf-question-extractor";

describe("suggestPdfCategory", () => {
  it("suggests a specific category from IT-Systemtechnik keywords", () => {
    expect(suggestPdfCategory("Welche Aufgabe hat DNS und wie arbeitet DHCP?")).toBe("DNS, DHCP");
    expect(suggestPdfCategory("Beschreiben Sie VLAN Tagging und Routing zwischen Netzen.")).toBe(
      "Routing, Switching, VLAN",
    );
    expect(suggestPdfCategory("Nennen Sie Linux-Dateirechte und chmod Beispiele.")).toBe("Linux");
  });
});

describe("extractQuestionsFromPdfPages", () => {
  it("detects numbered and prompt-based questions and joins multiline text", () => {
    const result = extractQuestionsFromPdfPages([
      {
        pageNumber: 3,
        text: [
          "WKO Repetitionsfragen Informationstechnologie",
          "1. Nennen Sie die sieben Schichten",
          "des OSI-Modells in richtiger Reihenfolge.",
          "2) Was ist der Unterschied zwischen TCP und UDP?",
          "Seite 3",
        ].join("\n"),
      },
    ]);

    expect(result.questions).toHaveLength(2);
    expect(result.questions[0]).toMatchObject({
      question: "Nennen Sie die sieben Schichten des OSI-Modells in richtiger Reihenfolge.",
      category: "OSI-Modell",
      pageNumber: 3,
      answer: "Antwort offen",
      answerStatus: "open",
    });
    expect(result.questions[1].question).toBe("Was ist der Unterschied zwischen TCP und UDP?");
  });

  it("ignores table of contents, simple page numbers and repeated headers", () => {
    const result = extractQuestionsFromPdfPages([
      {
        pageNumber: 1,
        text: "Inhaltsverzeichnis\n1 Netzwerktechnik 3\n2 Linux 5\n1",
      },
      {
        pageNumber: 2,
        text: "LAP Fragenkatalog\n1. Erklären Sie die 3-2-1-Backup-Regel.\n2",
      },
      {
        pageNumber: 3,
        text: "LAP Fragenkatalog\n2. Welche Vorteile bietet ein Hypervisor?\n3",
      },
    ]);

    expect(result.questions.map((item) => item.question)).toEqual([
      "Erklären Sie die 3-2-1-Backup-Regel.",
      "Welche Vorteile bietet ein Hypervisor?",
    ]);
  });

  it("deduplicates repeated questions and reports duplicate count", () => {
    const result = extractQuestionsFromPdfPages([
      { pageNumber: 4, text: "1. Was ist ein VPN?" },
      { pageNumber: 5, text: "2. Was ist ein VPN?" },
    ]);

    expect(result.questions).toHaveLength(1);
    expect(result.duplicateCount).toBe(1);
  });
});
