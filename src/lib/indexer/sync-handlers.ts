/**
 * Database sync handlers for on-chain events.
 *
 * CURRENT STATE (v1 — audit-only mode):
 * Events are logged to AgentLog with type "chain_event" for an audit trail.
 * Full bidirectional DB sync (writing predictions, updating balances, etc.)
 * is planned for Phase 2.
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { IndexedEvent } from "./event-indexer";

async function logChainEvent(
  eventType: string,
  event: IndexedEvent,
  extraData?: Record<string, unknown>,
) {
  try {
    await prisma.agentLog.create({
      data: {
        type: "chain_event",
        input: JSON.parse(JSON.stringify({
          eventType,
          blockNumber: event.blockNumber.toString(),
          transactionHash: event.transactionHash,
          ...event.data,
        })) as Prisma.InputJsonValue,
        output: JSON.parse(JSON.stringify(extraData ?? {})) as Prisma.InputJsonValue,
        status: "success",
        confidence: null,
      },
    });
  } catch (err) {
    console.error(`[Sync] Failed to log ${eventType} chain event:`, err);
  }
}

export async function handlePredictionMade(event: IndexedEvent) {
  const { user, questionId, amount, option, isRisk } = event.data;
  if (!user || !questionId) return;

  const walletAddress = (user as string).toLowerCase();
  const dbUser = await prisma.user.findUnique({ where: { walletAddress } });

  await logChainEvent("PredictionMade", event, {
    resolvedUser: dbUser?.email ?? null,
    wallet: walletAddress,
    questionId,
    amount: String(amount),
    option,
    isRisk,
  });
}

export async function handleQuestionResolved(event: IndexedEvent) {
  const { questionId, correctOption, totalPool, platformFee } = event.data;

  await logChainEvent("QuestionResolved", event, {
    questionId,
    correctOption,
    totalPool: String(totalPool),
    platformFee: String(platformFee),
  });
}

export async function handleRewardClaimed(event: IndexedEvent) {
  const { user, questionId, amount } = event.data;
  if (!user) return;

  const walletAddress = (user as string).toLowerCase();
  const dbUser = await prisma.user.findUnique({ where: { walletAddress } });

  await logChainEvent("RewardClaimed", event, {
    resolvedUser: dbUser?.email ?? null,
    wallet: walletAddress,
    questionId,
    amount: String(amount),
  });
}

export async function handleStaked(event: IndexedEvent) {
  const { user, amount } = event.data;
  if (!user) return;

  const walletAddress = (user as string).toLowerCase();

  await logChainEvent("Staked", event, {
    wallet: walletAddress,
    amount: String(amount),
  });
}

export async function handleBadgeMinted(event: IndexedEvent) {
  const { to, tokenId } = event.data;
  if (!to) return;

  const walletAddress = (to as string).toLowerCase();
  const dbUser = await prisma.user.findUnique({ where: { walletAddress } });

  await logChainEvent("BadgeMinted", event, {
    resolvedUser: dbUser?.email ?? null,
    wallet: walletAddress,
    tokenId: String(tokenId),
  });
}

export async function handlePassPurchased(event: IndexedEvent) {
  const { buyer, tokenId, price, tokensBurned } = event.data;
  if (!buyer) return;

  const walletAddress = (buyer as string).toLowerCase();

  await logChainEvent("PassPurchased", event, {
    wallet: walletAddress,
    tokenId: String(tokenId),
    price: String(price),
    tokensBurned: String(tokensBurned),
  });
}
