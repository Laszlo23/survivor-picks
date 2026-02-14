"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { completeOnboarding } from "@/lib/actions/profile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Target,
  TrendingUp,
  Shield,
  AlertTriangle,
  Zap,
  Star,
  Coins,
  Flame,
  ArrowRight,
  ArrowLeft,
  Swords,
  Eye,
  Heart,
  Check,
} from "lucide-react";

const ONBOARDING_KEY = "realitypicks_onboarded";

// ─── Step Content ────────────────────────────────────────────────────

function StepWelcome() {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <Image
          src="/logo.png"
          alt="RealityPicks"
          width={80}
          height={80}
          className="rounded-2xl"
        />
      </div>
      <h2 className="text-2xl font-bold">
        Welcome to Reality<span className="text-primary">Picks</span>
      </h2>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">
        Predict outcomes across your favorite reality TV shows. Here&apos;s how
        it works in 3 quick steps.
      </p>

      <div className="grid gap-3 mt-6 text-left">
        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">1. Make Your Picks</p>
            <p className="text-xs text-muted-foreground">
              Choose from multiple-choice questions about each episode — who
              wins, who gets eliminated, what twist happens next.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium">2. Earn Points</p>
            <p className="text-xs text-muted-foreground">
              Correct picks earn points based on difficulty. Build streaks for
              bonus points each consecutive correct episode.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium">3. Climb the Leaderboard</p>
            <p className="text-xs text-muted-foreground">
              Compete with fans worldwide. Unlock achievement badges and prove
              you know reality TV better than anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepScoring() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
            <Zap className="h-6 w-6 text-accent" />
          </div>
        </div>
        <h2 className="text-xl font-bold">Scoring &amp; Power-Ups</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Not all picks are created equal
        </p>
      </div>

      <div className="space-y-3">
        {/* Base scoring */}
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Base Points</span>
            <span className="font-mono text-sm font-bold text-primary">
              100 pts
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Every correct pick earns 100 base points, multiplied by the
            question&apos;s odds.
          </p>
        </div>

        {/* Odds */}
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Odds Multiplier
            </span>
            <span className="font-mono text-sm font-bold">
              up to 5x
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Underdog picks (+200, +300, etc.) have higher multipliers. Pick the
            longshot and earn big!
          </p>
        </div>

        {/* Risk Bet */}
        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-accent" />
              Risk Bet
            </span>
            <span className="font-mono text-sm font-bold text-accent">
              1.5x
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Toggle on for any pick. Correct = 1.5x bonus. Wrong = 0 points. High
            risk, high reward.
          </p>
        </div>

        {/* Immunity Joker */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Immunity Joker
            </span>
            <span className="font-mono text-sm font-bold text-primary">
              3 / season
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Protect a pick. Even if wrong, you still get 100 base points. Use
            wisely — only 3 per season!
          </p>
        </div>

        {/* Streaks */}
        <div className="p-3 rounded-lg bg-secondary/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Streak Bonus
            </span>
            <span className="font-mono text-sm font-bold text-amber-400">
              +25 pts/ep
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Get at least one pick correct each episode to build a streak. Each
            consecutive episode adds +25 bonus points.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepTokens() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/20">
            <Coins className="h-6 w-6 text-violet-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold">$PICKS Token (Optional)</h2>
        <p className="text-muted-foreground text-sm mt-1">
          An on-chain layer for power users — totally optional
        </p>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/20 to-fuchsia-900/20 border border-violet-800/30">
        <p className="text-sm text-muted-foreground mb-4">
          RealityPicks is <strong className="text-foreground">free to play</strong>.
          The $PICKS token on Base adds optional perks for crypto-native users:
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Star className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Stake for Boost</p>
              <p className="text-xs text-muted-foreground">
                Lock $PICKS to earn up to 1.5x multiplier on all predictions
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">NFT Badges</p>
              <p className="text-xs text-muted-foreground">
                Collect on-chain achievement badges that prove your prediction
                skills
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Star className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Season Pass</p>
              <p className="text-xs text-muted-foreground">
                Burn $PICKS for a premium Season Pass NFT with exclusive perks
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        You can explore $PICKS later from your profile. No wallet needed to play!
      </p>
    </div>
  );
}

function StepShows() {
  const shows = [
    {
      name: "Survivor 50",
      icon: Swords,
      color: "bg-emerald-500/20 text-emerald-400",
      desc: "The ultimate survival competition",
    },
    {
      name: "The Traitors US",
      icon: Eye,
      color: "bg-red-500/20 text-red-400",
      desc: "Trust no one. Season 4 is live.",
    },
    {
      name: "The Bachelor",
      icon: Heart,
      color: "bg-pink-500/20 text-pink-400",
      desc: "Predict every rose ceremony",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
            <Check className="h-6 w-6 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-bold">You&apos;re All Set!</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Pick a show and start making predictions
        </p>
      </div>

      <div className="space-y-3">
        {shows.map((show) => (
          <div
            key={show.name}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${show.color}`}
            >
              <show.icon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{show.name}</p>
              <p className="text-xs text-muted-foreground">{show.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-2">
        More shows are added every season. Stay tuned!
      </p>
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────

const STEPS = [StepWelcome, StepScoring, StepTokens, StepShows] as const;
const STEP_LABELS = ["Welcome", "Scoring", "$PICKS", "Get Started"];

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Check if user has already completed onboarding
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      // Small delay so the dashboard loads first
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = async () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
    // Also persist to DB (fire-and-forget)
    completeOnboarding().catch(() => {});
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const StepComponent = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleComplete(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to RealityPicks</DialogTitle>
        </DialogHeader>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? "w-6 bg-primary"
                  : i < step
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-muted-foreground/20"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="py-2">
          <StepComponent />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComplete}
                className="text-muted-foreground"
              >
                Skip
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {step + 1}/{STEPS.length}
            </span>
            <Button size="sm" onClick={handleNext} className="gap-1">
              {step === STEPS.length - 1 ? "Let's Go!" : "Next"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
