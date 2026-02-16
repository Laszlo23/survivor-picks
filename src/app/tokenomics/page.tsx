"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { NeonButton } from "@/components/ui/neon-button";
import {
  ArrowRight,
  Coins,
  Target,
  Zap,
  Flame,
  Shield,
  TrendingUp,
  Lock,
  BarChart3,
} from "lucide-react";

const ALLOCATION = [
  { label: "Uniswap V4 LP", pct: 45, amount: "~450M", color: "bg-neon-cyan", textColor: "text-neon-cyan" },
  { label: "Vaulted Team + Community", pct: 50, amount: "~500M", color: "bg-violet-500", textColor: "text-violet-400" },
  { label: "Airdrop (Early Supporters)", pct: 5, amount: "~50M", color: "bg-neon-gold", textColor: "text-neon-gold" },
];

const UTILITIES = [
  {
    icon: Target,
    title: "Market Access",
    desc: "Use $PICKS to enter prediction pools and stake on outcomes across reality TV shows.",
    color: "text-neon-cyan",
    bg: "bg-neon-cyan/10",
  },
  {
    icon: BarChart3,
    title: "Governance",
    desc: "Vote on platform decisions, new show additions, and protocol upgrades.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: Zap,
    title: "Boost Multipliers",
    desc: "Stake $PICKS to earn enhanced prediction multipliers up to 1.5x.",
    color: "text-neon-magenta",
    bg: "bg-neon-magenta/10",
  },
  {
    icon: Coins,
    title: "Staking Rewards",
    desc: "Lock tokens in the Staking Vault to earn passive yield from platform fees.",
    color: "text-neon-gold",
    bg: "bg-neon-gold/10",
  },
];

const MECHANICS = [
  {
    icon: Flame,
    title: "Buyback & Burn",
    desc: "A portion of the 3% platform fee is used to buy back and permanently burn $PICKS, reducing supply over time.",
    color: "text-red-400",
    borderColor: "border-l-red-500/50",
  },
  {
    icon: Lock,
    title: "Staking Vault",
    desc: "Stake $PICKS to earn boosted prediction multipliers (up to 1.5x) and passive yield from platform fees.",
    color: "text-neon-cyan",
    borderColor: "border-l-neon-cyan/50",
  },
  {
    icon: Shield,
    title: "Season Pass Burns",
    desc: "Purchasing Season Passes burns tokens permanently, adding deflationary pressure each season.",
    color: "text-violet-400",
    borderColor: "border-l-violet-500/50",
  },
  {
    icon: TrendingUp,
    title: "Dynamic Odds",
    desc: "Pool odds adjust in real-time based on community predictions — early conviction gets better prices.",
    color: "text-neon-gold",
    borderColor: "border-l-neon-gold/50",
  },
];

export default function TokenomicsPage() {
  return (
    <div className="min-h-screen bg-studio-black pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-studio-black to-studio-black" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-neon-cyan/8 rounded-full blur-[100px]" />
        <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-12 text-center">
          <FadeIn>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-neon-cyan/70 mb-4">
              ERC-20 on Base
            </p>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
              <span className="text-gradient-cyan">$PICKS</span> Tokenomics
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
              Total supply of 1,000,000,000 tokens. Fair launched via Clanker on Base.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* Key Stats */}
        <FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
            {[
              { label: "Total Supply", value: "1B" },
              { label: "Platform Fee", value: "3%" },
              { label: "Chain", value: "Base" },
              { label: "Standard", value: "ERC-20" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <p className="text-xl sm:text-2xl font-bold font-mono text-white">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Allocation */}
        <FadeIn>
          <section className="mt-16">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-wide text-white mb-6">
              Token Allocation
            </h2>

            {/* Visual bar */}
            <div className="flex h-8 rounded-full overflow-hidden mb-6 border border-white/[0.06]">
              {ALLOCATION.map((a) => (
                <div
                  key={a.label}
                  className={`${a.color} relative group transition-all`}
                  style={{ width: `${a.pct}%` }}
                  title={`${a.label}: ${a.pct}%`}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                    {a.pct}%
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="grid gap-3 sm:grid-cols-3">
              {ALLOCATION.map((a) => (
                <div key={a.label} className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className={`h-3 w-3 rounded-full ${a.color} shrink-0`} />
                  <div>
                    <p className={`text-sm font-bold ${a.textColor}`}>
                      {a.label} — {a.pct}%
                    </p>
                    <p className="text-xs text-muted-foreground">{a.amount} tokens</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Utilities */}
        <FadeIn>
          <section className="mt-16">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-wide text-white mb-6">
              Token Utilities
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {UTILITIES.map((u) => {
                const Icon = u.icon;
                return (
                  <div key={u.title} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                    <div className={`inline-flex items-center justify-center h-10 w-10 rounded-lg ${u.bg} mb-3`}>
                      <Icon className={`h-5 w-5 ${u.color}`} />
                    </div>
                    <h3 className="font-display font-semibold text-white mb-1">{u.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{u.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </FadeIn>

        {/* Economic Mechanics */}
        <FadeIn>
          <section className="mt-16">
            <h2 className="font-headline text-2xl font-bold uppercase tracking-wide text-white mb-6">
              Economic Mechanics
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {MECHANICS.map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.title} className={`p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] border-l-[3px] ${m.borderColor}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-5 w-5 ${m.color}`} />
                      <h3 className="font-display font-semibold text-white">{m.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                  </div>
                );
              })}
            </div>
          </section>
        </FadeIn>

        {/* CTA */}
        <FadeIn>
          <div className="mt-16 text-center p-8 rounded-2xl bg-gradient-to-br from-cyan-950/30 to-violet-950/30 border border-neon-cyan/20">
            <h3 className="font-headline text-xl font-bold uppercase mb-2">
              Ready to Get <span className="text-gradient-cyan">$PICKS</span>?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              View live token data, buy on Uniswap, or start staking.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <NeonButton variant="primary" href="/token" className="gap-2">
                Live Token Dashboard <ArrowRight className="h-4 w-4" />
              </NeonButton>
              <NeonButton variant="ghost" href="/contracts" className="gap-2">
                View Contracts
              </NeonButton>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
