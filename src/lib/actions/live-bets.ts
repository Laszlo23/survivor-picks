"use server";

import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/auth";
import {
  buildPoolState,
  calculateOdds,
  calculatePayout,
} from "@/lib/live/odds-engine";
import {
  publishOddsUpdate,
  publishBetResolved,
  publishToSession,
} from "@/lib/realtime/ably";
import { revalidatePath } from "next/cache";

// ─── Place a bet (user action) ──────────────────────────────────────────────

export async function placeLiveBet(data: {
  liveBetId: string;
  chosenOption: string;
  stakeAmount: string;
  txHash?: string;
}) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  // Fetch the bet with validation
  const bet = await prisma.liveBet.findUnique({
    where: { id: data.liveBetId },
    include: {
      session: { select: { id: true, status: true } },
      placements: {
        select: { chosenOption: true, stakeAmount: true, userId: true },
      },
    },
  });

  if (!bet) throw new Error("Bet not found");
  if (bet.status !== "open") throw new Error("Bet is no longer open");
  if (bet.session.status !== "live") throw new Error("Session is not live");

  // Check betting window
  if (new Date() > new Date(bet.locksAt)) {
    throw new Error("Betting window has closed");
  }

  // Validate option
  const options = bet.options as string[];
  if (!options.includes(data.chosenOption)) {
    throw new Error("Invalid option");
  }

  // Check if user already placed a bet
  const existing = bet.placements.find((p) => p.userId === userId);
  if (existing) throw new Error("You already placed a bet on this");

  // Create placement
  const placement = await prisma.liveBetPlacement.create({
    data: {
      userId,
      liveBetId: data.liveBetId,
      chosenOption: data.chosenOption,
      stakeAmount: data.stakeAmount || "0",
      txHash: data.txHash,
    },
  });

  // Recalculate odds
  const allPlacements = [
    ...bet.placements,
    { chosenOption: data.chosenOption, stakeAmount: data.stakeAmount },
  ];
  const pool = buildPoolState(options, allPlacements);
  const newOdds = calculateOdds(pool);
  const newTotal = pool.totalPool.toString();

  // Update bet with new odds and total
  await prisma.liveBet.update({
    where: { id: data.liveBetId },
    data: {
      odds: newOdds,
      totalPool: newTotal,
    },
  });

  // Push real-time updates
  await publishOddsUpdate(bet.session.id, bet.id, newOdds, newTotal);

  // Push ticker entry
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  await publishToSession(bet.session.id, "bet:placement", {
    id: placement.id,
    userName: user?.name || "Anon",
    option: data.chosenOption,
    amount: data.stakeAmount,
    odds: newOdds[data.chosenOption] || 2,
    timestamp: Date.now(),
  });

  return { success: true, placement };
}

// ─── Resolve a live bet ──────────────────────────────────────────────────────

export async function resolveLiveBet(
  betId: string,
  correctOption: string,
  sessionId?: string
) {
  // Fetch bet with all placements
  const bet = await prisma.liveBet.findUnique({
    where: { id: betId },
    include: {
      session: { select: { id: true } },
      placements: true,
    },
  });

  if (!bet) throw new Error("Bet not found");
  if (bet.status === "resolved") throw new Error("Already resolved");

  const options = bet.options as string[];
  if (!options.includes(correctOption)) {
    throw new Error("Invalid correct option");
  }

  const odds = bet.odds as Record<string, number>;
  const winOdds = odds[correctOption] || 2;

  // Calculate payouts for winners
  const payouts: Array<{ userId: string; amount: string }> = [];

  for (const placement of bet.placements) {
    const isCorrect = placement.chosenOption === correctOption;
    const stake = parseFloat(placement.stakeAmount) || 0;

    let payout = "0";
    if (isCorrect && stake > 0) {
      const payoutAmount = calculatePayout(stake, winOdds, bet.multiplier);
      payout = payoutAmount.toFixed(0);
      payouts.push({ userId: placement.userId, amount: payout });
    }

    await prisma.liveBetPlacement.update({
      where: { id: placement.id },
      data: {
        isCorrect,
        payout,
      },
    });
  }

  // Update bet status
  await prisma.liveBet.update({
    where: { id: betId },
    data: {
      status: "resolved",
      correctOption,
      resolvedAt: new Date(),
    },
  });

  // Push resolution to all clients
  const sid = sessionId || bet.session.id;
  await publishBetResolved(sid, betId, correctOption, payouts);

  revalidatePath(`/live/${sid}`);

  return { success: true, payouts };
}

// ─── Admin: Create a live bet manually ───────────────────────────────────────

export async function createLiveBetManual(data: {
  sessionId: string;
  prompt: string;
  category: string;
  options: string[];
  windowSeconds: number;
  multiplier?: number;
}) {
  await requireAdmin();

  const now = new Date();
  const locksAt = new Date(now.getTime() + data.windowSeconds * 1000);

  // Generate initial equal odds
  const initialOdds: Record<string, number> = {};
  for (const opt of data.options) {
    initialOdds[opt] = 2.0;
  }

  const bet = await prisma.liveBet.create({
    data: {
      sessionId: data.sessionId,
      prompt: data.prompt,
      category: data.category,
      options: data.options,
      odds: initialOdds,
      status: "open",
      opensAt: now,
      locksAt,
      multiplier: data.multiplier || 1,
    },
  });

  return bet;
}

// ─── Admin: Cancel a live bet ────────────────────────────────────────────────

export async function cancelLiveBet(betId: string) {
  await requireAdmin();

  await prisma.liveBet.update({
    where: { id: betId },
    data: { status: "cancelled" },
  });

  return { success: true };
}

// ─── Auto-lock expired bets (called by cron) ────────────────────────────────

export async function lockExpiredBets() {
  const now = new Date();

  const expired = await prisma.liveBet.updateMany({
    where: {
      status: "open",
      locksAt: { lte: now },
    },
    data: { status: "locked" },
  });

  return { locked: expired.count };
}
