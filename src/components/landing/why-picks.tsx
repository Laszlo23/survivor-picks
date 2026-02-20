"use client";

import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import {
  Tv,
  TrendingUp,
  Shield,
  Award,
  Hexagon,
  Flame,
} from "lucide-react";

const features = [
  {
    icon: Tv,
    title: "Reality TV, Gamified",
    items: [
      '"Risk Bets" for bigger multipliers (skill-based)',
      "Earn points, build streaks, climb the leaderboard",
      "Predict weekly winners, eliminations & twists",
    ],
    color: "text-neon-cyan",
    accent: "hsl(185 100% 55%)",
    border: "border-l-neon-cyan",
  },
  {
    icon: TrendingUp,
    title: "Streaks & Multipliers",
    items: [
      "Special perks for top performers & seasons",
      "Odds multipliers reward harder calls",
      "Streak bonuses reward consistency",
    ],
    color: "text-neon-magenta",
    accent: "hsl(320 100% 60%)",
    border: "border-l-neon-magenta",
  },
  {
    icon: Shield,
    title: "Immunity Joker",
    items: [
      "Keeps the game exciting until the end",
      "Save a wrong pick and still earn base points",
      "Limited-use Jokers per season",
    ],
    color: "text-neon-gold",
    accent: "hsl(45 100% 55%)",
    border: "border-l-neon-gold",
  },
  {
    icon: Award,
    title: "Rewards & Collectibles",
    items: [
      "Season Passes and limited drops for fans",
      "Earn NFT badges (optional) for milestones",
      "Unlock badges and achievements as you play",
    ],
    color: "text-neon-cyan",
    accent: "hsl(185 100% 55%)",
    border: "border-l-neon-cyan",
  },
  {
    icon: Hexagon,
    title: "Built on Base",
    items: [
      "On-chain ownership for badges & Season Passes",
      "Stake $PICKS to boost your multiplier (up to 1.5×)",
      "Fast, low-fee actions for staking & collectibles",
    ],
    color: "text-violet-400",
    accent: "hsl(260 80% 60%)",
    border: "border-l-violet-400",
  },
  {
    icon: Flame,
    title: "The 333 Engine",
    items: [
      "33.3% of fees go to buyback & burn",
      "33.3% fund the community reward pool",
      "33.3% to treasury — full transparency",
    ],
    color: "text-neon-magenta",
    accent: "hsl(320 100% 60%)",
    border: "border-l-neon-magenta",
  },
];

export function LandingWhyPicks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="text-center mb-10">
          <LowerThird label="ECOSYSTEM" value="Why $PICKS" />
          <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto">
            $PICKS powers the RealityPicks ecosystem — built on the{" "}
            <span className="text-neon-gold font-bold">333 model</span>. Points, streaks,
            rewards, and on-chain perks for the fans who show up early.
          </p>
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feat, i) => (
          <motion.div
            key={feat.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className={`rounded-xl border border-white/[0.06] bg-studio-dark/60 backdrop-blur-sm border-l-[3px] ${feat.border} hover:bg-white/[0.04] transition-colors p-5`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ background: `${feat.accent}12`, border: `1px solid ${feat.accent}20` }}
              >
                <feat.icon className={`h-4 w-4 ${feat.color}`} />
              </div>
              <h3 className={`font-headline text-sm font-bold uppercase tracking-wide ${feat.color}`}>
                {feat.title}
              </h3>
            </div>
            <ul className="space-y-1.5">
              {feat.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className={`mt-1 h-1 w-1 rounded-full shrink-0 ${feat.color} opacity-60`} style={{ background: feat.accent }} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* Trust & Safety */}
      <FadeIn>
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-neon-cyan" />
            <span>
              <strong className="text-white/70">Trust & Safety</strong> — Free to play. No real money involved. Predictions are for entertainment and community competition.
            </span>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
