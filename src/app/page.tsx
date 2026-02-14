export const dynamic = "force-dynamic";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Flame,
  Trophy,
  Target,
  Shield,
  Zap,
  Users,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { getActiveSeason } from "@/lib/actions/episodes";
import { getTopLeaderboard } from "@/lib/actions/leaderboard";

export default async function LandingPage() {
  const season = await getActiveSeason();
  const leaderboard = season ? await getTopLeaderboard(season.id, 10) : [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:py-32">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Flame className="h-4 w-4" />
              {season ? `${season.title} is live` : "Coming Soon"}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Predict. Compete.{" "}
              <span className="text-primary">Survive.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Pick challenge winners, call eliminations, spot twists before they
              happen. Earn points, build streaks, and climb the leaderboard.
              No real money — just bragging rights and glory.
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

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-center text-3xl font-bold mb-12">How It Works</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Target,
              title: "Make Picks",
              desc: "Predict challenge winners, eliminations, and twists each episode.",
            },
            {
              icon: TrendingUp,
              title: "Earn Points",
              desc: "Harder predictions pay more. Use Risk Bets for 1.5x multiplier.",
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

      {/* Scoring Preview */}
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
                  <span className="text-muted-foreground">Base correct pick</span>
                  <span className="font-mono font-bold">100 pts</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Odds multiplier (+150)</span>
                  <span className="font-mono font-bold">× 2.5</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Risk Bet bonus</span>
                  <span className="font-mono font-bold text-accent">× 1.5</span>
                </div>
                <div className="flex justify-between border-b border-border/30 pb-2">
                  <span className="text-muted-foreground">Joker save (wrong pick)</span>
                  <span className="font-mono font-bold text-primary">100 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Streak bonus (per ep)</span>
                  <span className="font-mono font-bold text-amber-400">+25 pts</span>
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
                    <p className="text-xs text-muted-foreground">If correct:</p>
                    <p className="text-lg font-bold text-primary">
                      100 × 3.0 × 1.5 = 450 pts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
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

      {/* Footer */}
      <footer className="border-t border-border/30 mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            SurvivorPicks — A free prediction game. No real money involved.
          </p>
        </div>
      </footer>
    </div>
  );
}
