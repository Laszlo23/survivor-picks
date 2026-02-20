/**
 * Plain-language terminology for non-technical users.
 * Use these labels and tooltips across the app.
 */

export const GLOSSARY = {
  XP: {
    label: "Season points",
    tooltip: "Points you earn across the season",
  },
  pts: {
    label: "points",
    tooltip: undefined,
  },
  streak: {
    label: "Win streak",
    tooltip: "How many correct picks in a row",
  },
  winRate: {
    label: "Hit rate",
    tooltip: "% of picks you got right",
  },
  rank: {
    label: "Place",
    tooltip: "Your position on the leaderboard",
  },
  markets: {
    label: "Pick rounds",
    tooltip: "A set of questions for one episode",
  },
  position: {
    label: "Your pick",
    tooltip: undefined,
  },
  stake: {
    label: "Lock tokens",
    tooltip: "Temporarily lock tokens to boost rewards",
  },
  staking: {
    label: "Lock tokens",
    tooltip: "Temporarily lock tokens to boost rewards",
  },
  multiplier: {
    label: "Boost",
    tooltip: "Multiplies your points if correct",
  },
  riskBets: {
    label: "Risky picks",
    tooltip: "Higher boost, but you lose more if wrong",
  },
  buybackBurn: {
    label: "Buy back + remove tokens from circulation",
    tooltip: "Tokens are bought and permanently removed from supply",
  },
  liquidityPool: {
    label: "Shared token pool",
    tooltip: "A pool where tokens can be traded",
  },
  onChain: {
    label: "Recorded on the blockchain",
    tooltip: "Stored permanently on a public ledger",
  },
  gasFees: {
    label: "Transaction fee",
    tooltip: "A small fee paid when moving tokens on the blockchain",
  },
  contracts: {
    label: "Smart contracts",
    tooltip: "Code on the blockchain that runs automatically",
  },
  audits: {
    label: "Security reviews",
    tooltip: "Independent checks to ensure the code is safe",
  },
  baseScan: {
    label: "Base blockchain explorer",
    tooltip: "A website to view transactions on Base",
  },
} as const;

/** Plain labels for common UI terms */
export const LABELS = {
  predictNow: "Make your pick",
  browseMarkets: "Browse pick rounds",
  newMarket: "New pick round",
  predictionsAvailable: "questions available",
  tokenRewards: "Token rewards (optional)",
  dailyMissions: "Daily tasks",
  tapToPick: "Tap to choose",
  possiblePoints: "Possible points",
  followAI: "Pick the same",
  fadeAI: "Pick the opposite",
  communityResults: "Community results",
  badges: "Badges",
} as const;
