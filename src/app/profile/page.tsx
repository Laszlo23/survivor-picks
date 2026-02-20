import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile | RealityPicks",
  description: "View your prediction stats, badges, NFT collection, and activity history.",
};
import { getUserProfile, getUserRecentPredictions, getUserRank } from "@/lib/actions/profile";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getReferralStats } from "@/lib/actions/referral";
import { getSocialStats } from "@/lib/actions/social";
import { getBalance, getTransactions } from "@/lib/actions/token-balance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ReferralCard } from "@/components/social/referral-card";
import { PicksWalletCard } from "@/components/wallet/picks-wallet-card";
import {
  User,
  Trophy,
  Target,
  Zap,
  TrendingUp,
  Shield,
  Flame,
  CheckCircle,
  XCircle,
  Award,
  Users,
  Share2,
} from "lucide-react";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  const [profile, recentPredictions, season] = await Promise.all([
    getUserProfile(),
    getUserRecentPredictions(20),
    getActiveSeason(),
  ]);

  if (!profile) redirect("/auth/signin");

  const activeStats = season
    ? profile.seasonStats.find((s) => s.seasonId === season.id)
    : profile.seasonStats[0];

  const [rank, referralStats, socialStats, picksBalance, tokenTxs] = await Promise.all([
    season ? getUserRank(season.id) : null,
    getReferralStats(),
    season ? getSocialStats(season.id) : null,
    getBalance(session.user.id),
    getTransactions(session.user.id, 10),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-3 sm:gap-4">
        <div className="relative shrink-0">
          <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/20 text-primary text-xl sm:text-2xl font-bold relative z-10">
            {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
          </div>
          <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-primary via-blue-500 to-violet-500 opacity-50 blur-sm animate-gradient-x" style={{ backgroundSize: "200% 200%" }} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-display font-bold truncate">
            {profile.name || "RealityPicks Player"}
          </h1>
          <p className="text-muted-foreground text-sm truncate">{profile.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Joined {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          {
            icon: Zap,
            label: "Total Points",
            value: activeStats?.points?.toLocaleString() || "0",
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            icon: Trophy,
            label: "Rank",
            value: `#${rank?.rank || "\u2014"}`,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            icon: Target,
            label: "Win Rate",
            value: activeStats
              ? `${Math.round((activeStats.winRate || 0) * 100)}%`
              : "\u2014",
            color: "text-neon-cyan",
            bg: "bg-neon-cyan/10",
          },
          {
            icon: TrendingUp,
            label: "Best Streak",
            value: `${activeStats?.longestStreak || 0}`,
            color: "text-accent",
            bg: "bg-accent/10",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl ${stat.bg} border border-white/[0.06] flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className={`text-xl font-bold font-mono ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Season Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              Season Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeStats ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correct Predictions</span>
                  <span className="font-mono font-bold">
                    {activeStats.correctCount}/{activeStats.totalCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="font-mono font-bold">
                    {activeStats.currentStreak} episodes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Shield className="h-3 w-3 text-primary" />
                      Tribe Loyalty
                    </span>
                  </span>
                  <span className="font-mono font-bold">
                    {activeStats.tribeLoyaltyCorrect}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Bets Won</span>
                  <span className="font-mono font-bold text-accent">
                    {activeStats.riskBetsWon}/{activeStats.riskBetsTotal}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jokers Remaining</span>
                  <span className="font-mono font-bold text-primary">
                    {activeStats.jokersRemaining}
                  </span>
                </div>
                {/* Social Stats */}
                <div className="border-t border-border/30 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <Share2 className="h-3 w-3 text-amber-400" />
                      Social Points
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {socialStats?.socialPoints || 0}
                    </span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <Users className="h-3 w-3 text-primary" />
                      Friends Referred
                    </span>
                    <span className="font-mono font-bold">
                      {socialStats?.referralCount || 0}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">
                No stats yet. Make your first pick!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {profile.badges.map((ub) => (
                  <div
                    key={ub.id}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center hover:bg-white/[0.04] transition-colors"
                  >
                    <span className="text-2xl">{ub.badge.icon}</span>
                    <p className="text-sm font-medium mt-1">{ub.badge.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ub.badge.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Award className="h-7 w-7 text-muted-foreground" />}
                title="No Badges Yet"
                description="Keep playing to unlock achievements!"
                className="py-8"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Referral Section */}
      <div className="mt-8">
        {season && (
          <ReferralCard stats={referralStats} seasonId={season.id} />
        )}
      </div>

      {/* $PICKS Wallet — Internal + On-Chain */}
      <div className="mt-8">
        <PicksWalletCard
          offChainBalance={String(picksBalance)}
          tokenTxs={tokenTxs.map((tx) => ({
            id: tx.id,
            amount: String(tx.amount),
            type: tx.type,
            createdAt: tx.createdAt.toISOString(),
          }))}
        />
      </div>

      {/* On-Chain — Coming at launch */}
      <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
        <p className="text-xs text-muted-foreground">
          On-chain features (staking, NFTs, wallet linking) activate at the <span className="text-neon-gold font-bold">333 Fair Launch</span>.
          Your internal $PICKS convert 1:1.
        </p>
      </div>

      {/* Recent Predictions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg font-display">Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPredictions.length > 0 ? (
            <div className="space-y-2">
              {recentPredictions.map((pred) => (
                <div
                  key={pred.id}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.04] px-4 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="shrink-0">
                    {pred.isCorrect === true ? (
                      <CheckCircle className="h-5 w-5 text-neon-cyan" />
                    ) : pred.isCorrect === false ? (
                      <XCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {pred.question.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ep. {pred.question.episode.number} · Picked:{" "}
                      <span className="text-foreground">{pred.chosenOption}</span>
                      {pred.isRisk && (
                        <span className="text-accent ml-2">Risk</span>
                      )}
                      {pred.usedJoker && (
                        <span className="text-primary ml-2">Joker</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {pred.pointsAwarded !== null ? (
                      <span
                        className={`font-mono font-bold text-sm ${
                          pred.pointsAwarded > 0
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        +{pred.pointsAwarded}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Target className="h-7 w-7 text-muted-foreground" />}
              title="No Predictions Yet"
              description="Head to the dashboard to make your first picks!"
              className="py-8"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

