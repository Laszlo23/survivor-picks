import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getTopLeaderboard } from "@/lib/actions/leaderboard";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeaturedMarkets } from "@/components/landing/featured-markets";
import { LandingDiscordCTA } from "@/components/landing/discord-cta";
import { LandingHowItWorks } from "@/components/landing/how-it-works";
import { LandingWhyPicks } from "@/components/landing/why-picks";
import { LandingNFTPreview } from "@/components/landing/nft-badges-preview";
import { LandingSneakPeek } from "@/components/landing/sneak-peek";
import { LandingCommunity } from "@/components/landing/community";
import { LandingCommunityVote } from "@/components/landing/community-vote";
import { LandingEmailCapture } from "@/components/landing/email-capture";
import { LandingClosingCTA } from "@/components/landing/closing-cta";
import { LandingFooter } from "@/components/landing/footer";
import { LandingShell } from "@/components/landing/landing-shell";
import { NeonButton } from "@/components/ui/neon-button";
import { LowerThird } from "@/components/ui/lower-third";
import { ScoreboardRow } from "@/components/ui/scoreboard-row";

export const revalidate = 60;

export default async function LandingPage() {
  const season = await getActiveSeason();

  return (
    <LandingShell>
    <div className="min-h-screen">
      <LandingHero seasonTitle={season?.title} />

      {/* Everything after the hero gets a solid bg so it scrolls over the fixed hero video */}
      <div className="relative z-10 bg-studio-black">

      {/* 1. Featured Shows / Markets */}
      <LandingFeaturedMarkets />

      {/* 2. Discord CTA banner */}
      <LandingDiscordCTA />

      {/* 3. How It Works */}
      <LandingHowItWorks />

      {/* 4. Why $PICKS — 6 feature cards + Trust & Safety */}
      <LandingWhyPicks />

      {/* 5. NFT Badges */}
      <LandingNFTPreview />

      {/* 6. Leaderboard Preview */}
      <Suspense fallback={<LeaderboardSkeleton />}>
        <LeaderboardPreview seasonId={season?.id} />
      </Suspense>

      {/* 7. Sneak Peek — App screenshots */}
      <LandingSneakPeek />

      {/* 8. Community — OG Crew + Social links */}
      <LandingCommunity />

      {/* 9. Community Vote */}
      <LandingCommunityVote />

      {/* 10. Email Capture */}
      <LandingEmailCapture />

      {/* 11. Closing CTA */}
      <LandingClosingCTA />

      {/* 12. Footer */}
      <LandingFooter />

      </div>{/* end solid bg wrapper */}
    </div>
    </LandingShell>
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
