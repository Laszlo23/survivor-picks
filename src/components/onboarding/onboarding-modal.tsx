"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  ArrowRight,
  ArrowLeft,
  Check,
  Wallet,
} from "lucide-react";

const ONBOARDING_KEY = "realitypicks_onboarded";

// ─── Animation variants ──────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

// ─── Step Content ────────────────────────────────────────────────────

function StepWelcome() {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <div className="relative">
          <Image
            src="/pickslogoicon.png"
            alt="RealityPicks"
            width={72}
            height={72}
            className="rounded-2xl relative z-10"
            style={{ mixBlendMode: "screen" }}
          />
          <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-2xl scale-150" />
        </div>
      </div>
      <h2 className="text-2xl font-display font-bold">
        Welcome to Reality<span className="text-primary">Picks</span>
      </h2>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">
        Predict outcomes across your favorite reality TV shows. Here&apos;s how
        it works in 3 quick steps.
      </p>

      <div className="grid gap-3 mt-6 text-left">
        {[
          { icon: Target, color: "bg-primary/15 border-primary/20", iconColor: "text-primary", title: "1. Make Your Picks", desc: "Choose from questions about each episode \u2014 who wins, who\u2019s eliminated, what twist happens next." },
          { icon: Zap, color: "bg-amber-500/15 border-amber-500/20", iconColor: "text-amber-400", title: "2. Earn Points", desc: "Correct picks earn points based on difficulty. Higher risk picks pay more." },
          { icon: TrendingUp, color: "bg-neon-cyan/15 border-neon-cyan/20", iconColor: "text-neon-cyan", title: "3. Climb the Leaderboard", desc: "Compete with fans worldwide. Top players earn $PICKS token rewards." },
        ].map((item) => (
          <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.color} border`}>
              <item.icon className={`h-4 w-4 ${item.iconColor}`} />
            </div>
            <div>
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepScoring() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 border border-accent/20">
            <Zap className="h-6 w-6 text-accent" />
          </div>
        </div>
        <h2 className="text-xl font-display font-bold">Scoring &amp; Power-Ups</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Not all picks are created equal
        </p>
      </div>

      <div className="space-y-2">
        {[
          { icon: null, title: "Base Points", value: "100 pts", valueColor: "text-primary", desc: "Every correct pick earns 100 base points, multiplied by the question\u2019s odds.", bg: "" },
          { icon: TrendingUp, title: "Odds Multiplier", value: "up to 5x", valueColor: "", desc: "Underdog picks have higher multipliers. Pick the longshot and earn big!", bg: "" },
          { icon: AlertTriangle, title: "Risk Bet", value: "1.5x", valueColor: "text-accent", desc: "Correct = 1.5x bonus. Wrong = 0 points. High risk, high reward.", bg: "border-accent/15" },
          { icon: Coins, title: "$PICKS Staking", value: "optional", valueColor: "text-neon-gold", desc: "Stake $PICKS tokens on your picks for extra rewards. 100% free to play without tokens.", bg: "" },
        ].map((item) => (
          <div key={item.title} className={`p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] ${item.bg}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium flex items-center gap-1.5">
                {item.icon && <item.icon className={`h-3.5 w-3.5 ${item.valueColor}`} />}
                {item.title}
              </span>
              <span className={`font-mono text-sm font-bold ${item.valueColor}`}>{item.value}</span>
            </div>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepTokens() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
            <Coins className="h-6 w-6 text-violet-400" />
          </div>
        </div>
        <h2 className="text-xl font-display font-bold">$PICKS Token (Optional)</h2>
        <p className="text-muted-foreground text-sm mt-1">
          An on-chain layer for power users \u2014 totally optional
        </p>
      </div>

      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-950/30 to-fuchsia-950/20 border border-violet-500/15">
        <p className="text-sm text-muted-foreground mb-4">
          RealityPicks is <strong className="text-foreground">free to play</strong>.
          The $PICKS token on Base adds optional perks:
        </p>

        <div className="space-y-3">
          {[
            { title: "Stake on Picks", desc: "Put $PICKS behind your predictions for bigger potential rewards" },
            { title: "Buy with Card", desc: "Purchase $PICKS easily via Stripe \u2014 no crypto wallet needed" },
            { title: "On-Chain at Launch", desc: "$PICKS converts 1:1 to a real token on Base at fair launch" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <Star className="h-4 w-4 text-violet-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Friendly wallet explainer */}
      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <div className="flex items-start gap-3">
          <Wallet className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">What&apos;s a wallet?</p>
            <p className="text-xs text-muted-foreground">
              Think of it like a digital pocket for your tokens.{" "}
              <a href="https://metamask.io" target="_blank" className="text-blue-400 hover:underline">
                MetaMask
              </a>{" "}
              and{" "}
              <a href="https://www.coinbase.com/wallet" target="_blank" className="text-blue-400 hover:underline">
                Coinbase Wallet
              </a>{" "}
              are popular free options. No wallet needed to play!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepShows() {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex justify-center mb-3">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/20"
          >
            <Check className="h-6 w-6 text-primary" />
          </motion.div>
        </div>
        <h2 className="text-xl font-display font-bold">You&apos;re All Set!</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Head to the Markets page to start making picks
        </p>
      </div>

      <div className="space-y-3 mt-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-neon-cyan/5 border border-primary/20 text-center">
          <p className="text-sm font-medium mb-1">You got <span className="text-neon-gold font-bold">33,333 $PICKS</span> to start</p>
          <p className="text-xs text-muted-foreground">Use them to stake on your predictions and earn rewards</p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: Target, label: "Make Picks", color: "text-primary" },
            { icon: TrendingUp, label: "Earn Points", color: "text-neon-cyan" },
            { icon: Star, label: "Win Rewards", color: "text-neon-gold" },
          ].map((item) => (
            <div key={item.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <item.icon className={`h-5 w-5 mx-auto mb-1 ${item.color}`} />
              <p className="text-[10px] font-medium text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-2">
        New shows and markets are added every season
      </p>
    </div>
  );
}

// ─── Main Modal ──────────────────────────────────────────────────────

const STEPS = [StepWelcome, StepScoring, StepTokens, StepShows] as const;

export function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = async () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
    completeOnboarding().catch(() => {});
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const StepComponent = STEPS[step];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleComplete(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto border-white/[0.08]">
        <DialogHeader className="sr-only">
          <DialogTitle>Welcome to RealityPicks</DialogTitle>
        </DialogHeader>

        {/* Animated progress bar */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > step ? 1 : -1);
                setStep(i);
              }}
              className="relative h-1.5 rounded-full transition-all overflow-hidden"
              style={{ width: i === step ? 24 : 6 }}
            >
              <div className={`absolute inset-0 rounded-full transition-colors ${
                i <= step ? "bg-primary" : "bg-muted-foreground/20"
              }`} />
              {i === step && (
                <motion.div
                  layoutId="onboarding-progress"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Step content with slide animation */}
        <div className="py-2 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
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
            <Button size="sm" onClick={handleNext} className="gap-1 shadow-glow">
              {step === STEPS.length - 1 ? "Let's Go!" : "Next"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
