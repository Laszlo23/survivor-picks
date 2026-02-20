import type { Metadata } from "next";
import { PlayClient } from "./play-client";

export const metadata: Metadata = {
  title: "Play | RealityPicks",
  description: "Browse live and upcoming prediction markets across Survivor, The Bachelor, Love Island, and more.",
};

export default function PlayPage() {
  return <PlayClient />;
}
