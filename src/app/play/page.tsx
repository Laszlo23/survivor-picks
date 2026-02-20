import type { Metadata } from "next";
import { getAllActiveSeasons } from "@/lib/actions/episodes";
import { prisma } from "@/lib/prisma";
import { PlayClient, type MarketData } from "./play-client";

export const metadata: Metadata = {
  title: "Play | RealityPicks",
  description: "Browse live and upcoming prediction markets across all shows.",
};

export const revalidate = 60;

const SHOW_EMOJI: Record<string, string> = {
  survivor: "🏝️",
  bachelor: "🌹",
  "love-island": "💕",
  "big-brother": "🏠",
  traitors: "🎭",
};

function emojiForSlug(slug: string): string {
  for (const [key, emoji] of Object.entries(SHOW_EMOJI)) {
    if (slug.toLowerCase().includes(key)) return emoji;
  }
  return "📺";
}

function mapStatus(
  epStatus: string,
  lockAt: Date,
  airAt: Date
): MarketData["status"] {
  if (epStatus === "RESOLVED") return "closed";
  if (epStatus === "LOCKED") return "locked";
  if (epStatus === "OPEN") {
    return new Date() < lockAt ? "live" : "locked";
  }
  if (epStatus === "DRAFT") {
    return new Date() < airAt ? "upcoming" : "upcoming";
  }
  return "upcoming";
}

function timeUntil(date: Date): string {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default async function PlayPage() {
  const seasons = await getAllActiveSeasons();

  const markets: MarketData[] = [];

  for (const season of seasons) {
    const showLabel = season.title;
    const emoji = emojiForSlug(season.showSlug);

    for (const episode of season.episodes) {
      const questionCount = await prisma.question.count({
        where: { episodeId: episode.id, status: { not: "DRAFT" } },
      });
      if (questionCount === 0 && episode.status === "DRAFT") continue;

      const predictionCount = await prisma.prediction.count({
        where: { question: { episodeId: episode.id } },
      });

      const uniquePlayers = await prisma.prediction.groupBy({
        by: ["userId"],
        where: { question: { episodeId: episode.id } },
      });

      const status = mapStatus(episode.status, episode.lockAt, episode.airAt);
      const timeLeft =
        status === "closed"
          ? "Ended"
          : status === "locked"
            ? "Locked"
            : timeUntil(episode.lockAt);

      markets.push({
        id: episode.id,
        emoji,
        showName: showLabel,
        episode: `EP${episode.number}`,
        episodeTitle: episode.title,
        questions: questionCount,
        participants: uniquePlayers.length,
        predictions: predictionCount,
        timeLeft,
        airAt: episode.airAt.toISOString(),
        status,
        href: "/dashboard",
      });
    }
  }

  return <PlayClient markets={markets} />;
}
