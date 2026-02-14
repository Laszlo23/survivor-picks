import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getActiveSeason, getNextOpenEpisode, listSeasonEpisodes } from "@/lib/actions/episodes";
import { getUserRank } from "@/lib/actions/profile";
import { getSocialTasks } from "@/lib/actions/social";
import { getReferralStats } from "@/lib/actions/referral";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { Countdown } from "@/components/ui/countdown";
import { EmptyState } from "@/components/ui/empty-state";
import { SocialTasksCard } from "@/components/social/social-tasks-card";
import { ReferralCard } from "@/components/social/referral-card";
import {
  Flame,
  Trophy,
  Target,
  Zap,
  ArrowRight,
  Calendar,
  TrendingUp,
  Shield,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  const season = await getActiveSeason();
  if (!season) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={Calendar}
          title="No Active Season"
          description="There's no active season right now. Check back soon!"
        />
      </div>
    );
  }

  const [nextEpisode, episodes, rankData, socialTasks, referralStats] =
    await Promise.all([
      getNextOpenEpisode(season.id),
      listSeasonEpisodes(season.id),
      getUserRank(season.id),
      getSocialTasks(season.id),
      getReferralStats(),
    ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Flame className="h-6 w-6 text-primary" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session.user.name || "Survivor"}! — {season.title}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold font-mono text-primary">
                  {rankData?.points?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold font-mono">
                  #{rankData?.rank || "—"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Win Rate</p>
                <p className="text-2xl font-bold font-mono">
                  {rankData
                    ? `${Math.round((rankData.winRate || 0) * 100)}%`
                    : "—"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-bold font-mono">
                  {rankData?.currentStreak || 0}
                  <span className="text-sm text-muted-foreground ml-1">
                    ep{rankData?.currentStreak !== 1 ? "s" : ""}
                  </span>
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: Episode + Social Tasks */}
        <div className="lg:col-span-2 space-y-8">
          {/* Next Episode */}
          {nextEpisode ? (
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base sm:text-lg truncate">
                      Ep. {nextEpisode.number}: {nextEpisode.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {nextEpisode.questions.length} questions open
                    </p>
                  </div>
                  <StatusChip status={nextEpisode.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Locks in
                    </p>
                    <Countdown targetDate={new Date(nextEpisode.lockAt)} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-sm">
                      {rankData?.jokersRemaining ?? 3} Jokers
                    </span>
                  </div>
                </div>

                {/* Quick question preview */}
                <div className="space-y-2 mb-6">
                  {nextEpisode.questions.slice(0, 3).map((q) => (
                    <div
                      key={q.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 px-3 py-2.5 min-w-0"
                    >
                      <span className="text-sm truncate min-w-0">{q.prompt}</span>
                      <Badge
                        variant="outline"
                        className="shrink-0 bg-primary/10 text-primary border-primary/20 font-mono text-xs"
                      >
                        {q.odds >= 0 ? "+" : ""}
                        {q.odds}
                      </Badge>
                    </div>
                  ))}
                  {nextEpisode.questions.length > 3 && (
                    <p className="text-xs text-muted-foreground text-center">
                      +{nextEpisode.questions.length - 3} more questions
                    </p>
                  )}
                </div>

                <Link
                  href={`/season/${season.id}/episode/${nextEpisode.id}`}
                >
                  <Button className="w-full gap-2">
                    Make Your Picks
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No Open Episodes"
              description="All episodes are either locked or resolved. Check back for the next one!"
            />
          )}

          {/* Social Tasks */}
          <SocialTasksCard
            tasks={socialTasks}
            seasonId={season.id}
            referralCode={referralStats?.referralCode}
            rank={rankData?.rank}
            totalPoints={rankData?.points}
            seasonTitle={season.title}
          />
        </div>

        {/* Right column: Episode List + Referral */}
        <div className="space-y-8">
          {/* Episode List */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">All Episodes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {episodes.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/season/${season.id}/episode/${ep.id}`}
                    className="flex items-center justify-between rounded-lg hover:bg-secondary/50 px-3 py-2.5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-muted-foreground w-6">
                        {ep.number}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{ep.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {ep.questions.length} questions
                        </p>
                      </div>
                    </div>
                    <StatusChip status={ep.status} />
                  </Link>
                ))}
                {episodes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No episodes yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Referral / Invite Card */}
          <ReferralCard stats={referralStats} seasonId={season.id} />
        </div>
      </div>
    </div>
  );
}
