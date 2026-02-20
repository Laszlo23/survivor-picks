import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getTopLeaderboard } from "@/lib/actions/leaderboard";
import { LandingHero } from "@/components/landing/hero";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingEmailCapture } from "@/components/landing/email-capture";
import { LandingFooter } from "@/components/landing/footer";
import { LandingShell } from "@/components/landing/landing-shell";
import { NeonButton } from "@/components/ui/neon-button";
import { LowerThird } from "@/components/ui/lower-third";
import { ScoreboardRow } from "@/components/ui/scoreboard-row";

export const revalidate = 60;

export default async function LandingPage() {
  const season = await getActiveSeason();

  const nextEpisodeAt = season?.episodes
    ?.filter((ep) => new Date(ep.airAt) > new Date())
    ?.sort((a, b) => new Date(a.airAt).getTime() - new Date(b.airAt).getTime())[0]
    ?.airAt?.toISOString() ?? null;

  return (
    <LandingShell>
    <div className="min-h-screen">
      <LandingHero seasonTitle={season?.title} nextEpisodeAt={nextEpisodeAt} />

      <div className="relative z-10 bg-studio-black">

      {/* One Featured Live Market */}
      <FeaturedMarketPreview />

      {/* Social Proof */}
      <Suspense fallback={<SocialProofSkeleton />}>
        <SocialProof seasonId={season?.id} />
      </Suspense>

      {/* How It Works */}
      <LandingHowItWorks />

      {/* Email Capture */}
      <LandingEmailCapture />

      {/* Closing CTA */}
      <ClosingCTA />

      <LandingFooter />

      </div>
    </div>
    </LandingShell>
  );
}

// ─── Featured Market Preview (single highlight card) ───────────────
function FeaturedMarketPreview() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-16 pb-8">
      <div className="mb-8 text-center">
        <p className="text-[10px] uppercase tracking-widest text-neon-cyan/60 font-bold mb-2">LIVE NOW</p>
        <h2 className="font-headline text-2xl sm:text-3xl font-extrabold uppercase text-white">
          Featured Market
        </h2>
      </div>

      <Link href="/play" className="block group">
        <div className="relative p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-neon-cyan/20 hover:bg-white/[0.04] transition-all">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🏝️</span>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Survivor S47 · EP7</p>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neon-cyan">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />
                LIVE
              </span>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 group-hover:text-neon-cyan transition-colors">
            Who Gets Voted Off Episode 7?
          </h3>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>18 players</span>
            <span>2h 15m left</span>
            <span className="text-neon-cyan font-bold">1,250 pool</span>
          </div>
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-1 text-sm text-muted-foreground group-hover:text-neon-cyan transition-colors">
            View all markets <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </section>
  );
}

// ─── Social Proof (async — leaderboard preview + stats) ────────────
async function SocialProof({ seasonId }: { seasonId?: string }) {
  const leaderboard = seasonId ? await getTopLeaderboard(seasonId, 10) : [];

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Stats */}
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-neon-cyan/60 font-bold">Social Proof</p>
          <h2 className="font-headline text-2xl font-extrabold uppercase text-white">
            The community is growing
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "3,333+", label: "Players" },
              { value: "33", label: "Markets" },
              { value: "333K", label: "Predictions" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <p className="text-xl font-bold font-mono text-neon-cyan">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
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
    </section>
  );
}

function SocialProofSkeleton() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
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
    </section>
  );
}

// ─── Closing CTA (lightweight) ─────────────────────────────────────
function ClosingCTA() {
  return (
    <section className="relative mx-auto max-w-4xl px-4 py-20">
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
    </section>
  );
}
