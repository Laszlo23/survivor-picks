"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// ─── Public: Get a live session by ID ────────────────────────────────────────

export async function getLiveSession(sessionId: string) {
  return prisma.liveSession.findUnique({
    where: { id: sessionId },
    include: {
      episode: {
        include: {
          season: {
            include: { contestants: true },
          },
        },
      },
      bets: {
        where: { status: { in: ["open", "locked", "resolved"] } },
        include: {
          placements: { select: { userId: true, chosenOption: true, stakeAmount: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/** Get the currently live session (if any) */
export async function getActiveLiveSession() {
  return prisma.liveSession.findFirst({
    where: { status: "live" },
    include: {
      episode: {
        include: {
          season: {
            include: { contestants: true },
          },
        },
      },
      bets: {
        where: { status: { in: ["open", "locked", "resolved"] } },
        include: {
          placements: { select: { userId: true, chosenOption: true, stakeAmount: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// ─── Admin: Create a live session ────────────────────────────────────────────

export async function createLiveSession(data: {
  episodeId: string;
  streamUrl: string;
  streamType: string;
}) {
  await requireAdmin();

  return prisma.liveSession.create({
    data: {
      episodeId: data.episodeId,
      streamUrl: data.streamUrl,
      streamType: data.streamType,
      status: "scheduled",
    },
  });
}

// ─── Admin: Start a session ──────────────────────────────────────────────────

export async function startLiveSession(sessionId: string) {
  await requireAdmin();

  return prisma.liveSession.update({
    where: { id: sessionId },
    data: { status: "live", startedAt: new Date() },
  });
}

// ─── Admin: Pause a session ──────────────────────────────────────────────────

export async function pauseLiveSession(sessionId: string) {
  await requireAdmin();

  return prisma.liveSession.update({
    where: { id: sessionId },
    data: { status: "paused" },
  });
}

// ─── Admin: End a session ────────────────────────────────────────────────────

export async function endLiveSession(sessionId: string) {
  await requireAdmin();

  // Cancel any open bets
  await prisma.liveBet.updateMany({
    where: { sessionId, status: { in: ["pending", "open"] } },
    data: { status: "cancelled" },
  });

  return prisma.liveSession.update({
    where: { id: sessionId },
    data: { status: "ended", endedAt: new Date() },
  });
}

// ─── Admin: List sessions ────────────────────────────────────────────────────

export async function listLiveSessions() {
  await requireAdmin();

  return prisma.liveSession.findMany({
    include: {
      episode: {
        include: { season: { select: { title: true, showSlug: true } } },
      },
      _count: { select: { bets: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
