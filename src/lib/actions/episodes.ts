"use server";

import { prisma } from "@/lib/prisma";

export async function getActiveSeason() {
  try {
    return await prisma.season.findFirst({
      where: { active: true },
      include: {
        episodes: {
          orderBy: { number: "asc" },
        },
        tribes: true,
        contestants: {
          include: { tribe: true },
          orderBy: { name: "asc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getNextOpenEpisode(seasonId: string) {
  try {
    return await prisma.episode.findFirst({
      where: {
        seasonId,
        status: { in: ["OPEN", "DRAFT"] },
      },
      orderBy: { number: "asc" },
      include: {
        questions: {
          where: { status: { in: ["OPEN", "DRAFT"] } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function getEpisodeWithQuestions(episodeId: string) {
  try {
    return await prisma.episode.findUnique({
      where: { id: episodeId },
      include: {
        season: true,
        questions: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  } catch {
    return null;
  }
}

export async function listSeasonEpisodes(seasonId: string) {
  try {
    return await prisma.episode.findMany({
      where: { seasonId },
      orderBy: { number: "asc" },
      include: {
        questions: true,
      },
    });
  } catch {
    return [];
  }
}
