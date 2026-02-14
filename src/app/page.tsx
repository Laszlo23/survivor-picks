import { Suspense } from "react";
import Link from "next/link";
import {
  Trophy,
  Zap,
  Users,
  ArrowRight,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getTopLeaderboard } from "@/lib/actions/leaderboard";
import { LandingHero } from "@/components/landing/hero";
import { LandingShows } from "@/components/landing/shows";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingFooter } from "@/components/landing/footer";
import { NeonButton } from "@/components/ui/neon-button";
import { LowerThird } from "@/components/ui/lower-third";
import { ScoreboardRow } from "@/components/ui/scoreboard-row";

// Dynamic because DB queries run at request time
export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // Only fetch season title for the hero — lightweight
  const season = await getActiveSeason();

  return (
    <div className="min-h-screen">
      <LandingHero seasonTitle={season?.title} />

      {/* Everything after the hero gets a solid bg so it scrolls over the fixed hero image */}
      <div className="relative z-10 bg-studio-black">
      <LandingShows />
      <LandingHowItWorks />

      {/* ── Scoring Scoreboard ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-10">
          <LowerThird label="SCORING" value="How Points Work" />
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-studio-dark/60 backdrop-blur-xl overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-2">
            {/* Left: Scoring rows */}
            <div className="border-l-[3px] border-l-neon-cyan p-4 sm:p-8">
              <h3 className="font-headline text-xl font-bold uppercase tracking-wide text-white mb-5 flex items-center gap-2">
                <Zap className="h-5 w-5 text-neon-cyan" />
                Point Breakdown
              </h3>
              <div className="space-y-1">
                {[
                  { label: "Base correct pick", value: "100 pts", accent: "" },
                  { label: "Odds multiplier (+150)", value: "× 2.5", accent: "" },
                  { label: "Risk Bet bonus", value: "× 1.5", accent: "text-neon-magenta" },
                  { label: "Joker save (wrong pick)", value: "100 pts", accent: "text-neon-cyan" },
                  { label: "Streak bonus (per ep)", value: "+25 pts", accent: "text-neon-gold" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b border-white/[0.04] py-3 last:border-0"
                  >
                    <span className="text-sm text-white/70">{item.label}</span>
                    <span className={`font-mono text-sm font-bold ${item.accent || "text-neon-cyan"}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Example Pick */}
            <div className="relative p-4 sm:p-8 bg-gradient-to-br from-neon-cyan/[0.03] to-neon-magenta/[0.03]">
              <h3 className="font-headline text-xl font-bold uppercase tracking-wide text-white mb-5 flex items-center gap-2">
                <Users className="h-5 w-5 text-neon-magenta" />
                Example Pick
              </h3>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Question:</span>{" "}
                  &ldquo;Who wins the immunity challenge?&rdquo;
                </p>
                <p>
                  <span className="text-muted-foreground">Your pick:</span>{" "}
                  <strong>Jay</strong> at{" "}
                  <span className="text-neon-cyan font-bold">+200</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Risk Bet:</span>{" "}
                  <span className="text-neon-magenta font-bold">ON</span>
                </p>
                <div className="border-t border-white/[0.06] pt-3 mt-3">
                  <p className="text-xs text-muted-foreground">If correct:</p>
                  <p className="font-headline text-3xl font-bold text-gradient-cyan">
                    100 &times; 3.0 &times; 1.5 = 450 pts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── $PICKS Token Teaser ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-950/40 via-studio-dark/60 to-fuchsia-950/40 backdrop-blur-xl p-4 sm:p-8 md:p-12 relative overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-[100px]" />

          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-500/30 animate-pulse-neon">
                <Coins className="h-7 w-7 text-violet-400" />
              </div>
              <div>
                <h2 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-wide">
                  Powered by{" "}
                  <span className="text-gradient-cyan">$PICKS</span>{" "}
                  on Base
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Optional on-chain layer for staking, NFT badges, and Season Passes
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Stake & Boost",
                  desc: "Lock $PICKS to earn up to 1.5x prediction multiplier and staking rewards.",
                  color: "text-neon-cyan",
                  border: "border-l-neon-cyan",
                },
                {
                  title: "NFT Badges",
                  desc: "Collect on-chain achievement badges as you play. Some are tradeable.",
                  color: "text-neon-magenta",
                  border: "border-l-neon-magenta",
                },
                {
                  title: "Deflationary",
                  desc: "3% prediction fees go to buyback & burn. Season Passes burn tokens permanently.",
                  color: "text-neon-gold",
                  border: "border-l-neon-gold",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] border-l-[3px] ${item.border} hover:bg-white/[0.06] transition-colors`}
                >
                  <p className={`text-sm font-headline font-semibold uppercase tracking-wide ${item.color} mb-2`}>
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <NeonButton variant="primary" href="/token" className="gap-2">
                Learn About $PICKS
                <ArrowRight className="h-4 w-4" />
              </NeonButton>
              <NeonButton variant="ghost" href="/staking" className="gap-2">
                Start Staking
                <ArrowRight className="h-4 w-4" />
              </NeonButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Leaderboard Preview (loaded via Suspense) ─────────────────── */}
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardPreview seasonId={season?.id} />
      </Suspense>

      <LandingFooter />
      </div>{/* end solid bg wrapper */}
    </div>
  );
}

// ─── Leaderboard Preview (async component, streamed in via Suspense) ──
async function LeaderboardPreview({ seasonId }: { seasonId?: string }) {
  if (!seasonId) return null;

  const leaderboard = await getTopLeaderboard(seasonId, 10);
  if (leaderboard.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-center justify-between mb-8">
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
    </section>
  );
}

// ─── Skeleton shown while leaderboard streams in ─────────────────────
function LeaderboardSkeleton() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <div className="flex items-center justify-between mb-8">
        <div className="h-12 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
        <div className="h-8 w-20 bg-white/[0.04] rounded-lg animate-pulse" />
      </div>
      <div className="grid gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-studio-dark/60 px-4 py-3"
          >
            <div className="h-6 w-8 bg-white/[0.04] rounded animate-pulse" />
            <div className="h-8 w-8 bg-white/[0.04] rounded-full animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-32 bg-white/[0.04] rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-white/[0.04] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}
