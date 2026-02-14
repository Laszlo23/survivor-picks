/**
 * Result Verification Agent
 *
 * Searches the web for aired episode results and resolves predictions
 * automatically when confidence is high enough.
 */

import { prisma } from "@/lib/prisma";
import { searchMultiple } from "./search";
import { extractVerificationResults, type VerificationResult } from "./llm";
import { getShowConfig } from "./shows";
import {
  calculatePickPoints,
  calculateStreak,
  calculateWinRate,
} from "@/lib/scoring";
import { revalidatePath } from "next/cache";

// ─── Types ───────────────────────────────────────────────────────────

export interface VerifyResult {
  episodeId: string;
  episodeTitle: string;
  status: "auto_resolved" | "needs_review" | "no_results" | "already_resolved" | "error";
  results: VerificationResult[];
  averageConfidence: number;
  message: string;
}

// ─── Confidence threshold for auto-resolution ────────────────────────
const AUTO_RESOLVE_THRESHOLD = 0.9;

// ─── Main Verification Flow ──────────────────────────────────────────

/**
 * Verify results for all aired-but-unresolved episodes.
 * Returns a report for each processed episode.
 */
export async function verifyAllPending(): Promise<VerifyResult[]> {
  const now = new Date();

  // Find episodes that have aired (airAt < now) but aren't resolved
  const episodes = await prisma.episode.findMany({
    where: {
      status: "LOCKED",
      airAt: { lt: now },
    },
    include: {
      questions: {
        where: { status: { not: "RESOLVED" } },
        select: {
          id: true,
          prompt: true,
          options: true,
          type: true,
        },
      },
      season: {
        select: {
          id: true,
          title: true,
          showSlug: true,
        },
      },
    },
    orderBy: { airAt: "asc" },
  });

  if (episodes.length === 0) {
    return [];
  }

  const results: VerifyResult[] = [];

  for (const episode of episodes) {
    try {
      const result = await verifyEpisode(episode);
      results.push(result);
    } catch (error: any) {
      results.push({
        episodeId: episode.id,
        episodeTitle: episode.title,
        status: "error",
        results: [],
        averageConfidence: 0,
        message: error.message || "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Verify a single episode's results.
 */
export async function verifyEpisode(episode: {
  id: string;
  title: string;
  number: number;
  questions: { id: string; prompt: string; options: unknown; type: string }[];
  season: { id: string; title: string; showSlug: string | null };
}): Promise<VerifyResult> {
  if (episode.questions.length === 0) {
    return {
      episodeId: episode.id,
      episodeTitle: episode.title,
      status: "already_resolved",
      results: [],
      averageConfidence: 1,
      message: "All questions already resolved",
    };
  }

  // Get show config for search terms
  const showConfig = episode.season.showSlug
    ? getShowConfig(episode.season.showSlug)
    : null;

  // Build search queries
  const searchTerms = showConfig?.searchTerms || [episode.season.title];
  const queries = searchTerms.map(
    (term) => `${term} Episode ${episode.number} results`
  );
  // Add specific queries for each question type
  const questionTypes = [...new Set(episode.questions.map((q) => q.type))];
  for (const type of questionTypes) {
    const termMap: Record<string, string> = {
      ELIMINATION: "who was eliminated voted out",
      IMMUNITY: "who won immunity",
      CHALLENGE_WINNER: "who won the challenge",
      REWARD: "who won the reward",
      TWIST: "twist surprise idol",
      TRIBAL_COUNCIL: "tribal council votes",
    };
    if (termMap[type]) {
      queries.push(
        `${searchTerms[0]} Episode ${episode.number} ${termMap[type]}`
      );
    }
  }

  // Search the web
  const searchResponse = await searchMultiple(queries, {
    maxResults: 8,
    includeDomains: [
      "en.wikipedia.org",
      "ew.com",
      "tvline.com",
      "reddit.com",
      "realityblurred.com",
    ],
  });

  if (searchResponse.results.length === 0) {
    return {
      episodeId: episode.id,
      episodeTitle: episode.title,
      status: "no_results",
      results: [],
      averageConfidence: 0,
      message: "No web results found. Episode may not have aired yet.",
    };
  }

  // Build content for LLM
  const searchContent = searchResponse.results
    .map((r) => `[${r.title}](${r.url})\n${r.content}`)
    .join("\n\n---\n\n");

  // Add Tavily's answer if available
  const fullContent = searchResponse.answer
    ? `AI Summary: ${searchResponse.answer}\n\n---\n\n${searchContent}`
    : searchContent;

  // Prepare questions for LLM
  const questionsForLLM = episode.questions.map((q) => ({
    id: q.id,
    prompt: q.prompt,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
  }));

  const showContext = showConfig?.rulesContext || episode.season.title;

  // Extract verification results via LLM
  const verificationResults = await extractVerificationResults(
    fullContent,
    questionsForLLM,
    showContext
  );

  // Calculate average confidence
  const avgConfidence =
    verificationResults.length > 0
      ? verificationResults.reduce((sum, r) => sum + r.confidence, 0) /
        verificationResults.length
      : 0;

  // Decide: auto-resolve or flag for review
  const allHighConfidence = verificationResults.every(
    (r) => r.confidence >= AUTO_RESOLVE_THRESHOLD
  );

  if (allHighConfidence && verificationResults.length > 0) {
    // Auto-resolve
    await agentResolveEpisode(
      episode.id,
      episode.season.id,
      verificationResults.map((r) => ({
        questionId: r.questionId,
        correctOption: r.correctOption,
      }))
    );

    return {
      episodeId: episode.id,
      episodeTitle: episode.title,
      status: "auto_resolved",
      results: verificationResults,
      averageConfidence: avgConfidence,
      message: `Auto-resolved ${verificationResults.length} questions with ${(avgConfidence * 100).toFixed(0)}% avg confidence`,
    };
  }

  return {
    episodeId: episode.id,
    episodeTitle: episode.title,
    status: "needs_review",
    results: verificationResults,
    averageConfidence: avgConfidence,
    message: `${verificationResults.filter((r) => r.confidence < AUTO_RESOLVE_THRESHOLD).length} questions below confidence threshold`,
  };
}

// ─── Agent Resolution (bypasses admin session) ───────────────────────

/**
 * Resolve an episode's predictions. This is the agent version that
 * does not require an admin session — it's protected by API key instead.
 */
async function agentResolveEpisode(
  episodeId: string,
  seasonId: string,
  resolutions: { questionId: string; correctOption: string }[]
) {
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: { questions: true },
  });

  if (!episode) throw new Error("Episode not found");
  if (episode.status === "RESOLVED") return;

  await prisma.$transaction(async (tx) => {
    // 1. Set correct options on questions
    for (const res of resolutions) {
      await tx.question.update({
        where: { id: res.questionId },
        data: {
          correctOption: res.correctOption,
          status: "RESOLVED",
        },
      });
    }

    // 2. Get all predictions for this episode
    const predictions = await tx.prediction.findMany({
      where: {
        question: { episodeId },
        pointsAwarded: null,
      },
      include: { question: true },
    });

    // 3. Build resolution map
    const resolutionMap = new Map<string, string>();
    for (const res of resolutions) {
      resolutionMap.set(res.questionId, res.correctOption);
    }

    // 4. Score each prediction
    const userPoints = new Map<string, number>();

    for (const pred of predictions) {
      const correct = resolutionMap.get(pred.questionId);
      if (!correct) continue;

      const isCorrect = pred.chosenOption === correct;
      const { points } = calculatePickPoints({
        isCorrect,
        odds: pred.question.odds,
        isRisk: pred.isRisk,
        usedJoker: pred.usedJoker,
      });

      await tx.prediction.update({
        where: { id: pred.id },
        data: {
          isCorrect,
          pointsAwarded: points,
        },
      });

      await tx.scoreEvent.create({
        data: {
          userId: pred.userId,
          episodeId,
          points,
          reason: isCorrect
            ? pred.isRisk
              ? "risk_bonus"
              : "correct_pick"
            : pred.usedJoker
              ? "joker_save"
              : "wrong_pick",
        },
      });

      userPoints.set(
        pred.userId,
        (userPoints.get(pred.userId) || 0) + points
      );
    }

    // 5. Update user stats
    for (const [userId, points] of userPoints) {
      const userPreds = predictions.filter((p) => p.userId === userId);
      const correctCount = userPreds.filter(
        (p) => p.chosenOption === resolutionMap.get(p.questionId)
      ).length;
      const riskBets = userPreds.filter((p) => p.isRisk);
      const riskWins = riskBets.filter(
        (p) => p.chosenOption === resolutionMap.get(p.questionId)
      ).length;
      const jokersUsed = userPreds.filter((p) => p.usedJoker).length;

      const existing = await tx.userSeasonStats.findUnique({
        where: { userId_seasonId: { userId, seasonId } },
      });

      const newCorrect = (existing?.correctCount || 0) + correctCount;
      const newTotal = (existing?.totalCount || 0) + userPreds.length;

      await tx.userSeasonStats.upsert({
        where: { userId_seasonId: { userId, seasonId } },
        create: {
          userId,
          seasonId,
          points,
          correctCount,
          totalCount: userPreds.length,
          currentStreak: calculateStreak(0, correctCount > 0).newStreak,
          longestStreak: calculateStreak(0, correctCount > 0).newStreak,
          winRate: calculateWinRate(correctCount, userPreds.length),
          riskBetsWon: riskWins,
          riskBetsTotal: riskBets.length,
          jokersUsed,
        },
        update: {
          points: { increment: points },
          correctCount: { increment: correctCount },
          totalCount: { increment: userPreds.length },
          currentStreak: calculateStreak(
            existing?.currentStreak || 0,
            correctCount > 0
          ).newStreak,
          longestStreak: Math.max(
            existing?.longestStreak || 0,
            calculateStreak(existing?.currentStreak || 0, correctCount > 0).newStreak
          ),
          winRate: calculateWinRate(newCorrect, newTotal),
          riskBetsWon: { increment: riskWins },
          riskBetsTotal: { increment: riskBets.length },
          jokersUsed: { increment: jokersUsed },
        },
      });
    }

    // 6. Mark episode as resolved
    await tx.episode.update({
      where: { id: episodeId },
      data: { status: "RESOLVED" },
    });
  });

  // Revalidate cached pages
  try {
    revalidatePath("/admin");
    revalidatePath("/leaderboard");
    revalidatePath("/dashboard");
  } catch {
    // revalidatePath may fail outside of request context (cron)
  }
}
