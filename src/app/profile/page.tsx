import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getUserProfile,
  getUserRecentPredictions,
  getUserRank,
  getProfileStats,
  getBettingHistory,
  getTransactionHistory,
} from "@/lib/actions/profile";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getReferralStats } from "@/lib/actions/referral";
import { getSocialStats } from "@/lib/actions/social";
import { getBalance } from "@/lib/actions/token-balance";
import { ProfileTabs } from "@/components/profile/profile-tabs";

export const metadata: Metadata = {
  title: "Profile | RealityPicks",
  description: "View your prediction stats, badges, and activity history.",
};

export default async function ProfilePage() {
  let session;
  try {
    session = await getSession();
  } catch {
    redirect("/auth/signin?error=session");
  }
  if (!session?.user) redirect("/auth/signin");

  const [profile, season] = await Promise.all([
    getUserProfile(),
    getActiveSeason(),
  ]);

  if (!profile) redirect("/auth/signin");

  const activeStats = season
    ? profile.seasonStats.find((s) => s.seasonId === season.id)
    : profile.seasonStats[0];

  const [
    rank,
    referralStats,
    socialStats,
    picksBalance,
    profileStats,
    bettingHistory,
    txHistory,
  ] = await Promise.all([
    season ? getUserRank(season.id).catch(() => null) : null,
    getReferralStats().catch(() => null),
    season ? getSocialStats(season.id).catch(() => null) : null,
    getBalance(session.user.id).catch(() => BigInt(0)),
    getProfileStats().catch(() => null),
    getBettingHistory(20, 0).catch(() => ({ predictions: [], total: 0 })),
    getTransactionHistory(20, 0).catch(() => ({ transactions: [], total: 0 })),
  ]);

  const defaultStats = {
    totalPoints: 0,
    totalCorrect: 0,
    totalPredictions: 0,
    overallWinRate: 0,
    bestStreak: 0,
    seasonsPlayed: 0,
    totalPicksEarned: "0",
    totalPicksSpent: "0",
    memberSince: profile.createdAt.toISOString(),
  };

  const serializedPredictions = bettingHistory.predictions.map((p) => ({
    id: p.id,
    chosenOption: p.chosenOption,
    isRisk: p.isRisk,
    usedJoker: p.usedJoker,
    pointsAwarded: p.pointsAwarded,
    isCorrect: p.isCorrect,
    createdAt: p.createdAt.toISOString(),
    question: {
      prompt: p.question.prompt,
      correctOption: p.question.correctOption,
      episode: {
        number: p.question.episode.number,
        title: p.question.episode.title,
        season: { title: p.question.episode.season.title },
      },
    },
  }));

  const serializedSeasonStats = activeStats
    ? {
        id: activeStats.id,
        points: activeStats.points,
        correctCount: activeStats.correctCount,
        totalCount: activeStats.totalCount,
        currentStreak: activeStats.currentStreak,
        longestStreak: activeStats.longestStreak,
        winRate: activeStats.winRate,
        tribeLoyaltyCorrect: activeStats.tribeLoyaltyCorrect,
        riskBetsWon: activeStats.riskBetsWon,
        riskBetsTotal: activeStats.riskBetsTotal,
        jokersUsed: activeStats.jokersUsed,
        jokersRemaining: activeStats.jokersRemaining,
        socialPoints: activeStats.socialPoints,
        referralCount: activeStats.referralCount,
        season: { title: activeStats.season.title },
      }
    : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ProfileTabs
        profile={{
          name: profile.name,
          username: profile.username,
          image: profile.image,
          bio: profile.bio,
          email: profile.email,
          createdAt: profile.createdAt.toISOString(),
          socialTwitter: profile.socialTwitter,
          socialInstagram: profile.socialInstagram,
          socialTiktok: profile.socialTiktok,
          socialFarcaster: profile.socialFarcaster,
          socialWebsite: profile.socialWebsite,
        }}
        stats={profileStats || defaultStats}
        rank={rank ? { rank: rank.rank, totalPlayers: rank.totalPlayers } : null}
        seasonStats={serializedSeasonStats}
        socialStats={socialStats ? { socialPoints: socialStats.socialPoints ?? 0, referralCount: socialStats.referralCount ?? 0 } : null}
        badges={profile.badges.map((ub) => ({
          id: ub.id,
          badge: { icon: ub.badge.icon, title: ub.badge.title, description: ub.badge.description },
        }))}
        predictions={serializedPredictions}
        predictionsTotal={bettingHistory.total}
        transactions={txHistory.transactions}
        transactionsTotal={txHistory.total}
        balance={String(picksBalance)}
        referralStats={referralStats}
        seasonId={season?.id ?? null}
      />
    </div>
  );
}
