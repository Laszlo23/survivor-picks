import { describe, it, expect } from "vitest";
import {
  convertOddsToMultiplier,
  formatOdds,
  calculatePickPoints,
  calculateStreak,
  calculateWinRate,
  BASE_POINTS,
  RISK_MULTIPLIER,
  JOKER_SAVE_POINTS,
  STREAK_BONUS,
} from "@/lib/scoring";

// ─── convertOddsToMultiplier ──────────────────────────────────────────────────

describe("convertOddsToMultiplier", () => {
  it("converts positive odds correctly", () => {
    expect(convertOddsToMultiplier(100)).toBe(2.0);
    expect(convertOddsToMultiplier(150)).toBe(2.5);
    expect(convertOddsToMultiplier(200)).toBe(3.0);
    expect(convertOddsToMultiplier(300)).toBe(4.0);
    expect(convertOddsToMultiplier(500)).toBe(6.0);
  });

  it("converts negative odds correctly", () => {
    expect(convertOddsToMultiplier(-100)).toBe(2.0);
    expect(convertOddsToMultiplier(-110)).toBe(1.91);
    expect(convertOddsToMultiplier(-150)).toBe(1.67);
    expect(convertOddsToMultiplier(-200)).toBe(1.5);
    expect(convertOddsToMultiplier(-300)).toBe(1.33);
  });

  it("handles edge cases", () => {
    expect(convertOddsToMultiplier(0)).toBe(2.0); // fallback
    expect(convertOddsToMultiplier(50)).toBe(2.0); // fallback for invalid
  });

  it("always returns >= 1.0", () => {
    const testValues = [-500, -200, -110, 100, 200, 500, 1000];
    for (const odds of testValues) {
      expect(convertOddsToMultiplier(odds)).toBeGreaterThanOrEqual(1.0);
    }
  });
});

// ─── formatOdds ───────────────────────────────────────────────────────────────

describe("formatOdds", () => {
  it("adds + prefix for positive odds", () => {
    expect(formatOdds(150)).toBe("+150");
    expect(formatOdds(100)).toBe("+100");
  });

  it("keeps - prefix for negative odds", () => {
    expect(formatOdds(-110)).toBe("-110");
  });

  it("handles zero", () => {
    expect(formatOdds(0)).toBe("+0");
  });
});

// ─── calculatePickPoints ─────────────────────────────────────────────────────

describe("calculatePickPoints", () => {
  it("calculates correct pick with base odds", () => {
    const result = calculatePickPoints({
      isCorrect: true,
      odds: 100,
      isRisk: false,
      usedJoker: false,
    });
    expect(result.points).toBe(200); // 100 * 2.0
    expect(result.breakdown.base).toBe(BASE_POINTS);
    expect(result.breakdown.multiplier).toBe(2.0);
  });

  it("calculates correct pick with high odds", () => {
    const result = calculatePickPoints({
      isCorrect: true,
      odds: 300,
      isRisk: false,
      usedJoker: false,
    });
    expect(result.points).toBe(400); // 100 * 4.0
  });

  it("calculates correct pick with negative odds", () => {
    const result = calculatePickPoints({
      isCorrect: true,
      odds: -200,
      isRisk: false,
      usedJoker: false,
    });
    expect(result.points).toBe(150); // 100 * 1.5
  });

  it("calculates risk bet correct", () => {
    const result = calculatePickPoints({
      isCorrect: true,
      odds: 200,
      isRisk: true,
      usedJoker: false,
    });
    expect(result.points).toBe(450); // 100 * 3.0 * 1.5
    expect(result.breakdown.riskMultiplier).toBe(RISK_MULTIPLIER);
  });

  it("returns 0 for wrong pick", () => {
    const result = calculatePickPoints({
      isCorrect: false,
      odds: 150,
      isRisk: false,
      usedJoker: false,
    });
    expect(result.points).toBe(0);
  });

  it("joker saves wrong pick with base points", () => {
    const result = calculatePickPoints({
      isCorrect: false,
      odds: 300,
      isRisk: false,
      usedJoker: true,
    });
    expect(result.points).toBe(JOKER_SAVE_POINTS);
    expect(result.breakdown.jokerSave).toBe(true);
  });

  it("joker does NOT save risk bet wrong pick", () => {
    const result = calculatePickPoints({
      isCorrect: false,
      odds: 200,
      isRisk: true,
      usedJoker: true,
    });
    expect(result.points).toBe(0);
    expect(result.breakdown.jokerSave).toBe(false);
  });

  it("joker on correct pick does nothing extra", () => {
    const withJoker = calculatePickPoints({
      isCorrect: true,
      odds: 150,
      isRisk: false,
      usedJoker: true,
    });
    const withoutJoker = calculatePickPoints({
      isCorrect: true,
      odds: 150,
      isRisk: false,
      usedJoker: false,
    });
    expect(withJoker.points).toBe(withoutJoker.points);
  });
});

// ─── calculateStreak ──────────────────────────────────────────────────────────

describe("calculateStreak", () => {
  it("increments streak on correct", () => {
    const result = calculateStreak(2, true);
    expect(result.newStreak).toBe(3);
  });

  it("resets streak on no correct", () => {
    const result = calculateStreak(5, false);
    expect(result.newStreak).toBe(0);
    expect(result.bonusPoints).toBe(0);
  });

  it("no bonus on first episode of streak", () => {
    const result = calculateStreak(0, true);
    expect(result.newStreak).toBe(1);
    expect(result.bonusPoints).toBe(0);
  });

  it("awards bonus starting from second episode", () => {
    const result = calculateStreak(1, true);
    expect(result.newStreak).toBe(2);
    expect(result.bonusPoints).toBe(STREAK_BONUS); // 25 * 1
  });

  it("scales bonus with streak length", () => {
    const result = calculateStreak(4, true);
    expect(result.newStreak).toBe(5);
    expect(result.bonusPoints).toBe(STREAK_BONUS * 4); // 25 * 4 = 100
  });
});

// ─── calculateWinRate ─────────────────────────────────────────────────────────

describe("calculateWinRate", () => {
  it("returns 0 for no predictions", () => {
    expect(calculateWinRate(0, 0)).toBe(0);
  });

  it("calculates correctly", () => {
    expect(calculateWinRate(3, 10)).toBe(0.3);
    expect(calculateWinRate(7, 10)).toBe(0.7);
    expect(calculateWinRate(10, 10)).toBe(1);
  });
});

// ─── Integration: Scoring Scenarios ───────────────────────────────────────────

describe("Scoring Scenarios", () => {
  it("full episode scoring scenario", () => {
    // User makes 3 picks in an episode:
    // Pick 1: Correct +150, no risk = 100 * 2.5 = 250
    const pick1 = calculatePickPoints({
      isCorrect: true,
      odds: 150,
      isRisk: false,
      usedJoker: false,
    });
    expect(pick1.points).toBe(250);

    // Pick 2: Wrong +200, with joker = 100 (joker save)
    const pick2 = calculatePickPoints({
      isCorrect: false,
      odds: 200,
      isRisk: false,
      usedJoker: true,
    });
    expect(pick2.points).toBe(100);

    // Pick 3: Correct +300, risk bet = 100 * 4.0 * 1.5 = 600
    const pick3 = calculatePickPoints({
      isCorrect: true,
      odds: 300,
      isRisk: true,
      usedJoker: false,
    });
    expect(pick3.points).toBe(600);

    // Total episode points (before streak bonus)
    const episodeTotal = pick1.points + pick2.points + pick3.points;
    expect(episodeTotal).toBe(950);

    // Streak bonus (was on 2 streak, now 3)
    const streak = calculateStreak(2, true); // got correct
    expect(streak.newStreak).toBe(3);
    expect(streak.bonusPoints).toBe(50); // 25 * 2

    // Grand total
    expect(episodeTotal + streak.bonusPoints).toBe(1000);
  });
});
