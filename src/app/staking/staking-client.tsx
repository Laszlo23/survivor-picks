"use client";

import Link from "next/link";
import { ArrowLeft, Coins, Lock, Sparkles } from "lucide-react";

export function StakingClient() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <h1 className="text-2xl font-display font-bold mb-2">$PICKS Staking</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Stake your $PICKS to earn rewards and boost your prediction multiplier.
      </p>

      <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neon-gold/5 border border-neon-gold/20 mb-4">
          <span className="font-mono text-xl font-bold text-neon-gold">333</span>
        </div>
        <Lock className="h-6 w-6 text-muted-foreground mb-3" />
        <h2 className="text-lg font-display font-bold text-white mb-2">
          On-Chain Staking — Coming at Launch
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mb-4">
          Staking goes live with the 333 Fair Launch. Your internal $PICKS will
          convert 1:1 to on-chain tokens that can be staked for rewards.
        </p>
        <div className="flex items-center gap-2 text-xs text-neon-gold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>33.3% APY at launch &bull; Multiplier boosts for early stakers</span>
        </div>
      </div>
    </div>
  );
}
