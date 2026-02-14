"use client";

import Link from "next/link";
import { ArrowLeft, Coins, TrendingUp } from "lucide-react";
import { ConnectWallet } from "@/components/web3/connect-wallet";
import { WalletLink } from "@/components/web3/wallet-link";
import { StakingPanel } from "@/components/web3/staking-panel";
import { usePicksBalance } from "@/lib/web3/hooks";
import { useAccount } from "wagmi";
import { formatPicks } from "@/lib/web3/hooks";

export function StakingClient() {
  const { address, isConnected } = useAccount();
  const { data: balance } = usePicksBalance(address);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
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

      {/* Token Balance Banner */}
      {isConnected && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-800/30">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-blue-300">Your $PICKS Balance</p>
              <p className="text-2xl sm:text-3xl font-bold text-white truncate">
                {formatPicks(balance as bigint | undefined)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-sm text-green-400 hidden sm:inline">Staking Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Staking Panel */}
      <StakingPanel />
    </div>
  );
}
