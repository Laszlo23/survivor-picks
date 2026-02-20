"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createPredictionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { debitBalance } from "@/lib/actions/token-balance";

export async function createPrediction(input: {
  questionId: string;
  chosenOption: string;
  isRisk: boolean;
  useJoker: boolean;
  stakeAmount?: string;
  txHash?: string;
  useInternalBalance?: boolean;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validated = createPredictionSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.message };
  }

  const { questionId, chosenOption, isRisk, useJoker, stakeAmount, txHash } = validated.data;
  const useInternalBalance = input.useInternalBalance ?? false;

  // Fetch question with episode
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { episode: { include: { season: true } } },
  });

  if (!question) return { error: "Question not found" };
  if (question.status === "LOCKED" || question.status === "RESOLVED") {
    return { error: "This question is locked" };
  }
  if (question.episode.status === "LOCKED" || question.episode.status === "RESOLVED") {
    return { error: "This episode is locked" };
  }

  // Check lock time
  if (new Date() >= new Date(question.episode.lockAt)) {
    return { error: "Predictions are locked for this episode" };
  }

  // Validate option is in allowed options
  const options = question.options as string[];
  if (!options.includes(chosenOption)) {
    return { error: "Invalid option" };
  }

  // Check joker availability
  if (useJoker) {
    if (isRisk) {
      return { error: "Cannot use Immunity Joker on a Risk Bet" };
    }

    const stats = await prisma.userSeasonStats.findUnique({
      where: {
        userId_seasonId: {
          userId: session.user.id,
          seasonId: question.episode.seasonId,
        },
      },
    });

    if (!stats || stats.jokersRemaining <= 0) {
      return { error: "No Immunity Jokers remaining" };
    }
  }

  // Upsert prediction (allow changing before lock)
  const existing = await prisma.prediction.findUnique({
    where: {
      userId_questionId: {
        userId: session.user.id,
        questionId,
      },
    },
  });

  try {
    if (useInternalBalance && stakeAmount && parseFloat(stakeAmount) > 0) {
      const amount = BigInt(Math.floor(parseFloat(stakeAmount)));
      await debitBalance(
        session.user.id,
        amount,
        "staking",
        `Staked ${stakeAmount} $PICKS on prediction`
      );
    }

    if (existing) {
      await prisma.prediction.update({
        where: { id: existing.id },
        data: {
          chosenOption,
          isRisk,
          usedJoker: useJoker,
          ...(stakeAmount && { stakeAmount }),
          ...(txHash && { txHash }),
        },
      });
    } else {
      await prisma.prediction.create({
        data: {
          userId: session.user.id,
          questionId,
          chosenOption,
          isRisk,
          usedJoker: useJoker,
          stakeAmount: stakeAmount || null,
          txHash: txHash || null,
        },
      });
    }

    // Ensure UserSeasonStats exists
    await prisma.userSeasonStats.upsert({
      where: {
        userId_seasonId: {
          userId: session.user.id,
          seasonId: question.episode.seasonId,
        },
      },
      create: {
        userId: session.user.id,
        seasonId: question.episode.seasonId,
      },
      update: {},
    });

    revalidatePath(`/season/${question.episode.seasonId}/episode/${question.episodeId}`);
    revalidatePath("/dashboard");

    return { success: true };
  } catch {
    return { error: "Failed to save prediction" };
  }
}

export async function getUserPredictions(episodeId: string) {
  const session = await getSession();
  if (!session?.user?.id) return [];

  return prisma.prediction.findMany({
    where: {
      userId: session.user.id,
      question: { episodeId },
    },
    include: { question: true },
  });
}

// ─── Community Pick Distribution ─────────────────────────────────────

export interface CommunityPicks {
  /** questionId -> { option -> percentage (0-100) } */
  [questionId: string]: Record<string, number>;
}

/**
 * Get community pick distribution for a list of question IDs.
 * Returns percentage of picks per option for each question.
 */
export async function getCommunityPicks(
  questionIds: string[]
): Promise<CommunityPicks> {
  if (questionIds.length === 0) return {};

  const counts = await prisma.prediction.groupBy({
    by: ["questionId", "chosenOption"],
    where: { questionId: { in: questionIds } },
    _count: { id: true },
  });

  // Build totals per question
  const totals: Record<string, number> = {};
  for (const row of counts) {
    totals[row.questionId] = (totals[row.questionId] || 0) + row._count.id;
  }

  // Build percentages
  const result: CommunityPicks = {};
  for (const row of counts) {
    if (!result[row.questionId]) result[row.questionId] = {};
    const total = totals[row.questionId] || 1;
    result[row.questionId][row.chosenOption] = Math.round(
      (row._count.id / total) * 100
    );
  }

  return result;
}

// ─── Show Prediction Feed ────────────────────────────────────────────

export interface FeedQuestion {
  id: string;
  type: string;
  prompt: string;
  odds: number;
  options: string[];
  correctOption: string | null;
  status: string;
  sortOrder: number;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  lockAt: string;
  communityPicks: Record<string, number>;
  userPick?: {
    chosenOption: string;
    isRisk: boolean;
    usedJoker: boolean;
    isCorrect: boolean | null;
    pointsAwarded: number | null;
  };
}

/**
 * Get all open/active questions for a season's current episode(s),
 * with community pick distribution and the current user's picks.
 */
export async function getShowPredictions(
  seasonId: string
): Promise<FeedQuestion[]> {
  const session = await getSession();

  // Fetch open + locked episodes (so users can see recently locked ones too)
  const episodes = await prisma.episode.findMany({
    where: {
      seasonId,
      status: { in: ["OPEN", "LOCKED"] },
    },
    include: {
      questions: {
        where: { status: { in: ["OPEN", "LOCKED", "RESOLVED"] } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { number: "asc" },
  });

  const allQuestions = episodes.flatMap((ep) =>
    ep.questions.map((q) => ({
      ...q,
      episodeId: ep.id,
      episodeNumber: ep.number,
      episodeTitle: ep.title,
      lockAt: ep.lockAt.toISOString(),
    }))
  );

  if (allQuestions.length === 0) return [];

  // Get community picks
  const questionIds = allQuestions.map((q) => q.id);
  const community = await getCommunityPicks(questionIds);

  // Get user predictions
  let userPredictions: Record<
    string,
    {
      chosenOption: string;
      isRisk: boolean;
      usedJoker: boolean;
      isCorrect: boolean | null;
      pointsAwarded: number | null;
    }
  > = {};

  if (session?.user?.id) {
    const preds = await prisma.prediction.findMany({
      where: {
        userId: session.user.id,
        questionId: { in: questionIds },
      },
    });
    for (const p of preds) {
      userPredictions[p.questionId] = {
        chosenOption: p.chosenOption,
        isRisk: p.isRisk,
        usedJoker: p.usedJoker,
        isCorrect: p.isCorrect,
        pointsAwarded: p.pointsAwarded,
      };
    }
  }

  return allQuestions.map((q) => ({
    id: q.id,
    type: q.type,
    prompt: q.prompt,
    odds: q.odds,
    options: q.options as string[],
    correctOption: q.correctOption,
    status: q.status,
    sortOrder: q.sortOrder,
    episodeId: q.episodeId,
    episodeNumber: q.episodeNumber,
    episodeTitle: q.episodeTitle,
    lockAt: q.lockAt,
    communityPicks: community[q.id] || {},
    userPick: userPredictions[q.id],
  }));
}
