import type { Metadata } from "next";
import { CollectiblesClient } from "./collectibles-client";

export const metadata: Metadata = {
  title: "Collectibles | RealityPicks",
  description: "NFT badges with real utility — XP boosts, multiplier perks, streak insurance, and Season Passes.",
};

export default function CollectiblesPage() {
  return <CollectiblesClient />;
}
