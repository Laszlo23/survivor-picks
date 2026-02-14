import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import {
  getActiveSeason,
  listSeasonEpisodes,
} from "@/lib/actions/episodes";
import { getUserRank } from "@/lib/actions/profile";
import { getShowPredictions } from "@/lib/actions/predictions";
import { getSocialTasks } from "@/lib/actions/social";
import { getReferralStats } from "@/lib/actions/referral";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { SocialTasksCard } from "@/components/social/social-tasks-card";
import { ReferralCard } from "@/components/social/referral-card";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { PredictionFeed } from "@/components/predictions/prediction-feed";
import {
  Trophy,
  Target,
  Zap,
  ArrowRight,
  Calendar,
  TrendingUp,
  ChevronRight,
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

  const [episodes, rankData, socialTasks, referralStats, predictions] =
    await Promise.all([
      listSeasonEpisodes(season.id),
      getUserRank(season.id),
      getSocialTasks(season.id),
      getReferralStats(),
      getShowPredictions(season.id),
    ]);

  // Build contestant image map
  const contestantImages: Record<string, string> = {};
  if (season.contestants) {
    for (const c of season.contestants as any[]) {
      if (c.imageUrl) contestantImages[c.name] = c.imageUrl;
    }
  }

  // Build feed data (for now, all predictions map to the season's show slug)
  const showSlug = (season as any).showSlug || "survivor-50";
  const feeds = [
    {
      showSlug,
      seasonId: season.id,
      questions: predictions,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* ── Compact Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="RealityPicks"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-lg font-bold leading-tight">
              Reality<span className="text-primary">Picks</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {season.title}
            </p>
          </div>
        </div>
        <Link href="/leaderboard">
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            #{rankData?.rank || "—"}
          </Button>
        </Link>
      </div>

      {/* ── Compact Stats Row ───────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="rounded-xl bg-white/[0.03] border border-border/30 p-3 text-center">
          <p className="text-lg font-bold font-mono text-primary">
            {rankData?.points?.toLocaleString() || "0"}
          </p>
          <p className="text-[10px] text-muted-foreground">Points</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-border/30 p-3 text-center">
          <p className="text-lg font-bold font-mono">
            #{rankData?.rank || "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">Rank</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-border/30 p-3 text-center">
          <p className="text-lg font-bold font-mono">
            {rankData
              ? `${Math.round((rankData.winRate || 0) * 100)}%`
              : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">Win Rate</p>
        </div>
        <div className="rounded-xl bg-white/[0.03] border border-border/30 p-3 text-center">
          <p className="text-lg font-bold font-mono">
            {rankData?.currentStreak || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">Streak</p>
        </div>
      </div>

      {/* ── Prediction Feed (Bracky-style) ──────────────────────── */}
      <PredictionFeed
        feeds={feeds}
        jokersRemaining={rankData?.jokersRemaining ?? 3}
        contestantImages={contestantImages}
        seasonId={season.id}
      />

      {/* ── All Episodes (collapsed) ────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            All Episodes
          </h2>
          <Link href={`/season/${season.id}/episode/${episodes[0]?.id || ""}`}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
              See All <ChevronRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
        <div className="space-y-1">
          {episodes.slice(0, 5).map((ep) => (
            <Link
              key={ep.id}
              href={`/season/${season.id}/episode/${ep.id}`}
              className="flex items-center justify-between rounded-lg hover:bg-white/[0.03] px-3 py-2 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">
                  {ep.number}
                </span>
                <span className="text-sm truncate">{ep.title}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-muted-foreground">
                  {(ep as any).questions?.length || 0}q
                </span>
                <StatusChip status={ep.status} />
              </div>
            </Link>
          ))}
          {episodes.length > 5 && (
            <p className="text-xs text-center text-muted-foreground py-2">
              +{episodes.length - 5} more episodes
            </p>
          )}
        </div>
      </div>

      {/* ── Social + Referral (below fold) ──────────────────────── */}
      <div className="mt-8 space-y-6">
        <SocialTasksCard
          tasks={socialTasks}
          seasonId={season.id}
          referralCode={referralStats?.referralCode}
          rank={rankData?.rank}
          totalPoints={rankData?.points}
          seasonTitle={season.title}
        />
        <ReferralCard stats={referralStats} seasonId={season.id} />
      </div>

      {/* Onboarding for first-time users */}
      <OnboardingModal />
    </div>
  );
}
