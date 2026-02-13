"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { SOCIAL_COOLDOWN_HOURS } from "@/lib/scoring";
import { revalidatePath } from "next/cache";

// ─── Claim a Social Task ─────────────────────────────────────────────────────

export async function claimSocialTask(
  taskKey: string,
  seasonId: string,
  metadata?: Record<string, string | number | boolean | null>
) {
  const session = await getSession();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const userId = session.user.id;

  // 1. Find the task
  const task = await prisma.socialTask.findUnique({ where: { key: taskKey } });
  if (!task || !task.active) return { error: "Task not found" };

  // 2. Check cooldown — find most recent claim for this task by this user
  const cooldownCutoff = new Date();
  cooldownCutoff.setHours(cooldownCutoff.getHours() - (task.cooldownHours || SOCIAL_COOLDOWN_HOURS));

  const recentClaim = await prisma.socialTaskClaim.findFirst({
    where: {
      userId,
      socialTaskId: task.id,
      createdAt: { gte: cooldownCutoff },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentClaim) {
    const nextAvailable = new Date(recentClaim.createdAt);
    nextAvailable.setHours(nextAvailable.getHours() + (task.cooldownHours || SOCIAL_COOLDOWN_HOURS));
    return {
      error: "On cooldown",
      nextAvailable: nextAvailable.toISOString(),
    };
  }

  // 3. Check max per season
  if (task.maxPerSeason) {
    const seasonClaimCount = await prisma.socialTaskClaim.count({
      where: { userId, socialTaskId: task.id, seasonId },
    });
    if (seasonClaimCount >= task.maxPerSeason) {
      return { error: "Maximum claims reached for this season" };
    }
  }

  // 4. Create claim + award points
  const claim = await prisma.socialTaskClaim.create({
    data: {
      userId,
      socialTaskId: task.id,
      seasonId,
      metadata: (metadata || {}) as Record<string, string | number | boolean | null>,
      pointsAwarded: task.pointsReward,
    },
  });

  // 5. Update UserSeasonStats
  await prisma.userSeasonStats.upsert({
    where: { userId_seasonId: { userId, seasonId } },
    create: {
      userId,
      seasonId,
      points: task.pointsReward,
      socialPoints: task.pointsReward,
    },
    update: {
      points: { increment: task.pointsReward },
      socialPoints: { increment: task.pointsReward },
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return {
    success: true,
    pointsAwarded: task.pointsReward,
    claimId: claim.id,
  };
}

// ─── Get Social Tasks with User Status ───────────────────────────────────────

export interface SocialTaskWithStatus {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  pointsReward: number;
  cooldownHours: number;
  completedToday: boolean;
  totalClaims: number;
  nextAvailable: string | null; // ISO date or null if available now
}

export async function getSocialTasks(
  seasonId: string
): Promise<SocialTaskWithStatus[]> {
  try {
    const session = await getSession();
    const userId = session?.user?.id;

    const tasks = await prisma.socialTask.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });

    if (!userId) {
      return tasks.map((t) => ({
        id: t.id,
        key: t.key,
        title: t.title,
        description: t.description,
        icon: t.icon,
        pointsReward: t.pointsReward,
        cooldownHours: t.cooldownHours,
        completedToday: false,
        totalClaims: 0,
        nextAvailable: null,
      }));
    }

    // Use the longest cooldown across all tasks to fetch claims broadly,
    // then compute per-task cooldown status individually in the mapping loop.
    const maxCooldown = Math.max(...tasks.map((t) => t.cooldownHours), SOCIAL_COOLDOWN_HOURS);
    const cooldownCutoff = new Date();
    cooldownCutoff.setHours(cooldownCutoff.getHours() - maxCooldown);

    const [recentClaims, totalCounts] = await Promise.all([
      prisma.socialTaskClaim.findMany({
        where: {
          userId,
          createdAt: { gte: cooldownCutoff },
        },
      }),
      prisma.socialTaskClaim.groupBy({
        by: ["socialTaskId"],
        where: { userId, seasonId },
        _count: true,
      }),
    ]);

    const recentByTask = new Map(
      recentClaims.map((c) => [c.socialTaskId, c])
    );
    const countByTask = new Map(
      totalCounts.map((c) => [c.socialTaskId, c._count])
    );

    return tasks.map((t) => {
      const recent = recentByTask.get(t.id);
      let nextAvailable: string | null = null;
      let completedRecently = false;

      if (recent) {
        // Check if the claim is within THIS task's cooldown window
        const taskCooldownCutoff = new Date();
        taskCooldownCutoff.setHours(taskCooldownCutoff.getHours() - t.cooldownHours);

        if (recent.createdAt >= taskCooldownCutoff) {
          completedRecently = true;
          const next = new Date(recent.createdAt);
          next.setHours(next.getHours() + t.cooldownHours);
          if (next > new Date()) nextAvailable = next.toISOString();
        }
      }

      return {
        id: t.id,
        key: t.key,
        title: t.title,
        description: t.description,
        icon: t.icon,
        pointsReward: t.pointsReward,
        cooldownHours: t.cooldownHours,
        completedToday: completedRecently,
        totalClaims: countByTask.get(t.id) || 0,
        nextAvailable,
      };
    });
  } catch {
    return [];
  }
}

// ─── Get Social Stats for a User ─────────────────────────────────────────────

export async function getSocialStats(seasonId: string) {
  try {
    const session = await getSession();
    if (!session?.user?.id) return null;

    const stats = await prisma.userSeasonStats.findUnique({
      where: {
        userId_seasonId: { userId: session.user.id, seasonId },
      },
      select: {
        socialPoints: true,
        referralCount: true,
      },
    });

    const totalClaims = await prisma.socialTaskClaim.count({
      where: { userId: session.user.id, seasonId },
    });

    return {
      socialPoints: stats?.socialPoints || 0,
      referralCount: stats?.referralCount || 0,
      totalClaims,
    };
  } catch {
    return null;
  }
}
