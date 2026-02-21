import type { Metadata } from "next";
import { getAllActiveSeasons } from "@/lib/actions/episodes";
import { getTopLeaderboard } from "@/lib/actions/leaderboard";
import { getUserRank } from "@/lib/actions/profile";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getShowBySlug } from "@/lib/shows";
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
    const showSlug = season.showSlug ?? null;
    const emoji = emojiForSlug(showSlug);
    const showInfo = showSlug ? getShowBySlug(showSlug) : undefined;
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

    const episodeIds = season.episodes.map((ep) => ep.id);

    const contestantImageMap: Record<string, string> = {};
    if (season.contestants) {
      for (const c of season.contestants) {
        if (c.imageUrl) contestantImageMap[c.name] = c.imageUrl;
      }
    }

    const [questionCounts, predictionCounts, playerCounts, topQuestions] = await Promise.all([
      prisma.question.groupBy({
        by: ["episodeId"],
        where: { episodeId: { in: episodeIds }, status: { not: "DRAFT" } },
        _count: { id: true },
      }),
      prisma.prediction.groupBy({
        by: ["questionId"],
        where: { question: { episodeId: { in: episodeIds } } },
        _count: { id: true },
      }).then(async (preds) => {
        const questionToEpisode = await prisma.question.findMany({
          where: { episodeId: { in: episodeIds } },
          select: { id: true, episodeId: true },
        });
        const qToE = new Map(questionToEpisode.map((q) => [q.id, q.episodeId]));
        const counts = new Map<string, number>();
        for (const p of preds) {
          const epId = qToE.get(p.questionId);
          if (epId) counts.set(epId, (counts.get(epId) ?? 0) + p._count.id);
        }
        return counts;
      }),
      prisma.prediction.findMany({
        where: { question: { episodeId: { in: episodeIds } } },
        select: { userId: true, question: { select: { episodeId: true } } },
        distinct: ["userId", "questionId"],
      }).then((rows) => {
        const counts = new Map<string, Set<string>>();
        for (const r of rows) {
          const epId = r.question.episodeId;
          if (!counts.has(epId)) counts.set(epId, new Set());
          counts.get(epId)!.add(r.userId);
        }
        return new Map([...counts.entries()].map(([k, v]) => [k, v.size]));
      }),
      prisma.question.findMany({
        where: {
          episodeId: { in: episodeIds },
          status: { in: ["OPEN", "LOCKED", "RESOLVED"] },
        },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          episodeId: true,
          type: true,
          prompt: true,
          options: true,
          correctOption: true,
          status: true,
          predictions: {
            select: { chosenOption: true },
          },
        },
      }),
    ]);

    const qCountMap = new Map(questionCounts.map((q) => [q.episodeId, q._count.id]));

    const topQuestionByEpisode = new Map<string, typeof topQuestions[0]>();
    for (const q of topQuestions) {
      if (!topQuestionByEpisode.has(q.episodeId)) {
        topQuestionByEpisode.set(q.episodeId, q);
      }
    }

    for (const episode of season.episodes) {
      const questionCount = qCountMap.get(episode.id) ?? 0;
      if (questionCount === 0 && episode.status === "DRAFT") continue;

      const status = mapStatus(episode.status, episode.lockAt);
      const lockMs = episode.lockAt.getTime() - Date.now();

      const tq = topQuestionByEpisode.get(episode.id);
      let topQuestion: MarketData["topQuestion"] = undefined;

      if (tq) {
        const opts = (tq.options as string[]) || [];
        const total = tq.predictions.length;
        const communityPicks: Record<string, number> = {};
        if (total > 0) {
          const counts: Record<string, number> = {};
          for (const p of tq.predictions) {
            counts[p.chosenOption] = (counts[p.chosenOption] || 0) + 1;
          }
          for (const opt of opts) {
            communityPicks[opt] = Math.round(((counts[opt] || 0) / total) * 100);
          }
        }

        topQuestion = {
          prompt: tq.prompt,
          type: tq.type,
          options: opts,
          communityPicks,
          correctOption: tq.correctOption,
        };
      }

      markets.push({
        id: episode.id,
        emoji,
        showName: showLabel,
        showSlug: showSlug ?? undefined,
        showNetwork: showInfo?.network,
        showAccent: showInfo?.accent,
        episode: `EP${episode.number}`,
        episodeTitle: episode.title,
        questions: questionCount,
        participants: playerCounts.get(episode.id) ?? 0,
        predictions: predictionCounts.get(episode.id) ?? 0,
        lockAt: episode.lockAt.toISOString(),
        airAt: episode.airAt.toISOString(),
        hoursUntilLock: lockMs > 0 ? lockMs / 3_600_000 : 0,
        status,
        href: `/dashboard?episode=${episode.id}`,
        seasonId: season.id,
        topQuestion,
        contestantImages: contestantImageMap,
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
      pointsToNextRank: null,
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
