export const PICKS_PRICE_USD = 0.00333;

export const TOKEN_PACKAGES = [
  {
    id: "starter",
    label: "Starter 333",
    picks: 3_333,
    priceUsd: 11.10,
    popular: false,
  },
  {
    id: "player",
    label: "Player 33K",
    picks: 33_333,
    priceUsd: 111.00,
    popular: true,
  },
  {
    id: "pro",
    label: "Pro 333K",
    picks: 333_333,
    priceUsd: 1_110.00,
    popular: false,
  },
  {
    id: "whale",
    label: "Legend 3.33M",
    picks: 3_333_333,
    priceUsd: 11_100.00,
    popular: false,
  },
] as const;

export type TokenPackage = (typeof TOKEN_PACKAGES)[number];
