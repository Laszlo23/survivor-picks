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

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export async function updateProfile(updates: {
  name?: string;
  image?: string;
  username?: string;
  bio?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialTiktok?: string;
  socialFarcaster?: string;
  socialWebsite?: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data: Record<string, string | null> = {};

  if (typeof updates.name === "string") {
    const trimmed = updates.name.trim();
    if (trimmed.length > 0 && trimmed.length <= 50) data.name = trimmed;
  }

  if (typeof updates.image === "string") {
    const url = updates.image.trim();
    if (url.length === 0) data.image = null;
    else if (url.startsWith("http") && url.length <= 500) data.image = url;
  }

  if (typeof updates.username === "string") {
    const u = updates.username.trim().toLowerCase();
    if (u.length === 0) {
      data.username = null;
    } else if (!USERNAME_RE.test(u)) {
      throw new Error("Username must be 3-20 characters, letters/numbers/underscores only");
    } else {
      const existing = await prisma.user.findUnique({ where: { username: u } });
      if (existing && existing.id !== session.user.id) {
        throw new Error("Username is already taken");
      }
      data.username = u;
    }
  }

  if (typeof updates.bio === "string") {
    const bio = updates.bio.trim();
    if (bio.length > 160) throw new Error("Bio must be 160 characters or less");
    data.bio = bio.length === 0 ? null : bio;
  }

  const socialFields = ["socialTwitter", "socialInstagram", "socialTiktok", "socialFarcaster", "socialWebsite"] as const;
  for (const field of socialFields) {
    if (typeof updates[field] === "string") {
      const val = updates[field]!.trim();
      data[field] = val.length === 0 ? null : val.slice(0, 200);
    }
  }

  if (Object.keys(data).length === 0) throw new Error("No valid updates");

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  });
  return { success: true };
}

export async function getProfileStats() {
  try {
    const session = await getSession();
    if (!session?.user?.id) return null;
    const userId = session.user.id;

    const [allStats, totalPredictions, picksEarned, picksSpent, joinedAt] = await Promise.all([
      prisma.userSeasonStats.findMany({
        where: { userId },
        include: { season: true },
      }),
      prisma.prediction.count({ where: { userId } }),
      prisma.tokenTransaction.aggregate({
        where: { userId, amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      prisma.tokenTransaction.aggregate({
        where: { userId, amount: { lt: 0 } },
        _sum: { amount: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
    ]);

    const totalPoints = allStats.reduce((sum, s) => sum + s.points, 0);
    const totalCorrect = allStats.reduce((sum, s) => sum + s.correctCount, 0);
    const totalCount = allStats.reduce((sum, s) => sum + s.totalCount, 0);
    const overallWinRate = totalCount > 0 ? totalCorrect / totalCount : 0;
    const bestStreak = Math.max(0, ...allStats.map((s) => s.longestStreak));
    const seasonsPlayed = allStats.length;

    return {
      totalPoints,
      totalCorrect,
      totalPredictions,
      overallWinRate,
      bestStreak,
      seasonsPlayed,
      totalPicksEarned: String(picksEarned._sum.amount ?? 0),
      totalPicksSpent: String(picksSpent._sum.amount ?? 0),
      memberSince: joinedAt?.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getBettingHistory(limit = 20, offset = 0, filter?: "won" | "lost" | "pending") {
  try {
    const session = await getSession();
    if (!session?.user?.id) return { predictions: [], total: 0 };

    const where: Record<string, unknown> = { userId: session.user.id };
    if (filter === "won") where.isCorrect = true;
    else if (filter === "lost") where.isCorrect = false;
    else if (filter === "pending") where.isCorrect = null;

    const [predictions, total] = await Promise.all([
      prisma.prediction.findMany({
        where,
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
        skip: offset,
      }),
      prisma.prediction.count({ where }),
    ]);

    return { predictions, total };
  } catch {
    return { predictions: [], total: 0 };
  }
}

export async function getTransactionHistory(limit = 20, offset = 0, filter?: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) return { transactions: [], total: 0 };

    const where: Record<string, unknown> = { userId: session.user.id };
    if (filter && filter !== "all") where.type = filter;

    const [transactions, total] = await Promise.all([
      prisma.tokenTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.tokenTransaction.count({ where }),
    ]);

    return {
      transactions: transactions.map((tx) => ({
        id: tx.id,
        amount: String(tx.amount),
        type: tx.type,
        note: tx.note,
        createdAt: tx.createdAt.toISOString(),
      })),
      total,
    };
  } catch {
    return { transactions: [], total: 0 };
  }
}

export async function checkUsername(username: string) {
  const u = username.trim().toLowerCase();
  if (!USERNAME_RE.test(u)) {
    return { available: false, reason: "Must be 3-20 chars, letters/numbers/underscores" };
  }
  const existing = await prisma.user.findUnique({ where: { username: u } });
  const session = await getSession();
  if (existing && existing.id !== session?.user?.id) {
    return { available: false, reason: "Already taken" };
  }
  return { available: true };
}

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
