"use server";

import { prisma } from "@/lib/prisma";

export async function getLeaderboard(params: {
  seasonId: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { seasonId, page = 1, limit = 20, search } = params;
  const skip = (page - 1) * limit;

  const where = {
    seasonId,
    ...(search
      ? {
          user: {
            name: { contains: search, mode: "insensitive" as const },
          },
        }
      : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.userSeasonStats.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { points: "desc" },
      skip,
      take: limit,
    }),
    prisma.userSeasonStats.count({ where }),
  ]);

  // Add rank numbers
  const ranked = entries.map((entry, index) => ({
    ...entry,
    rank: skip + index + 1,
  }));

  return {
    entries: ranked,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getTopLeaderboard(seasonId: string, limit = 10) {
  try {
    const entries = await prisma.userSeasonStats.findMany({
      where: { seasonId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { points: "desc" },
      take: limit,
    });

    return entries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  } catch {
    return [];
  }
}
