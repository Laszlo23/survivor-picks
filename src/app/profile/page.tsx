import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserProfile, getUserRecentPredictions, getUserRank } from "@/lib/actions/profile";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getReferralStats } from "@/lib/actions/referral";
import { getSocialStats } from "@/lib/actions/social";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ReferralCard } from "@/components/social/referral-card";
import { ProfileWeb3Section } from "./profile-web3";
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

  const [rank, referralStats, socialStats] = await Promise.all([
    season ? getUserRank(season.id) : null,
    getReferralStats(),
    season ? getSocialStats(season.id) : null,
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary text-2xl font-bold">
          {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            {profile.name || "Survivor Player"}
          </h1>
          <p className="text-muted-foreground text-sm">{profile.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Joined {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Points</p>
                <p className="text-xl font-bold font-mono text-primary">
                  {activeStats?.points?.toLocaleString() || "0"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Rank</p>
                <p className="text-xl font-bold font-mono">
                  #{rank?.rank || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
                <p className="text-xl font-bold font-mono">
                  {activeStats
                    ? `${Math.round((activeStats.winRate || 0) * 100)}%`
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Best Streak</p>
                <p className="text-xl font-bold font-mono">
                  {activeStats?.longestStreak || 0}
                  <span className="text-sm text-muted-foreground ml-1">eps</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Season Stats */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
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
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
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
                    className="rounded-lg border border-border/30 bg-secondary/30 p-3 text-center"
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
                icon={Award}
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

      {/* Web3 / On-Chain Section */}
      <div className="mt-8">
        <ProfileWeb3Section />
      </div>

      {/* Recent Predictions */}
      <Card className="bg-card/50 border-border/50 mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Recent Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPredictions.length > 0 ? (
            <div className="space-y-2">
              {recentPredictions.map((pred) => (
                <div
                  key={pred.id}
                  className="flex items-center gap-3 rounded-lg bg-secondary/30 px-4 py-3"
                >
                  <div className="shrink-0">
                    {pred.isCorrect === true ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
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
              icon={Target}
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
