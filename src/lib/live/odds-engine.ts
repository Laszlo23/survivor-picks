// ─── Dynamic Parimutuel Odds Engine ──────────────────────────────────────────
//
// Odds shift based on how much is staked on each option.
// Formula: odds[option] = (totalPool / optionPool) * (1 - platformFee)
// Minimum odds: 1.1x (nobody gets less than 10% return)
// Platform fee: 3%

const PLATFORM_FEE = 0.03;
const MIN_ODDS = 1.1;
const DEFAULT_ODDS = 2.0;

export interface PoolState {
  totalPool: number;
  optionPools: Record<string, number>;
}

/** Calculate dynamic odds for all options based on current pool state */
export function calculateOdds(pool: PoolState): Record<string, number> {
  const odds: Record<string, number> = {};

  if (pool.totalPool <= 0) {
    // No stakes yet — return default equal odds
    for (const option of Object.keys(pool.optionPools)) {
      odds[option] = DEFAULT_ODDS;
    }
    return odds;
  }

  for (const [option, optionPool] of Object.entries(pool.optionPools)) {
    if (optionPool <= 0) {
      // Nobody bet on this — very attractive odds
      odds[option] = Math.max(
        pool.totalPool * (1 - PLATFORM_FEE),
        10
      );
    } else {
      const raw = (pool.totalPool / optionPool) * (1 - PLATFORM_FEE);
      odds[option] = Math.max(raw, MIN_ODDS);
    }
  }

  return odds;
}

/** Calculate payout for a winning bet */
export function calculatePayout(
  stakeAmount: number,
  odds: number,
  multiplier: number = 1
): number {
  return stakeAmount * odds * multiplier;
}

/** Build pool state from placements */
export function buildPoolState(
  options: string[],
  placements: Array<{ chosenOption: string; stakeAmount: string }>
): PoolState {
  const optionPools: Record<string, number> = {};
  for (const opt of options) {
    optionPools[opt] = 0;
  }

  let totalPool = 0;
  for (const p of placements) {
    const amount = parseFloat(p.stakeAmount) || 0;
    totalPool += amount;
    if (optionPools[p.chosenOption] !== undefined) {
      optionPools[p.chosenOption] += amount;
    }
  }

  return { totalPool, optionPools };
}

/** Format odds for display (e.g., 2.35 → "2.35x") */
export function formatOdds(odds: number): string {
  return `${odds.toFixed(2)}x`;
}

/** Calculate implied probability from odds */
export function impliedProbability(odds: number): number {
  if (odds <= 0) return 0;
  return 1 / odds;
}
