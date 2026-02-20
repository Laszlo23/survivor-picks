"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Coins, Flame, TrendingUp, Zap, ExternalLink, CreditCard, Wallet, ArrowRightLeft, Gamepad2 } from "lucide-react";
import { FadeIn } from "@/components/motion";

const TOKEN_STATS = [
  { label: "Token", value: "$PICKS", icon: Coins, color: "text-neon-cyan" },
  { label: "Chain", value: "Base", icon: Zap, color: "text-violet-400" },
  { label: "Fair Launch Price", value: "$0.00333", icon: TrendingUp, color: "text-neon-gold" },
  { label: "Supply Model", value: "333", icon: Flame, color: "text-neon-magenta" },
];

const ENGINE_SPLITS = [
  { label: "Community Rewards", pct: "33.3%", desc: "Distributed to active players, leaderboard winners, and streak holders", color: "bg-neon-cyan" },
  { label: "Buyback & Burn", pct: "33.3%", desc: "Protocol buys and burns $PICKS from the market, reducing supply", color: "bg-neon-magenta" },
  { label: "Treasury", pct: "33.3%", desc: "Funds development, partnerships, and platform growth — fully transparent", color: "bg-neon-gold" },
];

const HOW_TO_BUY = [
  { icon: CreditCard, title: "Pay with Card", desc: "Stripe-powered checkout. Visa, Mastercard, Apple Pay. No crypto needed." },
  { icon: Wallet, title: "Internal Wallet", desc: "Tokens credited instantly. No gas fees, no seed phrases." },
  { icon: ArrowRightLeft, title: "1:1 On-Chain", desc: "Every internal $PICKS converts to on-chain tokens at fair launch." },
  { icon: Gamepad2, title: "Use Immediately", desc: "Stake on predictions, earn rewards, and climb the leaderboard right away." },
];

export function TokenClient() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <FadeIn>
        <h1 className="font-headline text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-2">
          $PICKS Token
        </h1>
        <p className="text-sm text-muted-foreground mb-10 max-w-lg">
          The utility token powering RealityPicks. Built on the 333 model — every number has meaning.
        </p>
      </FadeIn>

      {/* Stats row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-16">
        {TOKEN_STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
          >
            <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-bold font-mono text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* 333 Engine */}
      <section className="mb-16">
        <FadeIn>
          <p className="text-[10px] uppercase tracking-widest text-neon-gold/60 font-bold mb-2">TOKENOMICS</p>
          <h2 className="font-headline text-2xl font-extrabold uppercase text-white mb-8">
            The 333 Engine
          </h2>
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-3">
          {ENGINE_SPLITS.map((split, i) => (
            <motion.div
              key={split.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-3 w-3 rounded-full ${split.color}`} />
                <span className="text-2xl font-bold font-mono text-white">{split.pct}</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{split.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{split.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How to Buy */}
      <section className="mb-16">
        <FadeIn>
          <p className="text-[10px] uppercase tracking-widest text-neon-cyan/60 font-bold mb-2">GETTING STARTED</p>
          <h2 className="font-headline text-2xl font-extrabold uppercase text-white mb-2">
            How to Get $PICKS
          </h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-lg">
            Buy with your credit card. No wallet required. Tokens convert 1:1 on-chain at fair launch.
          </p>
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_TO_BUY.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 mb-4">
                <step.icon className="h-5 w-5 text-neon-cyan" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Fair Launch CTA */}
      <div className="text-center p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-gold/5 border border-neon-gold/20 mx-auto mb-4">
          <span className="font-mono text-xl font-bold text-neon-gold">333</span>
        </div>
        <h2 className="text-lg font-display font-bold mb-2">Fair Launch</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Sign up free — get 33,333 $PICKS instantly. On-chain features activate at fair launch.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/whitepaper"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-neon-cyan text-studio-black text-sm font-bold hover:bg-neon-cyan/90 transition-colors"
          >
            Read Whitepaper
          </Link>
          <Link
            href="/tokenomics"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-white/[0.1] bg-white/[0.03] text-sm text-white hover:bg-white/[0.06] transition-colors"
          >
            Full Tokenomics
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
