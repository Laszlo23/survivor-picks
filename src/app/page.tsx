import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Users, Clock, Coins, MessageSquare } from "lucide-react";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getTopLeaderboard } from "@/lib/actions/leaderboard";
import { prisma } from "@/lib/prisma";
import { LandingHero } from "@/components/landing/hero";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingEmailCapture } from "@/components/landing/email-capture";
import { LandingFooter } from "@/components/landing/footer";
import { LandingShell } from "@/components/landing/landing-shell";
import { NeonButton } from "@/components/ui/neon-button";
import { LowerThird } from "@/components/ui/lower-third";
import { ScoreboardRow } from "@/components/ui/scoreboard-row";
import { Section, SectionLabel, SectionTitle, StatPill } from "@/components/ui/primitives";

export const revalidate = 60;

export default async function LandingPage() {
  const season = await getActiveSeason();

  const nextEpisode = season?.episodes
    ?.filter((ep) => ep.status === "OPEN" || (ep.status === "DRAFT" && new Date(ep.airAt) > new Date()))
    ?.sort((a, b) => new Date(a.airAt).getTime() - new Date(b.airAt).getTime())[0];

  const nextEpisodeAt = nextEpisode?.airAt?.toISOString() ?? null;

  // Featured market: first OPEN episode
  const featuredEpisode = season?.episodes?.find((ep) => ep.status === "OPEN");
  let featuredQuestions = 0;
  let featuredPlayers = 0;
  let featuredPredictions = 0;
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
  }

  // Stats
  const totalPlayers = await prisma.user.count();
  const totalPredictions = await prisma.prediction.count();
  const openQuestions = await prisma.question.count({ where: { status: "OPEN" } });

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
      />

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
}: {
  seasonTitle?: string;
  showSlug?: string;
  episode?: { id: string; number: number; title: string; lockAt: Date; airAt: Date; status: string } | null;
  questions: number;
  players: number;
  predictions: number;
}) {
  if (!episode) {
    return (
      <Section>
        <div className="mb-8 text-center">
          <SectionLabel>COMING SOON</SectionLabel>
          <SectionTitle>Featured Market</SectionTitle>
        </div>
        <div className="p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center">
          <p className="text-sm text-muted-foreground">
            No live markets right now. Check back when the next episode airs.
          </p>
          <Link
            href="/play"
            className="inline-flex items-center gap-1 mt-4 text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors"
          >
            View all markets <ArrowRight className="h-3 w-3" />
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
        <SectionTitle>Featured Market</SectionTitle>
      </div>

      <div className="relative p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
        {/* Header */}
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

        {/* Episode title */}
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
          {episode.title}
        </h3>

        {/* Question count */}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
          <MessageSquare className="h-3.5 w-3.5" />
          {questions} prediction{questions !== 1 ? "s" : ""} available
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-5 text-xs text-muted-foreground border-t border-white/[0.06] pt-4 mb-5">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {players} player{players !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {timeUntil(episode.lockAt)}
          </span>
          <span className="flex items-center gap-1.5 text-neon-cyan font-bold">
            <Coins className="h-3.5 w-3.5" /> {predictions} prediction{predictions !== 1 ? "s" : ""}
          </span>
        </div>

        {/* CTA row */}
        <div className="flex items-center justify-between">
          <NeonButton
            variant="primary"
            href="/dashboard"
            className="gap-2 text-sm px-6 py-2"
          >
            Predict Now
            <ArrowRight className="h-3.5 w-3.5" />
          </NeonButton>
          <Link
            href="/play"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-neon-cyan transition-colors"
          >
            View all markets <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

// ─── Social Proof ───────────────────────────────────────────────────
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

  return (
    <Section className="pt-0">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Stats */}
        <div className="space-y-4">
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
              label="Open markets"
              live
            />
            <StatPill
              value={totalPredictions.toLocaleString("en-US")}
              label="Predictions"
              live
            />
          </div>
        </div>

        {/* Leaderboard preview */}
        {leaderboard.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <LowerThird label="RANKINGS" value="Top Players" />
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
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-8">
          Every episode is a market. Every prediction is a position. Free to play, always.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <NeonButton
            variant="primary"
            href="/auth/signin"
            className="gap-2 text-base px-10 py-3 shadow-[0_0_40px_hsl(185_100%_55%/0.3)]"
          >
            Start Predicting Free <ArrowRight className="h-4 w-4" />
          </NeonButton>
          <NeonButton variant="ghost" href="/play" className="gap-2 text-base px-8 py-3">
            Browse Markets
          </NeonButton>
        </div>
      </div>
    </Section>
  );
}
