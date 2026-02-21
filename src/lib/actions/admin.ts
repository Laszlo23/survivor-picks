"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  calculatePickPoints,
  calculateStreak,
  calculateWinRate,
} from "@/lib/scoring";
import { revalidatePath } from "next/cache";

async function requireAdminSession() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.role !== "ADMIN") throw new Error("Forbidden");
  return user;
}

// ─── Seasons ──────────────────────────────────────────────────────────────────

export async function createSeason(data: {
  title: string;
  description?: string;
  active?: boolean;
  showSlug?: string;
}) {
  await requireAdminSession();
  const season = await prisma.season.create({ data });
  revalidatePath("/admin");
  return season;
}

export async function updateSeason(
  id: string,
  data: { title?: string; description?: string; active?: boolean; showSlug?: string }
) {
  await requireAdminSession();
  const season = await prisma.season.update({ where: { id }, data });
  revalidatePath("/admin");
  return season;
}

export async function deleteSeason(id: string) {
  await requireAdminSession();
  await prisma.season.delete({ where: { id } });
  revalidatePath("/admin");
}

// ─── Episodes ─────────────────────────────────────────────────────────────────

export async function createEpisode(data: {
  seasonId: string;
  number: number;
  title: string;
  airAt: string;
  lockAt: string;
}) {
  await requireAdminSession();
  const episode = await prisma.episode.create({
    data: {
      ...data,
      airAt: new Date(data.airAt),
      lockAt: new Date(data.lockAt),
    },
  });
  revalidatePath("/admin");
  return episode;
}

export async function updateEpisode(
  id: string,
  data: {
    title?: string;
    airAt?: string;
    lockAt?: string;
    status?: "DRAFT" | "OPEN" | "LOCKED" | "RESOLVED";
  }
) {
  await requireAdminSession();
  const updateData: Record<string, unknown> = {};
  if (data.title) updateData.title = data.title;
  if (data.airAt) updateData.airAt = new Date(data.airAt);
  if (data.lockAt) updateData.lockAt = new Date(data.lockAt);
  if (data.status) updateData.status = data.status;

  const episode = await prisma.episode.update({ where: { id }, data: updateData });
  revalidatePath("/admin");
  return episode;
}

export async function deleteEpisode(id: string) {
  await requireAdminSession();
  await prisma.episode.delete({ where: { id } });
  revalidatePath("/admin");
}

// ─── Questions ────────────────────────────────────────────────────────────────

export async function createQuestion(data: {
  episodeId: string;
  type: string;
  prompt: string;
  odds: number;
  options: string[];
  sortOrder?: number;
}) {
  await requireAdminSession();
  const question = await prisma.question.create({
    data: {
      episodeId: data.episodeId,
      type: data.type as any,
      prompt: data.prompt,
      odds: data.odds,
      options: data.options,
      sortOrder: data.sortOrder || 0,
      status: "OPEN",
    },
  });
  revalidatePath("/admin");
  return question;
}

export async function updateQuestion(
  id: string,
  data: {
    prompt?: string;
    odds?: number;
    options?: string[];
    correctOption?: string;
    status?: string;
  }
) {
  await requireAdminSession();
  const question = await prisma.question.update({ where: { id }, data: data as any });
  revalidatePath("/admin");
  return question;
}

export async function deleteQuestion(id: string) {
  await requireAdminSession();
  await prisma.question.delete({ where: { id } });
  revalidatePath("/admin");
}

// ─── Contestants ──────────────────────────────────────────────────────────────

export async function createContestant(data: {
  name: string;
  seasonId: string;
  tribeId?: string;
  imageUrl?: string;
}) {
  await requireAdminSession();
  const contestant = await prisma.contestant.create({ data });
  revalidatePath("/admin");
  return contestant;
}

export async function updateContestant(
  id: string,
  data: { name?: string; status?: string; tribeId?: string | null; imageUrl?: string | null }
) {
  await requireAdminSession();
  const contestant = await prisma.contestant.update({ where: { id }, data });
  revalidatePath("/admin");
  return contestant;
}

export async function eliminateContestant(id: string) {
  await requireAdminSession();
  const contestant = await prisma.contestant.update({
    where: { id },
    data: { status: "ELIMINATED" },
  });
  revalidatePath("/admin");
  return contestant;
}

export async function reinstateContestant(id: string) {
  await requireAdminSession();
  const contestant = await prisma.contestant.update({
    where: { id },
    data: { status: "ACTIVE" },
  });
  revalidatePath("/admin");
  return contestant;
}

export async function deleteContestant(id: string) {
  await requireAdminSession();
  await prisma.contestant.delete({ where: { id } });
  revalidatePath("/admin");
}

// ─── Tribes ───────────────────────────────────────────────────────────────────

export async function createTribe(data: {
  name: string;
  color: string;
  seasonId: string;
}) {
  await requireAdminSession();
  const tribe = await prisma.tribe.create({ data });
  revalidatePath("/admin");
  return tribe;
}

export async function updateTribe(
  id: string,
  data: { name?: string; color?: string }
) {
  await requireAdminSession();
  const tribe = await prisma.tribe.update({ where: { id }, data });
  revalidatePath("/admin");
  return tribe;
}

export async function deleteTribe(id: string) {
  await requireAdminSession();
  await prisma.tribe.delete({ where: { id } });
  revalidatePath("/admin");
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getAdminStats() {
  await requireAdminSession();

  const [userCount, predictionCount, activeSeasons, totalPoints] =
    await Promise.all([
      prisma.user.count(),
      prisma.prediction.count(),
      prisma.season.count({ where: { active: true } }),
      prisma.userSeasonStats.aggregate({ _sum: { points: true } }),
    ]);

  return {
    userCount,
    predictionCount,
    activeSeasons,
    totalPoints: totalPoints._sum.points || 0,
  };
}

// ─── Resolve Episode ──────────────────────────────────────────────────────────

export async function resolveEpisode(
  episodeId: string,
  resolutions: { questionId: string; correctOption: string }[]
) {
  await requireAdminSession();

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    include: { questions: true },
  });

  if (!episode) throw new Error("Episode not found");
  if (episode.status === "RESOLVED") {
    return { message: "Episode already resolved" };
  }

  // Run resolution in a transaction
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
    const questionIds = resolutions.map((r) => r.questionId);
    const predictions = await tx.prediction.findMany({
      where: { questionId: { in: questionIds } },
      include: { question: true },
    });

    // 3. Build resolution map
    const correctMap = new Map(resolutions.map((r) => [r.questionId, r.correctOption]));

    // 4. Group predictions by user
    const userPredictions = new Map<string, typeof predictions>();
    for (const pred of predictions) {
      const existing = userPredictions.get(pred.userId) || [];
      existing.push(pred);
      userPredictions.set(pred.userId, existing);
    }

    // 5. Score each user — batch prediction updates and score events
    for (const [userId, preds] of userPredictions) {
      let episodePoints = 0;
      let correctInEpisode = 0;
      let totalInEpisode = preds.length;
      let riskWon = 0;
      let riskTotal = 0;
      let jokersUsed = 0;

      // Collect all DB writes for this user and execute in parallel
      const predUpdates: Promise<unknown>[] = [];
      const scoreCreates: Promise<unknown>[] = [];

      for (const pred of preds) {
        const correct = correctMap.get(pred.questionId);
        const isCorrect = pred.chosenOption === correct;

        const result = calculatePickPoints({
          isCorrect,
          odds: pred.question.odds,
          isRisk: pred.isRisk,
          usedJoker: pred.usedJoker,
        });

        // Batch prediction update
        predUpdates.push(
          tx.prediction.update({
            where: { id: pred.id },
            data: {
              isCorrect,
              pointsAwarded: result.points,
            },
          })
        );

        episodePoints += result.points;

        if (isCorrect) correctInEpisode++;
        if (pred.isRisk) {
          riskTotal++;
          if (isCorrect) riskWon++;
        }
        if (pred.usedJoker) jokersUsed++;

        // Batch score event creation
        if (result.points > 0) {
          scoreCreates.push(
            tx.scoreEvent.create({
              data: {
                userId,
                episodeId,
                points: result.points,
                reason: result.breakdown.jokerSave
                  ? "joker_save"
                  : pred.isRisk
                  ? "risk_correct"
                  : "correct_pick",
              },
            })
          );
        }
      }

      // Execute all prediction updates and score events concurrently
      await Promise.all([...predUpdates, ...scoreCreates]);

      // 6. Update user season stats
      const existingStats = await tx.userSeasonStats.findUnique({
        where: {
          userId_seasonId: { userId, seasonId: episode.seasonId },
        },
      });

      const currentStreak = existingStats?.currentStreak || 0;
      const gotCorrect = correctInEpisode > 0;
      const { newStreak, bonusPoints } = calculateStreak(
        currentStreak,
        gotCorrect
      );

      // Award streak bonus
      if (bonusPoints > 0) {
        scoreCreates.push(
          tx.scoreEvent.create({
            data: {
              userId,
              episodeId,
              points: bonusPoints,
              reason: "streak_bonus",
            },
          })
        );
        await Promise.all(scoreCreates.slice(-1)); // execute streak bonus
        episodePoints += bonusPoints;
      }

      const newCorrect = (existingStats?.correctCount || 0) + correctInEpisode;
      const newTotal = (existingStats?.totalCount || 0) + totalInEpisode;

      await tx.userSeasonStats.upsert({
        where: {
          userId_seasonId: { userId, seasonId: episode.seasonId },
        },
        create: {
          userId,
          seasonId: episode.seasonId,
          points: episodePoints,
          correctCount: correctInEpisode,
          totalCount: totalInEpisode,
          currentStreak: newStreak,
          longestStreak: newStreak,
          winRate: calculateWinRate(correctInEpisode, totalInEpisode),
          riskBetsWon: riskWon,
          riskBetsTotal: riskTotal,
          jokersUsed,
          jokersRemaining: 3 - jokersUsed,
        },
        update: {
          points: { increment: episodePoints },
          correctCount: newCorrect,
          totalCount: newTotal,
          currentStreak: newStreak,
          longestStreak: Math.max(existingStats?.longestStreak || 0, newStreak),
          winRate: calculateWinRate(newCorrect, newTotal),
          riskBetsWon: { increment: riskWon },
          riskBetsTotal: { increment: riskTotal },
          jokersUsed: { increment: jokersUsed },
          jokersRemaining: { decrement: jokersUsed },
        },
      });
    }

    // 7. Mark episode as resolved
    await tx.episode.update({
      where: { id: episodeId },
      data: { status: "RESOLVED" },
    });
  });

  // Check badges after transaction
  await checkAndAwardBadges(episodeId);

  // Send Farcaster push notifications (non-blocking)
  try {
    const resolvedEpisode = await prisma.episode.findUnique({
      where: { id: episodeId },
      include: { season: true },
    });
    if (resolvedEpisode?.season) {
      const { notifyEpisodeResolved } = await import(
        "@/lib/farcaster/notifications"
      );
      // Fire-and-forget: don't block the response
      notifyEpisodeResolved(
        episodeId,
        resolvedEpisode.title,
        resolvedEpisode.season.showSlug || "survivor-2026"
      ).catch((e) =>
        console.warn("[Farcaster] Notification dispatch failed:", e)
      );
    }
  } catch {
    // Non-critical — don't break resolution if notifications fail
  }

  revalidatePath("/admin");
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { message: "Episode resolved successfully" };
}

// ─── Badge Check ──────────────────────────────────────────────────────────────

async function checkAndAwardBadges(episodeId: string) {
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
  });
  if (!episode) return;

  const badges = await prisma.badge.findMany();
  const allStats = await prisma.userSeasonStats.findMany({
    where: { seasonId: episode.seasonId },
  });

  // Batch all badge upserts and execute concurrently
  const badgeUpserts: Promise<unknown>[] = [];

  for (const stats of allStats) {
    for (const badge of badges) {
      const rules = badge.rules as { type: string; threshold: number };
      let qualified = false;

      switch (rules.type) {
        case "streak":
          qualified = stats.currentStreak >= rules.threshold;
          break;
        case "correct":
          qualified = stats.correctCount >= rules.threshold;
          break;
        case "risk_wins":
          qualified = stats.riskBetsWon >= rules.threshold;
          break;
        case "points":
          qualified = stats.points >= rules.threshold;
          break;
      }

      if (qualified) {
        badgeUpserts.push(
          prisma.userBadge.upsert({
            where: {
              userId_badgeId: {
                userId: stats.userId,
                badgeId: badge.id,
              },
            },
            create: {
              userId: stats.userId,
              badgeId: badge.id,
              progress: { current: getProgress(stats, rules), target: rules.threshold },
            },
            update: {
              progress: { current: getProgress(stats, rules), target: rules.threshold },
            },
          })
        );
      }
    }
  }

  // Execute all badge upserts concurrently
  await Promise.all(badgeUpserts);
}

function getProgress(
  stats: { currentStreak: number; correctCount: number; riskBetsWon: number; points: number },
  rules: { type: string; threshold: number }
): number {
  switch (rules.type) {
    case "streak": return stats.currentStreak;
    case "correct": return stats.correctCount;
    case "risk_wins": return stats.riskBetsWon;
    case "points": return stats.points;
    default: return 0;
  }
}

// ─── Admin Data Fetchers ──────────────────────────────────────────────────────

export async function getAdminSeasons() {
  await requireAdminSession();

  return prisma.season.findMany({
    include: {
      episodes: {
        include: { questions: true },
        orderBy: { number: "asc" },
      },
      tribes: true,
      contestants: { include: { tribe: true } },
      _count: { select: { episodes: true, seasonStats: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
