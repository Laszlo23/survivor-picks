"use client";

import Link from "next/link";
import { ArrowLeft, Coins, TrendingUp, Zap } from "lucide-react";
import { ConnectWallet } from "@/components/web3/connect-wallet";
import { WalletLink } from "@/components/web3/wallet-link";
import { StakingPanel } from "@/components/web3/staking-panel";
import { BuyPicksModal } from "@/components/web3/buy-picks-modal";
import { usePicksBalance } from "@/lib/web3/hooks";
import { useAccount } from "wagmi";
import { formatPicks } from "@/lib/web3/hooks";
import { FadeIn } from "@/components/motion";

export function StakingClient() {
  const { address, isConnected } = useAccount();
  const { data: balance } = usePicksBalance(address);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <FadeIn>
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-2">
                <Coins className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 shrink-0" />
                $PICKS Staking
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Stake tokens to earn rewards and boost predictions
              </p>
            </div>
            <div className="shrink-0">
              <WalletLink />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Token Balance Banner */}
      {isConnected && (
        <FadeIn delay={0.1}>
          <div className="mb-6 p-5 rounded-2xl gradient-border bg-gradient-to-br from-blue-950/40 via-card/60 to-violet-950/30 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[80px]" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-blue-300/80">Your $PICKS Balance</p>
                <p className="text-2xl sm:text-3xl font-display font-bold text-white truncate mt-1">
                  {formatPicks(balance as bigint | undefined)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-10 w-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-neon-cyan" />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      <StakingPanel />

      {/* Need $PICKS? */}
      {isConnected && (
        <FadeIn delay={0.2}>
          <div className="mt-6 p-4 rounded-xl border border-neon-cyan/10 bg-neon-cyan/[0.03] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Zap className="h-5 w-5 text-neon-cyan shrink-0" />
              <p className="text-sm text-muted-foreground">
                Need more $PICKS?{" "}
                <span className="text-white/80">Swap directly inside the app.</span>
              </p>
            </div>
            <BuyPicksModal>
              <button className="shrink-0 inline-flex items-center gap-2 rounded-md bg-neon-cyan px-4 py-2 text-xs font-headline font-semibold uppercase tracking-wider text-studio-black shadow-neon-cyan transition-all hover:shadow-neon-cyan-lg hover:brightness-110">
                Buy $PICKS
              </button>
            </BuyPicksModal>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
