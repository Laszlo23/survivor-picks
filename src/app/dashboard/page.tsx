import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Dashboard | RealityPicks",
  description: "Make predictions across live reality TV shows. View your picks, stats, and climb the leaderboard.",
};
import { getSession } from "@/lib/auth";
import {
  getAllActiveSeasons,
  listSeasonEpisodes,
} from "@/lib/actions/episodes";
import { getUserRank } from "@/lib/actions/profile";
import { getShowPredictions } from "@/lib/actions/predictions";
import { getSocialTasks } from "@/lib/actions/social";
import { getReferralStats } from "@/lib/actions/referral";
import { getBalance } from "@/lib/actions/token-balance";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { EmptyState } from "@/components/ui/empty-state";
import { SocialTasksCard } from "@/components/social/social-tasks-card";
import { ReferralCard } from "@/components/social/referral-card";
import { OnboardingModal } from "@/components/onboarding/onboarding-modal";
import { PredictionFeed } from "@/components/predictions/prediction-feed";
import { DashboardStats } from "@/components/dashboard/stats";
import { BalanceBar } from "@/components/wallet/balance-bar";
import {
  Trophy,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/signin");

  // Fetch ALL active seasons (one per show)
  const seasons = await getAllActiveSeasons();

  if (seasons.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState
          icon={<Calendar className="h-7 w-7 text-muted-foreground" />}
          title="No Active Season"
          description="There's no active season right now. Check back soon!"
        />
      </div>
    );
  }

  // Use the first season for stats, social, episodes (primary season)
  const primarySeason = seasons[0];

  // Load predictions for ALL active seasons in parallel
  const [allPredictions, episodes, rankData, socialTasks, referralStats, picksBalance] =
    await Promise.all([
      Promise.all(
        seasons.map(async (s) => ({
          showSlug: (s as any).showSlug || null,
          seasonId: s.id,
          questions: await getShowPredictions(s.id),
        }))
      ),
      listSeasonEpisodes(primarySeason.id),
      getUserRank(primarySeason.id),
      getSocialTasks(primarySeason.id),
      getReferralStats(),
      getBalance(session.user.id),
    ]);

  // Build contestant images from all seasons
  const contestantImages: Record<string, string> = {};
  for (const season of seasons) {
    if (season.contestants) {
      for (const c of season.contestants as any[]) {
        if (c.imageUrl) contestantImages[c.name] = c.imageUrl;
      }
    }
  }

  // Build feeds — only include seasons that have a showSlug set
  const feeds = allPredictions
    .filter((f) => f.showSlug) // skip seasons with no showSlug
    .map((f) => ({
      showSlug: f.showSlug as string,
      seasonId: f.seasonId,
      questions: f.questions,
    }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      {/* ── Compact Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src="/pickslogoicon.png"
              alt="RealityPicks"
              width={36}
              height={36}
              className="rounded-lg relative z-10"
              style={{ mixBlendMode: "screen" }}
            />
            <div className="absolute inset-0 rounded-lg bg-neon-cyan/20 blur-md scale-125" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold leading-tight">
              Reality<span className="text-primary">Picks</span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {seasons.length} {seasons.length === 1 ? "show" : "shows"} live
            </p>
          </div>
        </div>
        <Link href="/leaderboard">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs font-mono"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            #{rankData?.rank || "\u2014"}
          </Button>
        </Link>
      </div>

      {/* ── Animated Stats Row ───────────────────────────────────── */}
      <DashboardStats
        points={rankData?.points || 0}
        rank={rankData?.rank || 0}
        winRate={rankData?.winRate || 0}
        streak={rankData?.currentStreak || 0}
      />

      {/* ── Balance + Buy $PICKS ──────────────────────────────── */}
      <BalanceBar balance={picksBalance.toString()} />

      {/* ── Prediction Feed (per-show tabs + per-show predictions) ── */}
      <PredictionFeed
        feeds={feeds}
        jokersRemaining={rankData?.jokersRemaining ?? 3}
        contestantImages={contestantImages}
        seasonId={primarySeason.id}
        internalBalance={picksBalance.toString()}
      />

      {/* ── All Episodes ─────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-display font-semibold text-muted-foreground uppercase tracking-wider">
            All Episodes
          </h2>
          {episodes[0] && (
            <Link
              href={`/season/${primarySeason.id}/episode/${episodes[0].id}`}
            >
              <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                See All <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
        <div className="space-y-1">
          {episodes.slice(0, 5).map((ep) => (
            <Link
              key={ep.id}
              href={`/season/${primarySeason.id}/episode/${ep.id}`}
              className="flex items-center justify-between rounded-lg hover:bg-white/[0.03] px-3 py-2.5 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">
                  {ep.number}
                </span>
                <span className="text-sm truncate group-hover:text-foreground transition-colors">
                  {ep.title}
                </span>
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

      {/* ── Social + Referral ────────────────────────────────────── */}
      <div className="mt-8 space-y-6">
        <SocialTasksCard
          tasks={socialTasks}
          seasonId={primarySeason.id}
          referralCode={referralStats?.referralCode}
          rank={rankData?.rank}
          totalPoints={rankData?.points}
          seasonTitle={primarySeason.title}
        />
        <ReferralCard stats={referralStats} seasonId={primarySeason.id} />
      </div>

      <OnboardingModal />
    </div>
  );
}
