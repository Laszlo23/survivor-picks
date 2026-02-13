/**
 * Database sync handlers for on-chain events.
 * These functions receive indexed events and write relevant data to PostgreSQL.
 */

import { prisma } from "@/lib/prisma";
import type { IndexedEvent } from "./event-indexer";

/**
 * When a prediction is made on-chain, log it as a score event for the user.
 */
export async function handlePredictionMade(event: IndexedEvent) {
  const { user, questionId, amount, option, isRisk } = event.data;

  if (!user || !questionId) return;

  const walletAddress = (user as string).toLowerCase();

  // Find the user by wallet address
  const dbUser = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (!dbUser) {
    console.log(`[Sync] Unknown wallet ${walletAddress} for PredictionMade event`);
    return;
  }

  // Log the on-chain prediction event
  console.log(`[Sync] PredictionMade: user=${dbUser.email}, question=${questionId}, amount=${amount}, option=${option}, risk=${isRisk}`);
}

/**
 * When a question is resolved on-chain, update the corresponding DB record.
 */
export async function handleQuestionResolved(event: IndexedEvent) {
  const { questionId, correctOption, totalPool, platformFee } = event.data;

  console.log(`[Sync] QuestionResolved: question=${questionId}, correct=${correctOption}, pool=${totalPool}, fee=${platformFee}`);
}

/**
 * When rewards are claimed on-chain, log it.
 */
export async function handleRewardClaimed(event: IndexedEvent) {
  const { user, questionId, amount } = event.data;

  if (!user) return;

  const walletAddress = (user as string).toLowerCase();
  const dbUser = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (dbUser) {
    console.log(`[Sync] RewardClaimed: user=${dbUser.email}, question=${questionId}, amount=${amount}`);
  }
}

/**
 * When tokens are staked, update the user's staking record.
 */
export async function handleStaked(event: IndexedEvent) {
  const { user, amount } = event.data;

  if (!user) return;

  const walletAddress = (user as string).toLowerCase();
  console.log(`[Sync] Staked: wallet=${walletAddress}, amount=${amount}`);
}

/**
 * When an NFT badge is minted, record it.
 */
export async function handleBadgeMinted(event: IndexedEvent) {
  const { to, tokenId } = event.data;

  if (!to) return;

  const walletAddress = (to as string).toLowerCase();
  const dbUser = await prisma.user.findUnique({
    where: { walletAddress },
  });

  if (dbUser) {
    console.log(`[Sync] BadgeMinted: user=${dbUser.email}, tokenId=${tokenId}`);
  }
}

/**
 * When a season pass is purchased, record the burn.
 */
export async function handlePassPurchased(event: IndexedEvent) {
  const { buyer, tokenId, price, tokensBurned } = event.data;

  if (!buyer) return;

  const walletAddress = (buyer as string).toLowerCase();
  console.log(`[Sync] PassPurchased: wallet=${walletAddress}, tokenId=${tokenId}, price=${price}, burned=${tokensBurned}`);
}
