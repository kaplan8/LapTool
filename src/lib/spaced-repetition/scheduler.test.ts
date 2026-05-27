import { describe, expect, it } from "vitest";

import { calculateNextReview } from "./scheduler";

const now = new Date("2026-05-27T08:00:00.000Z");

describe("calculateNextReview", () => {
  it("schedules a new card rated good with one repetition and a one-day interval", () => {
    const next = calculateNextReview(null, "good", now);

    expect(next.repetitions).toBe(1);
    expect(next.intervalDays).toBe(1);
    expect(next.easeFactor).toBe(2.5);
    expect(next.nextReviewAt.toISOString()).toBe("2026-05-28T08:00:00.000Z");
  });

  it("resets repetitions and lowers ease factor for again without dropping below 1.3", () => {
    const next = calculateNextReview(
      {
        repetitions: 5,
        easeFactor: 1.35,
        intervalDays: 14,
      },
      "again",
      now,
    );

    expect(next.repetitions).toBe(0);
    expect(next.intervalDays).toBe(1);
    expect(next.easeFactor).toBe(1.3);
    expect(next.nextReviewAt.toISOString()).toBe("2026-05-28T08:00:00.000Z");
  });

  it("grows interval faster for easy than for good", () => {
    const current = {
      repetitions: 3,
      easeFactor: 2.4,
      intervalDays: 7,
    };

    const good = calculateNextReview(current, "good", now);
    const easy = calculateNextReview(current, "easy", now);

    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
    expect(easy.easeFactor).toBeGreaterThan(good.easeFactor);
  });
});
