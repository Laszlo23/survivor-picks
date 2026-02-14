export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trophy,
  Target,
  Shield,
  Zap,
  Users,
  ArrowRight,
  TrendingUp,
  Tv,
  Eye,
  Heart,
  Swords,
  Star,
  ChevronRight,
} from "lucide-react";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getTopLeaderboard } from "@/lib/actions/leaderboard";

// ─── Live Show Data ──────────────────────────────────────────────────

const liveShows = [
  {
    slug: "survivor-50",
    name: "Survivor 50",
    network: "CBS",
    tagline: "The ultimate test of will. 50 seasons of legacy.",
    categories: ["Immunity", "Elimination", "Alliances", "Idols"],
    gradient: "from-emerald-900/40 to-green-900/40",
    border: "border-emerald-700/30",
    badge: "bg-emerald-500/20 text-emerald-400",
    icon: Swords,
    status: "Premieres Feb 25",
  },
  {
    slug: "the-traitors-s4",
    name: "The Traitors US",
    network: "Peacock",
    tagline: "Trust no one. Season 4 is live now.",
    categories: ["Murder", "Banishment", "Missions", "Reveals"],
    gradient: "from-red-900/40 to-rose-900/40",
    border: "border-red-700/30",
    badge: "bg-red-500/20 text-red-400",
    icon: Eye,
    status: "Airing Now",
  },
  {
    slug: "the-bachelor",
    name: "The Bachelor",
    network: "ABC",
    tagline: "Will love prevail? Predict every rose ceremony.",
    categories: ["Rose Ceremony", "Group Date", "1-on-1", "Drama"],
    gradient: "from-pink-900/40 to-fuchsia-900/40",
    border: "border-pink-700/30",
    badge: "bg-pink-500/20 text-pink-400",
    icon: Heart,
    status: "Winter 2026",
  },
];

export default async function LandingPage() {
  const season = await getActiveSeason();
  const leaderboard = season ? await getTopLeaderboard(season.id, 10) : [];

  return (
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(270_40%_15%/0.3)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <Image
                src="/logo.png"
                alt="RealityPicks"
                width={96}
                height={96}
                className="rounded-2xl shadow-2xl shadow-primary/20"
                priority
              />
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Tv className="h-4 w-4" />
              {season
                ? `${liveShows.length} shows live — ${season.title}`
                : `${liveShows.length} shows ready for predictions`}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Predict Reality.{" "}
              <span className="text-primary">Win Glory.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
              Pick winners, call eliminations, spot twists before they happen
              across Survivor, The Traitors, The Bachelor, and more. Earn
              points, build streaks, and climb the leaderboard. Free to play.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="gap-2 text-base px-8">
                  Start Predicting
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 text-base px-8"
                >
                  <Trophy className="h-4 w-4" />
                  View Leaderboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Shows ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Shows You Can Predict Right Now
          </h2>
          <p className="text-muted-foreground mt-2">
            Pick a show, make your picks, and compete with fans worldwide
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {liveShows.map((show) => (
            <Card
              key={show.slug}
              className={`bg-gradient-to-br ${show.gradient} ${show.border} overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${show.badge}`}
                    >
                      <show.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{show.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {show.network}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs font-medium px-2 py-1 rounded-full ${show.badge}`}
                  >
                    {show.status}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {show.tagline}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {show.categories.map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] sm:text-xs bg-white/5 border border-white/10 rounded-md px-2 py-0.5"
                    >
                      {cat}
                    </span>
                  ))}
                </div>

                <Link href="/dashboard">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  >
                    Start Predicting
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-2xl sm:text-3xl font-bold mb-12">
          How It Works
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Target,
              title: "Make Picks",
              desc: "Choose a show and predict outcomes — winners, eliminations, twists, and more.",
            },
            {
              icon: TrendingUp,
              title: "Earn Points",
              desc: "Harder predictions pay more. Use Risk Bets for a 1.5x multiplier.",
            },
            {
              icon: Shield,
              title: "Immunity Joker",
              desc: "3 per season. Protect a wrong pick and still earn base points.",
            },
            {
              icon: Trophy,
              title: "Climb Ranks",
              desc: "Build streaks for bonus points. Unlock badges. Top the leaderboard.",
            },
          ].map((item) => (
            <Card key={item.title} className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Scoring Preview ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-2xl border border-border/50 bg-card/30 p-4 sm:p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="h-6 w-6 text-accent" />
                Scoring System
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">
                    Base correct pick
                  </span>
                  <span className="font-mono font-bold">100 pts</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">
                    Odds multiplier (+150)
                  </span>
                  <span className="font-mono font-bold">&times; 2.5</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Risk Bet bonus</span>
                  <span className="font-mono font-bold text-accent">
                    &times; 1.5
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">
                    Joker save (wrong pick)
                  </span>
                  <span className="font-mono font-bold text-primary">
                    100 pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Streak bonus (per ep)
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    +25 pts
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Example Pick
              </h2>
              <Card className="bg-secondary/50 border-border/30">
                <CardContent className="pt-6 space-y-2 text-sm">
                  <p>
                    <span className="text-muted-foreground">Question:</span>{" "}
                    &ldquo;Who wins the immunity challenge?&rdquo;
                  </p>
                  <p>
                    <span className="text-muted-foreground">Your pick:</span>{" "}
                    <strong>Jay</strong> at{" "}
                    <span className="text-primary font-bold">+200</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Risk Bet:</span>{" "}
                    <span className="text-accent font-bold">ON</span>
                  </p>
                  <div className="border-t border-border/30 pt-2 mt-3">
                    <p className="text-xs text-muted-foreground">
                      If correct:
                    </p>
                    <p className="text-lg font-bold text-primary">
                      100 &times; 3.0 &times; 1.5 = 450 pts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── On-Chain / $PICKS Teaser ─────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-2xl bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 border border-violet-800/30 p-4 sm:p-8 md:p-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20">
              <Star className="h-6 w-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Powered by $PICKS on Base
              </h2>
              <p className="text-sm text-muted-foreground">
                Optional on-chain layer for staking, NFT badges, and Season
                Passes
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-black/20 rounded-xl">
              <p className="text-sm font-medium text-violet-300 mb-1">
                Stake &amp; Boost
              </p>
              <p className="text-xs text-muted-foreground">
                Lock $PICKS to earn up to 1.5x prediction multiplier and
                staking rewards.
              </p>
            </div>
            <div className="p-4 bg-black/20 rounded-xl">
              <p className="text-sm font-medium text-violet-300 mb-1">
                NFT Badges
              </p>
              <p className="text-xs text-muted-foreground">
                Collect on-chain achievement badges as you play. Some are
                tradeable.
              </p>
            </div>
            <div className="p-4 bg-black/20 rounded-xl">
              <p className="text-sm font-medium text-violet-300 mb-1">
                Deflationary
              </p>
              <p className="text-xs text-muted-foreground">
                3% prediction fees go to buyback &amp; burn. Season Pass
                purchases burn tokens permanently.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/token">
              <Button variant="outline" className="gap-2">
                Learn About $PICKS
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/staking">
              <Button variant="ghost" className="gap-2 text-violet-400">
                Start Staking
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Leaderboard Preview ──────────────────────────────────────── */}
      {leaderboard.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-400" />
              Top Players
            </h2>
            <Link href="/leaderboard">
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-2">
            {leaderboard.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-4 rounded-lg border border-border/30 bg-card/30 px-4 py-3"
              >
                <span
                  className={`text-lg font-bold w-8 text-center ${
                    entry.rank === 1
                      ? "text-amber-400"
                      : entry.rank === 2
                      ? "text-gray-400"
                      : entry.rank === 3
                      ? "text-amber-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {entry.rank}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold">
                  {entry.user.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {entry.user.name || "Anonymous"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.correctCount}/{entry.totalCount} correct
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold font-mono text-primary">
                    {entry.points.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ))}
            {leaderboard.length > 5 && (
              <div className="relative">
                {leaderboard.slice(5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-4 rounded-lg border border-border/30 bg-card/30 px-4 py-3 blur-sm"
                  >
                    <span className="text-lg font-bold w-8 text-center text-muted-foreground">
                      {entry.rank}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium">Player</p>
                    </div>
                    <p className="font-bold font-mono">---</p>
                  </div>
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link href="/dashboard">
                    <Button className="gap-2">
                      Sign In to See More
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="RealityPicks"
                width={24}
                height={24}
                className="rounded"
              />
              <span>
                RealityPicks — A free prediction game. No real money involved.
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/token"
                className="hover:text-foreground transition-colors"
              >
                $PICKS
              </Link>
              <Link
                href="/leaderboard"
                className="hover:text-foreground transition-colors"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
