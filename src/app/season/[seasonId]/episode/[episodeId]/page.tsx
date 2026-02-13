import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getEpisodeWithQuestions } from "@/lib/actions/episodes";
import { getUserPredictions } from "@/lib/actions/predictions";
import { getUserRank } from "@/lib/actions/profile";
import { getOrCreateReferralCode } from "@/lib/actions/referral";
import { prisma } from "@/lib/prisma";
import { EpisodeClient } from "./episode-client";

export default async function EpisodePage({
  params,
}: {
  params: { seasonId: string; episodeId: string };
}) {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  const { seasonId, episodeId } = params;

  const [episode, predictions, rankData, referralCode, contestants] = await Promise.all([
    getEpisodeWithQuestions(episodeId),
    getUserPredictions(episodeId),
    getUserRank(seasonId),
    getOrCreateReferralCode(),
    prisma.contestant.findMany({
      where: { seasonId },
      select: { name: true, imageUrl: true },
    }),
  ]);

  // Build name → imageUrl map for displaying contestant photos in options
  const contestantImages: Record<string, string> = {};
  for (const c of contestants) {
    if (c.imageUrl) contestantImages[c.name] = c.imageUrl;
  }

  if (!episode) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p>Episode not found</p>
      </div>
    );
  }

  const userPredictions = predictions.reduce(
    (acc, p) => {
      acc[p.questionId] = {
        chosenOption: p.chosenOption,
        isRisk: p.isRisk,
        usedJoker: p.usedJoker,
        isCorrect: p.isCorrect,
        pointsAwarded: p.pointsAwarded,
      };
      return acc;
    },
    {} as Record<
      string,
      {
        chosenOption: string;
        isRisk: boolean;
        usedJoker: boolean;
        isCorrect: boolean | null;
        pointsAwarded: number | null;
      }
    >
  );

  return (
    <EpisodeClient
      episode={{
        ...episode,
        airAt: episode.airAt.toISOString(),
        lockAt: episode.lockAt.toISOString(),
      }}
      userPredictions={userPredictions}
      jokersRemaining={rankData?.jokersRemaining ?? 3}
      seasonId={seasonId}
      referralCode={referralCode}
      contestantImages={contestantImages}
    />
  );
}
