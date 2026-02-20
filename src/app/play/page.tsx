import type { Metadata } from "next";
import { getAllActiveSeasons } from "@/lib/actions/episodes";
import { getTopLeaderboard } from "@/lib/actions/leaderboard";
import { getUserRank } from "@/lib/actions/profile";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PlayClient,
  type MarketData,
  type SeasonContext,
  type CompetitiveContext,
} from "./play-client";

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

function emojiForSlug(slug: string | null): string {
  if (!slug) return "📺";
  for (const [key, emoji] of Object.entries(SHOW_EMOJI)) {
    if (slug.toLowerCase().includes(key)) return emoji;
  }
  return "📺";
}

function mapStatus(
  epStatus: string,
  lockAt: Date,
): MarketData["status"] {
  if (epStatus === "RESOLVED") return "closed";
  if (epStatus === "LOCKED") return "locked";
  if (epStatus === "OPEN") {
    return new Date() < lockAt ? "live" : "locked";
  }
  return "upcoming";
}

export default async function PlayPage() {
  const [seasons, session] = await Promise.all([
    getAllActiveSeasons(),
    getSession(),
  ]);

  const markets: MarketData[] = [];
  const seasonContexts: SeasonContext[] = [];
  let competitive: CompetitiveContext | null = null;

  for (const season of seasons) {
    const showLabel = season.title;
    const emoji = emojiForSlug((season as any).showSlug);
    const totalEpisodes = season.episodes.length;
    const resolvedEpisodes = season.episodes.filter(
      (ep) => ep.status === "RESOLVED"
    ).length;

    const nextEpisode = season.episodes.find(
      (ep) => ep.status === "OPEN" || ep.status === "DRAFT"
    );

    seasonContexts.push({
      id: season.id,
      title: showLabel,
      emoji,
      totalEpisodes,
      resolvedEpisodes,
      nextEpisodeAirAt: nextEpisode?.airAt?.toISOString() ?? null,
      nextEpisodeLockAt: nextEpisode?.lockAt?.toISOString() ?? null,
      nextEpisodeNumber: nextEpisode?.number ?? null,
    });

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

      const status = mapStatus(episode.status, episode.lockAt);
      const lockMs = episode.lockAt.getTime() - Date.now();

      markets.push({
        id: episode.id,
        emoji,
        showName: showLabel,
        episode: `EP${episode.number}`,
        episodeTitle: episode.title,
        questions: questionCount,
        participants: uniquePlayers.length,
        predictions: predictionCount,
        lockAt: episode.lockAt.toISOString(),
        airAt: episode.airAt.toISOString(),
        hoursUntilLock: lockMs > 0 ? lockMs / 3_600_000 : 0,
        status,
        href: `/dashboard?episode=${episode.id}`,
        seasonId: season.id,
      });
    }
  }

  if (seasons.length > 0) {
    const primarySeasonId = seasons[0].id;
    const [topEntries, userRank] = await Promise.all([
      getTopLeaderboard(primarySeasonId, 1),
      session?.user ? getUserRank(primarySeasonId) : null,
    ]);

    const leader = topEntries[0];
    competitive = {
      leaderName: leader?.user?.name || "—",
      leaderPoints: leader?.points || 0,
      userRank: userRank?.rank ?? null,
      userPoints: userRank?.points ?? null,
      pointsToNextRank:
        userRank && userRank.rank > 1
          ? (() => {
              return null;
            })()
          : null,
    };

    if (userRank && userRank.rank > 1) {
      const nextAbove = await prisma.userSeasonStats.findFirst({
        where: {
          seasonId: primarySeasonId,
          points: { gt: userRank.points },
        },
        orderBy: { points: "asc" },
        select: { points: true },
      });
      if (nextAbove) {
        competitive.pointsToNextRank = nextAbove.points - userRank.points;
      }
    }
  }

  return (
    <PlayClient
      markets={markets}
      seasonContexts={seasonContexts}
      competitive={competitive}
    />
  );
}
