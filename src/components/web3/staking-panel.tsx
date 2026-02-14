"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { parseEther, type Address } from "viem";
import {
  usePicksBalance,
  usePicksAllowance,
  useApprovePicksToken,
  useStakeInfo,
  useUserTier,
  useBoostBPS,
  usePendingRewards,
  useTotalStaked,
  useStake,
  useUnstake,
  useClaimStakingRewards,
  formatPicks,
  getTierName,
  TIER_COLORS,
} from "@/lib/web3/hooks";
import { getContractAddress } from "@/lib/web3/contracts";

export function StakingPanel() {
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");
  const [activeTab, setActiveTab] = useState<"stake" | "unstake">("stake");

  const vaultAddress = getContractAddress("StakingVault");

  const { data: balance } = usePicksBalance(address);
  const { data: allowance } = usePicksAllowance(address, vaultAddress);
  const { data: stakeInfo } = useStakeInfo(address);
  const { data: tier } = useUserTier(address);
  const { data: boost } = useBoostBPS(address);
  const { data: pending } = usePendingRewards(address);
  const { data: totalStakedData } = useTotalStaked();

  const { approve, isPending: isApproving } = useApprovePicksToken();
  const { stake, isPending: isStaking } = useStake();
  const { unstake, isPending: isUnstaking } = useUnstake();
  const { claimRewards, isPending: isClaiming } = useClaimStakingRewards();

  const userStaked = stakeInfo ? (stakeInfo as [bigint, bigint, bigint])[0] : 0n;
  const stakedAt = stakeInfo ? (stakeInfo as [bigint, bigint, bigint])[1] : 0n;
  const userTier = Number(tier || 0n);
  const boostBps = Number(boost || 10000n);
  const boostMultiplier = (boostBps / 10000).toFixed(2);
  const pendingRewards = pending as bigint | undefined;

  const handleStake = () => {
    if (!stakeAmount) return;
    const amount = parseEther(stakeAmount);
    const currentAllowance = allowance as bigint | undefined;

    if (currentAllowance !== undefined && currentAllowance < amount) {
      approve(vaultAddress, amount);
    } else {
      stake(amount);
    }
  };

  const handleUnstake = () => {
    if (!unstakeAmount) return;
    unstake(parseEther(unstakeAmount));
  };

  if (!address) {
    return (
      <div className="p-6 bg-zinc-900 rounded-xl border border-zinc-800 text-center">
        <p className="text-zinc-400">Connect your wallet to start staking</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-[10px] sm:text-xs text-zinc-500 uppercase">Your Stake</p>
          <p className="text-lg sm:text-xl font-bold text-white mt-1 truncate">{formatPicks(userStaked)}</p>
          <p className="text-[10px] sm:text-xs text-zinc-400">$PICKS</p>
        </div>

        <div className="p-3 sm:p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-[10px] sm:text-xs text-zinc-500 uppercase">Tier</p>
          <p className={`text-lg sm:text-xl font-bold mt-1 ${
            userTier === 3 ? "text-yellow-400" :
            userTier === 2 ? "text-zinc-300" :
            userTier === 1 ? "text-amber-500" : "text-zinc-500"
          }`}>
            {getTierName(userTier)}
          </p>
          <p className="text-[10px] sm:text-xs text-zinc-400">{boostMultiplier}x boost</p>
        </div>

        <div className="p-3 sm:p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-[10px] sm:text-xs text-zinc-500 uppercase">Rewards</p>
          <p className="text-lg sm:text-xl font-bold text-green-400 mt-1 truncate">{formatPicks(pendingRewards)}</p>
          <p className="text-[10px] sm:text-xs text-zinc-400">$PICKS</p>
        </div>

        <div className="p-3 sm:p-4 bg-zinc-900 rounded-xl border border-zinc-800">
          <p className="text-[10px] sm:text-xs text-zinc-500 uppercase">Total Staked</p>
          <p className="text-lg sm:text-xl font-bold text-blue-400 mt-1 truncate">{formatPicks(totalStakedData as bigint | undefined)}</p>
          <p className="text-[10px] sm:text-xs text-zinc-400">all users</p>
        </div>
      </div>

      {/* Tier Info */}
      <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
        <h3 className="text-sm font-medium text-white mb-3">Staking Tiers</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center text-[10px] sm:text-xs">
          <div className={`p-2 sm:p-3 rounded-lg ${userTier >= 1 ? "bg-amber-900/30 border border-amber-800/50" : "bg-zinc-800"}`}>
            <p className="font-bold text-amber-400">Bronze</p>
            <p className="text-zinc-400 mt-1">1K+</p>
            <p className="text-zinc-400">7+ days</p>
            <p className="text-amber-300 font-medium mt-1">1.1x</p>
          </div>
          <div className={`p-2 sm:p-3 rounded-lg ${userTier >= 2 ? "bg-zinc-700/50 border border-zinc-600" : "bg-zinc-800"}`}>
            <p className="font-bold text-zinc-300">Silver</p>
            <p className="text-zinc-400 mt-1">10K+</p>
            <p className="text-zinc-400">30+ days</p>
            <p className="text-zinc-200 font-medium mt-1">1.25x</p>
          </div>
          <div className={`p-2 sm:p-3 rounded-lg ${userTier >= 3 ? "bg-yellow-900/30 border border-yellow-800/50" : "bg-zinc-800"}`}>
            <p className="font-bold text-yellow-400">Gold</p>
            <p className="text-zinc-400 mt-1">100K+</p>
            <p className="text-zinc-400">90+ days</p>
            <p className="text-yellow-300 font-medium mt-1">1.5x</p>
          </div>
        </div>
      </div>

      {/* Claim Rewards */}
      {pendingRewards && pendingRewards > 0n && (
        <button
          onClick={() => claimRewards()}
          disabled={isClaiming}
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
        >
          {isClaiming ? "Claiming..." : `Claim ${formatPicks(pendingRewards)} $PICKS Rewards`}
        </button>
      )}

      {/* Stake / Unstake Tabs */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("stake")}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === "stake" ? "text-blue-400 bg-blue-900/20" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Stake
          </button>
          <button
            onClick={() => setActiveTab("unstake")}
            className={`flex-1 py-3 text-sm font-medium transition-all ${
              activeTab === "unstake" ? "text-red-400 bg-red-900/20" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Unstake
          </button>
        </div>

        <div className="p-4 space-y-3">
          {activeTab === "stake" ? (
            <>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-zinc-400 shrink-0">Available</span>
                <span className="font-mono text-white truncate">{formatPicks(balance as bigint | undefined)} $PICKS</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Amount to stake"
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setStakeAmount(formatPicks(balance as bigint | undefined))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
                >
                  MAX
                </button>
              </div>
              <button
                onClick={handleStake}
                disabled={isStaking || isApproving || !stakeAmount}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {isStaking || isApproving ? "Processing..." : "Stake $PICKS"}
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-zinc-400 shrink-0">Staked</span>
                <span className="font-mono text-white truncate">{formatPicks(userStaked)} $PICKS</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="Amount to unstake"
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => setUnstakeAmount(formatPicks(userStaked))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-400 hover:text-red-300"
                >
                  MAX
                </button>
              </div>
              <button
                onClick={handleUnstake}
                disabled={isUnstaking || !unstakeAmount}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                {isUnstaking ? "Processing..." : "Unstake $PICKS"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
