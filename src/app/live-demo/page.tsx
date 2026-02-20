import type { Metadata } from "next";
import { LiveDemoClient } from "./live-demo-client";

export const metadata: Metadata = {
  title: "Live Betting Demo | RealityPicks",
  description: "Experience the future of live prediction betting — fullscreen 16:9 broadcast interface.",
};

export default function LiveDemoPage() {
  return <LiveDemoClient />;
}
