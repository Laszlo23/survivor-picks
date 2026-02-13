"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createPredictionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function createPrediction(input: {
  questionId: string;
  chosenOption: string;
  isRisk: boolean;
  useJoker: boolean;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const validated = createPredictionSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.message };
  }

  const { questionId, chosenOption, isRisk, useJoker } = validated.data;

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
    if (existing) {
      await prisma.prediction.update({
        where: { id: existing.id },
        data: {
          chosenOption,
          isRisk,
          usedJoker: useJoker,
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
