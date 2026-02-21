"use client";

import { motion } from "framer-motion";
import {
  Zap,
  TrendingUp,
  Shield,
  Award,
  Sparkles,
  Star,
  Crown,
  Flame,
  Trophy,
  ChevronRight,
} from "lucide-react";
import { FadeIn } from "@/components/motion";

const BADGE_TIERS = [
  {
    name: "Early Supporter",
    icon: Star,
    gradient: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/30",
    color: "text-amber-400",
    supply: "1,111 max",
    desc: "First supporters of the platform",
    requirement: "Sign up during beta",
  },
  {
    name: "Player",
    icon: Zap,
    gradient: "from-indigo-500/20 to-indigo-600/5",
    border: "border-indigo-500/30",
    color: "text-indigo-400",
    supply: "3,000 max",
    desc: "Active prediction maker",
    requirement: "Make 33+ predictions",
  },
  {
    name: "Community OG",
    icon: Trophy,
    gradient: "from-teal-500/20 to-teal-600/5",
    border: "border-teal-500/30",
    color: "text-teal-400",
    supply: "1,000 max",
    desc: "Community builder",
    requirement: "Refer 3+ friends",
  },
  {
    name: "Season Pro",
    icon: Flame,
    gradient: "from-red-500/20 to-red-600/5",
    border: "border-red-500/30",
    color: "text-red-400",
    supply: "500 max",
    desc: "Consistently top performer",
    requirement: "Top 10% in a full season",
  },
  {
    name: "Legend",
    icon: Crown,
    gradient: "from-yellow-500/20 to-yellow-600/5",
    border: "border-yellow-500/40",
    color: "text-yellow-400",
    supply: "111 max",
    desc: "All-time great",
    requirement: "Top 33 all-time leaderboard",
  },
];

const PLANNED_PERKS = [
  {
    icon: Zap,
    title: "Points Boost",
    desc: "Earn bonus points on correct predictions with higher-tier badges.",
    color: "text-neon-cyan",
    accent: "hsl(185 100% 55%)",
  },
  {
    icon: TrendingUp,
    title: "Multiplier Perks",
    desc: "Higher tier badges unlock bigger multipliers on risk bets.",
    color: "text-neon-gold",
    accent: "hsl(45 100% 55%)",
  },
  {
    icon: Shield,
    title: "Streak Protection",
    desc: "Protect your win streak once per season from a wrong pick.",
    color: "text-neon-magenta",
    accent: "hsl(320 100% 60%)",
  },
  {
    icon: Award,
    title: "Season Pass",
    desc: "Exclusive access to premium markets and bonus challenges.",
    color: "text-violet-400",
    accent: "hsl(260 80% 60%)",
  },
];

export function CollectiblesClient() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <FadeIn>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-gold/10 border border-neon-gold/20 text-neon-gold text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-3 w-3" />
            Roadmap
          </div>

          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-3">
            Collectible Badges
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Earn badges by playing and climbing the leaderboard. Each badge tier will unlock in-game perks at fair launch.
          </p>
        </div>
      </FadeIn>

      {/* Badge Tiers */}
      <section className="mb-16">
        <FadeIn>
          <p className="text-[10px] uppercase tracking-widest text-neon-cyan/60 font-bold mb-2">BADGE TIERS</p>
          <h2 className="font-headline text-2xl font-extrabold uppercase text-white mb-8">
            How to Earn
          </h2>
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGE_TIERS.map((badge, i) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`relative rounded-2xl border ${badge.border} bg-gradient-to-br ${badge.gradient} overflow-hidden group`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] ${badge.color}`}>
                    <badge.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground bg-white/[0.04] px-2 py-0.5 rounded-full">
                    {badge.supply}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-1">{badge.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{badge.desc}</p>
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <ChevronRight className="h-3 w-3" />
                  <span>{badge.requirement}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Planned Perks */}
      <section className="mb-16">
        <FadeIn>
          <div className="flex items-center gap-3 mb-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-neon-cyan/60 font-bold mb-2">PLANNED PERKS</p>
              <h2 className="font-headline text-2xl font-extrabold uppercase text-white">
                What Badges Unlock
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[10px] font-bold text-muted-foreground uppercase tracking-wider self-end mb-1">
              Planned
            </span>
          </div>
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANNED_PERKS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all relative"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg mb-4"
                style={{ background: `${card.accent}12`, border: `1px solid ${card.accent}25` }}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{card.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <div className="text-center p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <Sparkles className="h-6 w-6 text-neon-gold mx-auto mb-3" />
        <h3 className="text-lg font-display font-bold text-white mb-2">
          Minting Opens at Fair Launch
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          Keep predicting to work toward higher badge tiers. Your progress is tracked automatically.
        </p>
        <p className="text-[10px] text-white/30">Badges will be minted as NFTs on Base</p>
      </div>
    </div>
  );
}
