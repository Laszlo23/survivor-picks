"use client";

import { useAccount } from "wagmi";
import { BadgeGallery } from "@/components/web3/badge-gallery";
import { WalletLink } from "@/components/web3/wallet-link";
import { usePicksBalance, useUserTier, useStakeInfo, formatPicks, getTierName } from "@/lib/web3/hooks";
import { Wallet, Coins, TrendingUp } from "lucide-react";
import Link from "next/link";

export function ProfileWeb3Section() {
  const { address, isConnected } = useAccount();
  const { data: balance } = usePicksBalance(address);
  const { data: tier } = useUserTier(address);
  const { data: stakeInfo } = useStakeInfo(address);

  const userStaked = stakeInfo ? (stakeInfo as [bigint, bigint, bigint])[0] : 0n;
  const userTier = Number(tier || 0n);

  return (
    <div className="space-y-6">
      {/* Wallet Section */}
      <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-800/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4 text-blue-400" />
            Web3 Wallet
          </h3>
          <WalletLink />
        </div>

        {isConnected && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3">
            <div className="p-2 sm:p-3 bg-zinc-900/50 rounded-lg">
              <p className="text-[10px] sm:text-xs text-zinc-500">$PICKS</p>
              <p className="text-sm sm:text-lg font-bold text-white truncate">{formatPicks(balance as bigint | undefined)}</p>
            </div>
            <div className="p-2 sm:p-3 bg-zinc-900/50 rounded-lg">
              <p className="text-[10px] sm:text-xs text-zinc-500">Staked</p>
              <p className="text-sm sm:text-lg font-bold text-white truncate">{formatPicks(userStaked)}</p>
            </div>
            <div className="p-2 sm:p-3 bg-zinc-900/50 rounded-lg">
              <p className="text-[10px] sm:text-xs text-zinc-500">Tier</p>
              <p className={`text-sm sm:text-lg font-bold truncate ${
                userTier === 3 ? "text-yellow-400" :
                userTier === 2 ? "text-zinc-300" :
                userTier === 1 ? "text-amber-500" : "text-zinc-500"
              }`}>
                {getTierName(userTier)}
              </p>
            </div>
          </div>
        )}

        {isConnected && (
          <Link
            href="/staking"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3"
          >
            <Coins className="h-3 w-3" />
            Go to Staking Dashboard →
          </Link>
        )}
      </div>

      {/* NFT Badge Gallery */}
      <BadgeGallery />
    </div>
  );
}
