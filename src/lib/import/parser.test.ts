import { describe, expect, it } from "vitest";

import { detectDuplicates, parseCsvQuestions, parseJsonQuestions, validateImportedQuestions } from "./parser";

describe("parseCsvQuestions", () => {
  it("parses question fields, tags and multiple-choice options", () => {
    const csv = [
      "question,answer,category,difficulty,type,source,relevance,tags,explanation,optionA,optionB,optionC,optionD,correctOptions",
      "\"Was ist DNS?\",\"Namensauflösung\",\"DNS, DHCP\",mittel,multiple_choice,Demo,hoch,\"dns,netzwerk\",\"Domain Name System\",Resolver,Switch,Router,Firewall,A",
    ].join("\n");

    const [question] = parseCsvQuestions(csv);

    expect(question.question).toBe("Was ist DNS?");
    expect(question.tags).toEqual(["dns", "netzwerk"]);
    expect(question.options).toEqual([
      { text: "Resolver", isCorrect: true },
      { text: "Switch", isCorrect: false },
      { text: "Router", isCorrect: false },
      { text: "Firewall", isCorrect: false },
    ]);
  });
});

describe("parseJsonQuestions", () => {
  it("parses the supported JSON import shape", () => {
    const questions = parseJsonQuestions(
      JSON.stringify([
        {
          question: "Was ist ein Hypervisor?",
          answer: "Eine Virtualisierungsschicht.",
          category: "Virtualisierung",
          difficulty: "mittel",
          type: "flashcard",
          source: "Eigene Notiz",
          relevance: "hoch",
          tags: ["vm"],
        },
      ]),
    );

    expect(questions).toHaveLength(1);
    expect(questions[0].category).toBe("Virtualisierung");
  });
});

describe("validateImportedQuestions", () => {
  it("marks missing answers and invalid types as errors", () => {
    const result = validateImportedQuestions([
      {
        question: "Unvollständig",
        answer: "",
        category: "Linux",
        difficulty: "mittel",
        type: "invalid",
        source: "Demo",
        relevance: "hoch",
        tags: [],
        explanation: "",
        options: [],
      },
    ]);

    expect(result.valid).toHaveLength(0);
    expect(result.invalid[0].errors).toContain("Antwort darf nicht leer sein.");
    expect(result.invalid[0].errors).toContain("Fragetyp ist ungültig.");
  });
});

describe("detectDuplicates", () => {
  it("finds duplicate question texts case-insensitively", () => {
    const duplicates = detectDuplicates([
      {
        question: "Was ist DHCP?",
        answer: "Automatische IP-Konfiguration.",
        category: "DNS, DHCP",
        difficulty: "mittel",
        type: "flashcard",
        source: "Demo",
        relevance: "hoch",
        tags: [],
        explanation: "",
        options: [],
      },
      {
        question: "  was ist dhcp? ",
        answer: "Dynamic Host Configuration Protocol.",
        category: "DNS, DHCP",
        difficulty: "mittel",
        type: "flashcard",
        source: "Demo",
        relevance: "hoch",
        tags: [],
        explanation: "",
        options: [],
      },
    ]);

    expect(duplicates).toEqual(["was ist dhcp?"]);
  });
});
