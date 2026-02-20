"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Coins, Flame, TrendingUp, Zap, ExternalLink, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion";

const TOKEN_STATS = [
  { label: "Token", value: "$PICKS", icon: Coins, color: "text-neon-cyan" },
  { label: "Chain", value: "Base", icon: Zap, color: "text-violet-400" },
  { label: "Fair Launch Price", value: "$0.00333", icon: TrendingUp, color: "text-neon-gold" },
  { label: "Supply Model", value: "333", icon: Flame, color: "text-neon-magenta" },
];

export function TokenClient() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <FadeIn>
        <h1 className="text-3xl font-display font-bold mb-2">
          $PICKS Token
        </h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-lg">
          The native token of the RealityPicks ecosystem. Built on the 333 model —
          every number has meaning.
        </p>
      </FadeIn>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-gold/5 border border-neon-gold/20 mx-auto mb-4">
          <span className="font-mono text-xl font-bold text-neon-gold">333</span>
        </div>
        <h2 className="text-lg font-display font-bold mb-2">The 333 Tokenomics</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          33.3% community rewards &bull; 33.3% buyback & burn &bull; 33.3% treasury.
          On-chain features activate at fair launch.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/whitepaper"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-neon-cyan text-studio-black text-sm font-bold hover:bg-neon-cyan/90 transition-colors"
          >
            Read Whitepaper
          </Link>
          <Link
            href="/tokenomics"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg border border-white/[0.1] bg-white/[0.03] text-sm text-white hover:bg-white/[0.06] transition-colors"
          >
            Tokenomics
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
