import { describe, expect, it } from "vitest";

import { calculateScore, evaluateMultipleChoice, getExamRecommendations } from "./exam";

describe("evaluateMultipleChoice", () => {
  it("is correct only when every correct option and no wrong option is selected", () => {
    const options = [
      { id: "a", isCorrect: true },
      { id: "b", isCorrect: false },
      { id: "c", isCorrect: true },
    ];

    expect(evaluateMultipleChoice(options, ["a", "c"])).toBe(true);
    expect(evaluateMultipleChoice(options, ["a"])).toBe(false);
    expect(evaluateMultipleChoice(options, ["a", "b", "c"])).toBe(false);
  });
});

describe("calculateScore", () => {
  it("calculates max score, awarded points, percentage and pass status", () => {
    const result = calculateScore([
      { isCorrect: true, maxPoints: 2 },
      { isCorrect: false, maxPoints: 2 },
      { isCorrect: true, maxPoints: 1, pointsAwarded: 0.5 },
    ]);

    expect(result.score).toBe(2.5);
    expect(result.maxScore).toBe(5);
    expect(result.percentage).toBe(50);
    expect(result.passed).toBe(false);
  });
});

describe("getExamRecommendations", () => {
  it("returns the weakest categories first", () => {
    const recommendations = getExamRecommendations([
      { categoryName: "DNS, DHCP", isCorrect: false },
      { categoryName: "DNS, DHCP", isCorrect: true },
      { categoryName: "Linux", isCorrect: false },
      { categoryName: "Linux", isCorrect: false },
    ]);

    expect(recommendations[0]).toContain("Linux");
    expect(recommendations[1]).toContain("DNS, DHCP");
  });
});
