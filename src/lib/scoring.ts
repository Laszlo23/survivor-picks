/**
 * RealityPicks — Scoring System
 * ================================
 *
 * SCORING RULES:
 *
 * 1. BASE POINTS: 100 points per correct prediction.
 *
 * 2. ODDS MULTIPLIER (American odds → multiplier):
 *    - Positive odds (+150): multiplier = (odds / 100) + 1 = 2.5x
 *    - Negative odds (-110): multiplier = (100 / |odds|) + 1 = 1.91x
 *    - Even odds (+100): multiplier = 2.0x
 *    Higher positive odds = harder pick = bigger reward.
 *
 * 3. RISK BET:
 *    - Standard pick: points = base × multiplier
 *    - Risk pick:     points = base × multiplier × 1.5 (if correct)
 *    - Risk pick:     points = 0 (if wrong, no joker save possible on risk bets)
 *
 * 4. IMMUNITY JOKER:
 *    - Each user gets 3 jokers per season.
 *    - When applied to a prediction: if the prediction is WRONG, the user gets
 *      base points (100) instead of 0. If CORRECT, no difference.
 *    - Joker does NOT apply to Risk Bets (you can't hedge a risk bet).
 *    - Joker is consumed when the question is resolved (even if pick was correct).
 *
 * 5. STREAKS:
 *    - A "streak" = consecutive episodes where the user got ≥1 prediction correct.
 *    - Streak bonus: +25 points for each episode in an active streak (from episode 2 onward).
 *    - If a user gets 0 correct in an episode, streak resets to 0.
 *
 * 6. WIN RATE:
 *    - winRate = correctCount / totalCount (0 if totalCount is 0).
 *
 * 7. TRIBE LOYALTY:
 *    - If a question involves a tribe/team and the user picks their "favorite tribe"
 *      option correctly, tribeLoyaltyCorrect increments.
 *    - This is tracked but has no point bonus (it's a vanity stat).
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const BASE_POINTS = 100;
export const RISK_MULTIPLIER = 1.5;
export const JOKER_SAVE_POINTS = 100; // points awarded when joker saves a wrong pick
export const STREAK_BONUS = 25;
export const JOKERS_PER_SEASON = 3;

// ─── Social & Referral Constants ─────────────────────────────────────────────

export const SOCIAL_SHARE_PREDICTION = 25;  // share a prediction you made
export const SOCIAL_SHARE_RESULT = 50;      // share a win (encourages showing off)
export const SOCIAL_SHARE_LOSS = 15;        // share a loss (fun/engagement, lower reward)
export const SOCIAL_SHARE_RANK = 30;        // share leaderboard position
export const REFERRAL_REFERRER_BONUS = 200; // referrer gets 200 pts per successful invite
export const REFERRAL_REFEREE_BONUS = 100;  // new user gets 100 pts welcome bonus
export const SOCIAL_COOLDOWN_HOURS = 24;    // 1 share reward per task type per day

// ─── Odds Conversion ─────────────────────────────────────────────────────────

/**
 * Convert American odds to a decimal multiplier.
 *
 * Examples:
 *   +150 → 2.5x (risk $100 to win $150 = total $250)
 *   +200 → 3.0x
 *   +100 → 2.0x (even money)
 *   -110 → 1.91x
 *   -200 → 1.5x (heavy favorite)
 *
 * @param odds American odds integer (can be positive or negative)
 * @returns Decimal multiplier (always >= 1.0)
 */
export function convertOddsToMultiplier(odds: number): number {
  if (odds >= 100) {
    return Number(((odds / 100) + 1).toFixed(2));
  } else if (odds <= -100) {
    return Number(((100 / Math.abs(odds)) + 1).toFixed(2));
  }
  // Fallback for invalid odds (between -99 and +99)
  return 2.0;
}

/**
 * Format American odds for display.
 * Positive odds get a "+" prefix, negative already have "-".
 */
export function formatOdds(odds: number): string {
  return odds >= 0 ? `+${odds}` : `${odds}`;
}

// ─── Point Calculation ────────────────────────────────────────────────────────

export interface PickScoreInput {
  isCorrect: boolean;
  odds: number;
  isRisk: boolean;
  usedJoker: boolean;
}

export interface PickScoreResult {
  points: number;
  breakdown: {
    base: number;
    multiplier: number;
    riskMultiplier: number;
    jokerSave: boolean;
  };
}

/**
 * Calculate points for a single prediction.
 */
export function calculatePickPoints(input: PickScoreInput): PickScoreResult {
  const multiplier = convertOddsToMultiplier(input.odds);

  if (input.isCorrect) {
    const base = BASE_POINTS;
    const riskMult = input.isRisk ? RISK_MULTIPLIER : 1;
    const points = Math.round(base * multiplier * riskMult);

    return {
      points,
      breakdown: {
        base,
        multiplier,
        riskMultiplier: riskMult,
        jokerSave: false,
      },
    };
  }

  // Wrong prediction
  if (input.usedJoker && !input.isRisk) {
    // Joker saves: award base points (no multiplier)
    return {
      points: JOKER_SAVE_POINTS,
      breakdown: {
        base: JOKER_SAVE_POINTS,
        multiplier: 1,
        riskMultiplier: 1,
        jokerSave: true,
      },
    };
  }

  // Wrong, no joker save
  return {
    points: 0,
    breakdown: {
      base: 0,
      multiplier,
      riskMultiplier: input.isRisk ? RISK_MULTIPLIER : 1,
      jokerSave: false,
    },
  };
}

// ─── Streak Calculation ───────────────────────────────────────────────────────

/**
 * Calculate streak bonus for an episode.
 * @param currentStreak The streak count BEFORE this episode
 * @param gotCorrectThisEpisode Whether user got ≥1 correct this episode
 * @returns { newStreak, bonusPoints }
 */
export function calculateStreak(
  currentStreak: number,
  gotCorrectThisEpisode: boolean
): { newStreak: number; bonusPoints: number } {
  if (!gotCorrectThisEpisode) {
    return { newStreak: 0, bonusPoints: 0 };
  }

  const newStreak = currentStreak + 1;
  // Bonus only from episode 2 of the streak onward
  const bonusPoints = newStreak >= 2 ? STREAK_BONUS * (newStreak - 1) : 0;

  return { newStreak, bonusPoints };
}

// ─── Win Rate ─────────────────────────────────────────────────────────────────

export function calculateWinRate(correct: number, total: number): number {
  if (total === 0) return 0;
  return Number((correct / total).toFixed(4));
}
