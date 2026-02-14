import { prisma } from "@/lib/prisma";

/**
 * Send a push notification to a user's Farcaster client.
 *
 * This is used to notify users about prediction results, new episodes,
 * badge unlocks, and other events.
 *
 * The notification will only be sent if the user has a stored
 * notification token (from the miniapp_added or notifications_enabled webhook).
 *
 * Rate limits enforced by the Farcaster host:
 * - 1 notification per 30 seconds per token
 * - 100 notifications per day per token
 */
export async function sendFarcasterNotification({
  userId,
  title,
  body,
  targetUrl,
}: {
  userId: string;
  title: string;
  body: string;
  targetUrl: string;
}): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcNotificationToken: true, fcNotificationUrl: true },
    });

    if (!user?.fcNotificationToken || !user?.fcNotificationUrl) {
      return false; // User hasn't enabled Farcaster notifications
    }

    const response = await fetch(user.fcNotificationUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notificationId: crypto.randomUUID(),
        title,
        body,
        targetUrl,
        tokens: [user.fcNotificationToken],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.warn(
        `[Farcaster Notification] Failed for user ${userId}: ${response.status} ${errorBody}`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("[Farcaster Notification] Error:", error);
    return false;
  }
}

/**
 * Notify all Farcaster users who made predictions on a specific episode
 * that results are in.
 */
export async function notifyEpisodeResolved(
  episodeId: string,
  episodeTitle: string,
  showSlug: string
): Promise<void> {
  try {
    // Find all users who predicted on this episode and have FC notifications
    const predictions = await prisma.prediction.findMany({
      where: {
        question: { episodeId },
      },
      select: {
        userId: true,
        isCorrect: true,
        pointsAwarded: true,
      },
      distinct: ["userId"],
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz";

    for (const prediction of predictions) {
      const totalPoints = predictions
        .filter((p) => p.userId === prediction.userId)
        .reduce((sum, p) => sum + (p.pointsAwarded || 0), 0);

      const correctCount = predictions
        .filter((p) => p.userId === prediction.userId && p.isCorrect)
        .length;

      const body =
        totalPoints > 0
          ? `You scored ${totalPoints} pts (${correctCount} correct)! Check your results.`
          : "Results are in! See how you did.";

      await sendFarcasterNotification({
        userId: prediction.userId,
        title: `${episodeTitle} — Results Are In!`,
        body,
        targetUrl: `${baseUrl}/dashboard?show=${showSlug}`,
      });
    }
  } catch (error) {
    console.error("[Farcaster] notifyEpisodeResolved error:", error);
  }
}
