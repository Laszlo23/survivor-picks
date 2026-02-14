import type { Metadata } from "next";

// Token page is client-only — no server data needed; cache the shell
export const revalidate = 300;

export const metadata: Metadata = {
  title: "$PICKS Token | RealityPicks",
  description: "The utility token powering RealityPicks on Base. View balance, stats, and trade.",
};

import { TokenClient } from "./token-client";

export default function TokenPage() {
  return <TokenClient />;
}
