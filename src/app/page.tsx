import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Users, Clock, Coins, MessageSquare, Flame, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getTopLeaderboard } from "@/lib/actions/leaderboard";
import { prisma } from "@/lib/prisma";
import { LandingHero } from "@/components/landing/hero";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingEmailCapture } from "@/components/landing/email-capture";
import { LandingFooter } from "@/components/landing/footer";
import { LandingLiveBettingTeaser } from "@/components/landing/live-betting-teaser";
import { LandingWalletExplainer } from "@/components/landing/wallet-explainer";
import { LandingShell } from "@/components/landing/landing-shell";
import { NeonButton } from "@/components/ui/neon-button";
import { LowerThird } from "@/components/ui/lower-third";
import { ScoreboardRow } from "@/components/ui/scoreboard-row";
import { Section, SectionLabel, SectionTitle, StatPill } from "@/components/ui/primitives";

export const revalidate = 60;

export default async function LandingPage() {
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  let todos: unknown[] | null = null;
  try {
    const { data } = await supabase.from("todos").select();
    todos = data;
  } catch {
    // todos table may not exist yet
  }

  let season = null;
  let featuredEpisode: { id: string; number: number; title: string; lockAt: Date; airAt: Date; status: string } | null = null;
  let featuredQuestions = 0;
  let featuredPlayers = 0;
  let featuredPredictions = 0;
  let topTwoPicks: { name: string; pct: number }[] = [];
  let totalPlayers = 0;
  let totalPredictions = 0;
  let openQuestions = 0;
  let seasonId: string | undefined;

  try {
    season = await getActiveSeason();
    seasonId = season?.id;

    const nextEpisode = season?.episodes
      ?.filter((ep) => ep.status === "OPEN" || (ep.status === "DRAFT" && new Date(ep.airAt) > new Date()))
      ?.sort((a, b) => new Date(a.airAt).getTime() - new Date(b.airAt).getTime())[0];

    featuredEpisode = season?.episodes?.find((ep) => ep.status === "OPEN") ?? null;

    if (featuredEpisode) {
      featuredQuestions = await prisma.question.count({
        where: { episodeId: featuredEpisode.id, status: "OPEN" },
      });
      const players = await prisma.prediction.groupBy({
        by: ["userId"],
        where: { question: { episodeId: featuredEpisode.id } },
      });
      featuredPlayers = players.length;
      featuredPredictions = await prisma.prediction.count({
        where: { question: { episodeId: featuredEpisode.id } },
      });

      const elimQuestion = await prisma.question.findFirst({
        where: {
          episodeId: featuredEpisode.id,
          status: "OPEN",
          type: "ELIMINATION",
        },
      });
      if (elimQuestion) {
        const pickCounts = await prisma.prediction.groupBy({
          by: ["chosenOption"],
          where: { questionId: elimQuestion.id },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
          take: 2,
        });
        const total = pickCounts.reduce((s, p) => s + p._count.id, 0);
        if (total > 0) {
          topTwoPicks = pickCounts.map((p) => ({
            name: p.chosenOption,
            pct: Math.round((p._count.id / total) * 100),
          }));
        }
      }

      if (topTwoPicks.length === 0) {
        const options = (
          await prisma.question.findFirst({
            where: { episodeId: featuredEpisode.id, status: "OPEN", type: "ELIMINATION" },
            select: { options: true },
          })
        )?.options as string[] | undefined;
        if (options && options.length >= 2) {
          topTwoPicks = [
            { name: options[0], pct: 62 },
            { name: options[1], pct: 38 },
          ];
        }
      }
    }

    totalPlayers = await prisma.user.count({ where: { role: { not: "ADMIN" } } });
    totalPredictions = await prisma.prediction.count();
    openQuestions = await prisma.question.count({ where: { status: "OPEN" } });
  } catch (err) {
    console.error("[Landing] Database unreachable:", err);
  }

  const nextEpisode = season?.episodes
    ?.filter((ep) => ep.status === "OPEN" || (ep.status === "DRAFT" && new Date(ep.airAt) > new Date()))
    ?.sort((a, b) => new Date(a.airAt).getTime() - new Date(b.airAt).getTime())[0];
  const nextEpisodeAt = nextEpisode?.airAt?.toISOString() ?? null;

  return (
    <LandingShell>
    <div className="min-h-screen">
      <LandingHero
        seasonTitle={season?.title}
        nextEpisodeAt={nextEpisodeAt}
        showSlug={season?.showSlug ?? undefined}
        currentEpisode={featuredEpisode ? `EP${featuredEpisode.number}` : undefined}
        currentEpisodeTitle={featuredEpisode?.title ?? undefined}
      />

      <div className="relative z-10 bg-studio-black">

      <FeaturedMarketPreview
        seasonTitle={season?.title}
        showSlug={season?.showSlug ?? undefined}
        episode={featuredEpisode}
        questions={featuredQuestions}
        players={featuredPlayers}
        predictions={featuredPredictions}
        topTwoPicks={topTwoPicks}
      />

      <LandingLiveBettingTeaser />

      <LandingWalletExplainer />

      {todos && todos.length > 0 && (
        <Section>
          <SectionLabel>TODOS</SectionLabel>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {todos.map((todo, i) => {
              const t = todo as Record<string, unknown>;
              return (
              <li key={(t.id as string) || `todo-${i}`}>
                {(t.title as string) ?? JSON.stringify(todo)}
              </li>
              );
            })}
          </ul>
        </Section>
      )}

      <Suspense fallback={<SocialProofSkeleton />}>
        <SocialProof
          seasonId={season?.id}
          totalPlayers={totalPlayers}
          totalPredictions={totalPredictions}
          openQuestions={openQuestions}
        />
      </Suspense>

      <LandingHowItWorks />

      <LandingEmailCapture />

      <ClosingCTA />

      <LandingFooter />

      </div>
    </div>
    </LandingShell>
  );
}

// ─── Featured Market Preview ────────────────────────────────────────

const SHOW_EMOJI: Record<string, string> = {
  survivor: "🏝️",
  bachelor: "🌹",
  "love-island": "💕",
  "big-brother": "🏠",
  traitors: "🎭",
};

function emojiForSlug(slug?: string): string {
  if (!slug) return "📺";
  for (const [key, emoji] of Object.entries(SHOW_EMOJI)) {
    if (slug.toLowerCase().includes(key)) return emoji;
  }
  return "📺";
}

function timeUntil(date: Date): string {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return "Live now";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function FeaturedMarketPreview({
  seasonTitle,
  showSlug,
  episode,
  questions,
  players,
  predictions,
  topTwoPicks,
}: {
  seasonTitle?: string;
  showSlug?: string;
  episode?: { id: string; number: number; title: string; lockAt: Date; airAt: Date; status: string } | null;
  questions: number;
  players: number;
  predictions: number;
  topTwoPicks: { name: string; pct: number }[];
}) {
  if (!episode) {
    return (
      <Section>
        <div className="mb-8 text-center">
          <SectionLabel>COMING SOON</SectionLabel>
          <SectionTitle>Featured pick round</SectionTitle>
        </div>
        <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
          <p className="text-sm text-muted-foreground">
            No live pick rounds right now. Check back when the next episode airs.
          </p>
          <Link
            href="/play"
            className="inline-flex items-center gap-1 mt-4 text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors"
          >
            Browse pick rounds <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </Section>
    );
  }

  const emoji = emojiForSlug(showSlug);

  return (
    <Section>
      <div className="mb-8 text-center">
        <SectionLabel>PREDICTIONS OPEN</SectionLabel>
        <SectionTitle>Featured pick round</SectionTitle>
      </div>

      <div className="relative p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl">{emoji}</span>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {seasonTitle} · EP{episode.number}
            </p>
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neon-cyan">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />
              {episode.status === "OPEN" ? "OPEN" : "LOCKED"}
            </span>
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
          {episode.title}
        </h3>

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <MessageSquare className="h-3.5 w-3.5" />
          {questions} question{questions !== 1 ? "s" : ""} available
        </p>

        <p className="flex items-center gap-1.5 text-[11px] text-neon-gold/70 mb-4">
          🏆 Token rewards (optional) for correct picks
        </p>

        {/* Two-outcome tension preview */}
        {topTwoPicks.length >= 2 && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 shrink-0">
              Who&apos;s out?
            </span>
            <div className="flex-1 flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-neon-cyan">
                <Flame className="h-3 w-3" />
                {topTwoPicks[0].name}
                <span className="text-neon-cyan/60 font-mono text-[11px]">{topTwoPicks[0].pct}%</span>
              </span>
              <span className="text-white/20 text-[10px]">vs</span>
              <span className="flex items-center gap-1 text-xs font-semibold text-neon-magenta">
                <Zap className="h-3 w-3" />
                {topTwoPicks[1].name}
                <span className="text-neon-magenta/60 font-mono text-[11px]">{topTwoPicks[1].pct}%</span>
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-5 text-xs text-muted-foreground border-t border-white/[0.06] pt-4 mb-5">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {players} player{players !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {timeUntil(episode.lockAt)}
          </span>
          <span className="flex items-center gap-1.5 text-neon-cyan font-bold">
            <Coins className="h-3.5 w-3.5" /> {predictions} pick{predictions !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <NeonButton
            variant="primary"
            href="/dashboard"
            className="gap-2 text-sm px-6 py-2"
          >
            Make your pick
            <ArrowRight className="h-3.5 w-3.5" />
          </NeonButton>
          <Link
            href="/play"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-neon-cyan transition-colors"
          >
            Browse pick rounds <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

// ─── Social Proof (threshold-gated) ─────────────────────────────────

const EARLY_ACCESS_THRESHOLD = 50;

async function SocialProof({
  seasonId,
  totalPlayers,
  totalPredictions,
  openQuestions,
}: {
  seasonId?: string;
  totalPlayers: number;
  totalPredictions: number;
  openQuestions: number;
}) {
  const leaderboard = seasonId ? await getTopLeaderboard(seasonId, 10) : [];
  const isEarlyAccess = totalPlayers < EARLY_ACCESS_THRESHOLD;

  return (
    <Section className="pt-0">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {isEarlyAccess ? (
            <>
              <SectionLabel>EARLY ACCESS BETA</SectionLabel>
              <SectionTitle>Be a founding player</SectionTitle>
              <p className="text-sm text-muted-foreground">
                You&apos;re early. Founding players earn bonus season points, exclusive badges, and extra token rewards.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <StatPill
                  value={totalPlayers.toString()}
                  label="Founding players"
                  live
                />
                <StatPill
                  value={openQuestions.toString()}
                  label="Open pick rounds"
                  live
                />
                <StatPill
                  value={totalPredictions.toLocaleString("en-US")}
                  label="Picks so far"
                  live
                />
              </div>
            </>
          ) : (
            <>
              <SectionLabel>Social Proof</SectionLabel>
              <SectionTitle>The community is growing</SectionTitle>
              <div className="grid grid-cols-3 gap-3">
                <StatPill
                  value={totalPlayers.toLocaleString("en-US") + "+"}
                  label="Players"
                  live
                />
                <StatPill
                  value={openQuestions.toString()}
                  label="Open pick rounds"
                  live
                />
                <StatPill
                  value={totalPredictions.toLocaleString("en-US")}
                  label="Predictions this week"
                  live
                />
              </div>
            </>
          )}
        </div>

        {leaderboard.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <LowerThird label="RANKINGS" value={isEarlyAccess ? "Top Founders" : "Top Players"} />
              <Link href="/leaderboard">
                <NeonButton variant="ghost" className="gap-1 text-xs">
                  View All <ArrowRight className="h-3 w-3" />
                </NeonButton>
              </Link>
            </div>
            <div className="grid gap-2">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <ScoreboardRow
                  key={entry.id}
                  rank={entry.rank}
                  name={entry.user.name || "Anonymous"}
                  avatar={entry.user.name?.[0]?.toUpperCase() || "?"}
                  value={entry.points}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

function SocialProofSkeleton() {
  return (
    <Section className="pt-0">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="h-4 w-24 bg-white/[0.04] rounded animate-pulse" />
          <div className="h-8 w-64 bg-white/[0.04] rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="h-6 w-16 mx-auto bg-white/[0.04] rounded animate-pulse mb-2" />
                <div className="h-3 w-12 mx-auto bg-white/[0.04] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="h-12 w-48 bg-white/[0.04] rounded-lg animate-pulse mb-4" />
          <div className="grid gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-studio-dark/60 px-4 py-3">
                <div className="h-6 w-8 bg-white/[0.04] rounded animate-pulse" />
                <div className="h-8 w-8 bg-white/[0.04] rounded-full animate-pulse" />
                <div className="flex-1"><div className="h-4 w-32 bg-white/[0.04] rounded animate-pulse" /></div>
                <div className="h-4 w-16 bg-white/[0.04] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── Closing CTA ────────────────────────────────────────────────────
function ClosingCTA() {
  return (
    <Section>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="w-[500px] h-[250px] bg-neon-cyan/5 rounded-full blur-[100px]" />
      </div>
      <div className="relative text-center">
        <h2 className="font-headline text-3xl sm:text-4xl font-extrabold uppercase tracking-tight mb-4">
          Ready to play?
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-3">
          Every episode is a pick round. Every prediction is your pick. Free to play, always.
        </p>
        <p className="text-xs text-neon-gold/60 mb-8">
          Top players earn token rewards and season perks.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <NeonButton
            variant="primary"
            href="/auth/signin"
            className="gap-1.5 text-sm px-5 py-2"
          >
            Start Predicting Free <ArrowRight className="h-3.5 w-3.5" />
          </NeonButton>
          <NeonButton variant="ghost" href="/play" className="gap-1.5 text-sm px-5 py-2">
            Browse pick rounds
          </NeonButton>
        </div>
      </div>
    </Section>
  );
}
