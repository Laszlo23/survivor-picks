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

    const [rank, totalPlayers, top10Entry] = await Promise.all([
      prisma.userSeasonStats.count({
        where: {
          seasonId,
          points: { gt: stats.points },
        },
      }),
      prisma.userSeasonStats.count({
        where: { seasonId },
      }),
      prisma.userSeasonStats.findFirst({
        where: { seasonId },
        orderBy: { points: "desc" },
        skip: 9,
        select: { points: true },
      }),
    ]);

    return {
      ...stats,
      rank: rank + 1,
      totalPlayers,
      top10Points: top10Entry?.points ?? 0,
    };
  } catch {
    return null;
  }
}

/**
 * Update the current user's profile (name, avatar).
 */
export async function updateProfile(updates: { name?: string; image?: string }) {
  try {
    const session = await getSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const data: { name?: string; image?: string | null } = {};
    if (typeof updates.name === "string") {
      const trimmed = updates.name.trim();
      if (trimmed.length > 0 && trimmed.length <= 50) data.name = trimmed;
    }
    if (typeof updates.image === "string") {
      const url = updates.image.trim();
      if (url.length === 0) data.image = null;
      else if (url.startsWith("http") && url.length <= 500) data.image = url;
    }

    if (Object.keys(data).length === 0) throw new Error("No valid updates");

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    });
    return { success: true };
  } catch (err) {
    throw err;
  }
}

/**
 * Mark the current user as having completed onboarding.
 */
export async function completeOnboarding() {
  try {
    const session = await getSession();
    if (!session?.user?.id) return { success: false };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { hasOnboarded: true },
    });

    return { success: true };
  } catch {
    return { success: false };
  }
}
