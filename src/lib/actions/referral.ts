"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  REFERRAL_REFERRER_BONUS,
  REFERRAL_REFEREE_BONUS,
} from "@/lib/scoring";
import { revalidatePath } from "next/cache";

// ─── Referral Code Generation ────────────────────────────────────────────────

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/1/I for clarity
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Get or generate a referral code for the current user.
 */
export async function getOrCreateReferralCode(): Promise<string | null> {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { referralCode: true },
  });

  if (user?.referralCode) return user.referralCode;

  // Generate a unique code
  let code = generateCode();
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
    });
    if (!existing) break;
    code = generateCode();
    attempts++;
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { referralCode: code },
  });

  return code;
}

// ─── Claim Referral ──────────────────────────────────────────────────────────

/**
 * Called when a new user signs up via a referral link.
 * Awards points to both referrer and referee.
 */
export async function claimReferral(
  referralCode: string,
  newUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find referrer by code
    const referrer = await prisma.user.findUnique({
      where: { referralCode },
    });

    if (!referrer) return { success: false, error: "Invalid referral code" };
    if (referrer.id === newUserId)
      return { success: false, error: "Cannot refer yourself" };

    // Check if referee already has a referral
    const existingReferral = await prisma.referral.findUnique({
      where: { refereeId: newUserId },
    });
    if (existingReferral)
      return { success: false, error: "Already referred" };

    // Create referral record
    await prisma.referral.create({
      data: {
        referrerId: referrer.id,
        refereeId: newUserId,
        referralCode,
        pointsAwarded: REFERRAL_REFERRER_BONUS + REFERRAL_REFEREE_BONUS,
        status: "COMPLETED",
      },
    });

    // Update referee's referredById
    await prisma.user.update({
      where: { id: newUserId },
      data: { referredById: referrer.id },
    });

    // Award points to both — find active season
    const activeSeason = await prisma.season.findFirst({
      where: { active: true },
    });

    if (activeSeason) {
      // Referrer gets bonus
      await prisma.userSeasonStats.upsert({
        where: {
          userId_seasonId: {
            userId: referrer.id,
            seasonId: activeSeason.id,
          },
        },
        create: {
          userId: referrer.id,
          seasonId: activeSeason.id,
          points: REFERRAL_REFERRER_BONUS,
          socialPoints: REFERRAL_REFERRER_BONUS,
          referralCount: 1,
        },
        update: {
          points: { increment: REFERRAL_REFERRER_BONUS },
          socialPoints: { increment: REFERRAL_REFERRER_BONUS },
          referralCount: { increment: 1 },
        },
      });

      // Referee gets welcome bonus
      await prisma.userSeasonStats.upsert({
        where: {
          userId_seasonId: {
            userId: newUserId,
            seasonId: activeSeason.id,
          },
        },
        create: {
          userId: newUserId,
          seasonId: activeSeason.id,
          points: REFERRAL_REFEREE_BONUS,
          socialPoints: REFERRAL_REFEREE_BONUS,
        },
        update: {
          points: { increment: REFERRAL_REFEREE_BONUS },
          socialPoints: { increment: REFERRAL_REFEREE_BONUS },
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Referral claim error:", error);
    return { success: false, error: "Failed to process referral" };
  }
}

// ─── Referral Stats ──────────────────────────────────────────────────────────

export interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  totalPointsEarned: number;
  recentReferrals: {
    id: string;
    refereeName: string;
    createdAt: Date;
    pointsAwarded: number;
  }[];
}

export async function getReferralStats(): Promise<ReferralStats | null> {
  try {
    const session = await getSession();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true },
    });

    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
      include: {
        referee: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const totalPoints = referrals.reduce(
      (sum, r) => sum + (r.status === "COMPLETED" ? REFERRAL_REFERRER_BONUS : 0),
      0
    );

    return {
      referralCode: user?.referralCode || null,
      totalReferrals: referrals.length,
      totalPointsEarned: totalPoints,
      recentReferrals: referrals.map((r) => ({
        id: r.id,
        refereeName:
          r.referee.name || r.referee.email.split("@")[0].slice(0, 3) + "***",
        createdAt: r.createdAt,
        pointsAwarded: REFERRAL_REFERRER_BONUS,
      })),
    };
  } catch {
    return null;
  }
}

// ─── Referral Leaderboard ────────────────────────────────────────────────────

export async function getReferralLeaderboard(seasonId: string, limit = 20) {
  try {
    const stats = await prisma.userSeasonStats.findMany({
      where: {
        seasonId,
        referralCount: { gt: 0 },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { referralCount: "desc" },
      take: limit,
    });

    return stats.map((s, i) => ({
      rank: i + 1,
      userId: s.user.id,
      name: s.user.name || s.user.email.split("@")[0],
      referralCount: s.referralCount,
      socialPoints: s.socialPoints,
    }));
  } catch {
    return [];
  }
}

// ─── Community Leaderboard (Social + Referral) ───────────────────────────────

export async function getCommunityLeaderboard(seasonId: string, limit = 20) {
  try {
    const stats = await prisma.userSeasonStats.findMany({
      where: {
        seasonId,
        OR: [
          { socialPoints: { gt: 0 } },
          { referralCount: { gt: 0 } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { socialPoints: "desc" },
      take: limit,
    });

    return stats.map((s, i) => ({
      rank: i + 1,
      userId: s.user.id,
      name: s.user.name || s.user.email.split("@")[0],
      socialPoints: s.socialPoints,
      referralCount: s.referralCount,
      totalPoints: s.points,
    }));
  } catch {
    return [];
  }
}
