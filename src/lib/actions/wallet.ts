"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Link a wallet address to the current user's account.
 * Called after the user connects their wallet on the frontend.
 */
export async function linkWallet(walletAddress: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  // Validate address format (basic check)
  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return { error: "Invalid wallet address" };
  }

  // Normalize to lowercase (checksummed addresses should be stored lowercased for consistency)
  const normalizedAddress = walletAddress.toLowerCase();

  // Check if this wallet is already linked to another user
  const existingUser = await prisma.user.findUnique({
    where: { walletAddress: normalizedAddress },
  });

  if (existingUser && existingUser.id !== session.user.id) {
    return { error: "This wallet is already linked to another account" };
  }

  // Link the wallet
  await prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress: normalizedAddress },
  });

  return { success: true, walletAddress: normalizedAddress };
}

/**
 * Unlink a wallet from the current user's account.
 */
export async function unlinkWallet() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: "Not authenticated" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { walletAddress: null },
  });

  return { success: true };
}

/**
 * Get the wallet address for the current user.
 */
export async function getWalletAddress() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { walletAddress: true },
  });

  return user?.walletAddress ?? null;
}
