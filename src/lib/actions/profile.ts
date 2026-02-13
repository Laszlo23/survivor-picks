"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getUserProfile() {
  try {
    const session = await getSession();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        badges: {
          include: { badge: true },
        },
        seasonStats: {
          include: { season: true },
          orderBy: { points: "desc" },
        },
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function getUserRecentPredictions(limit = 20) {
  try {
    const session = await getSession();
    if (!session?.user?.id) return [];

    return await prisma.prediction.findMany({
      where: { userId: session.user.id },
      include: {
        question: {
          include: {
            episode: {
              include: { season: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getUserRank(seasonId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) return null;

    const stats = await prisma.userSeasonStats.findUnique({
      where: {
        userId_seasonId: {
          userId: session.user.id,
          seasonId,
        },
      },
    });

    if (!stats) return null;

    const rank = await prisma.userSeasonStats.count({
      where: {
        seasonId,
        points: { gt: stats.points },
      },
    });

    return {
      ...stats,
      rank: rank + 1,
    };
  } catch {
    return null;
  }
}
