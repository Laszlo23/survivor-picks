import type { Metadata } from "next";
import { AIClient } from "./ai-client";

export const metadata: Metadata = {
  title: "AI Predictions | RealityPicks",
  description: "See what AI predicts — then follow or fade. Compare your accuracy against the machine.",
};

export default function AIPage() {
  return <AIClient />;
}
