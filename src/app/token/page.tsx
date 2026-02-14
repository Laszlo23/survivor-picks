import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "$PICKS Token | RealityPicks",
  description: "The utility token powering RealityPicks on Base. View balance, stats, and trade.",
};

import { TokenClient } from "./token-client";

export default function TokenPage() {
  return <TokenClient />;
}
