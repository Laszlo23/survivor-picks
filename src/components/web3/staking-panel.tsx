"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
} from "@/lib/web3/hooks";
import { getContractAddress } from "@/lib/web3/contracts";
import { GlowCard, FadeIn, PressScale } from "@/components/motion";

const tierConfig = [
  { name: "Bronze", amount: "1K+", days: "7+ days", boost: "1.1x", color: "text-amber-500", border: "border-amber-500/30", bg: "from-amber-950/30 to-amber-900/10", glow: "shadow-[0_0_15px_hsl(35_80%_50%/0.15)]" },
  { name: "Silver", amount: "10K+", days: "30+ days", boost: "1.25x", color: "text-gray-300", border: "border-gray-400/30", bg: "from-gray-800/30 to-gray-700/10", glow: "shadow-[0_0_15px_hsl(210_10%_60%/0.15)]" },
  { name: "Gold", amount: "100K+", days: "90+ days", boost: "1.5x", color: "text-yellow-400", border: "border-yellow-500/30", bg: "from-yellow-950/30 to-yellow-900/10", glow: "shadow-[0_0_15px_hsl(45_90%_55%/0.2)]" },
];

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

  const userStaked = stakeInfo ? (stakeInfo as unknown as [bigint, bigint, bigint])[0] : 0n;
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
      <FadeIn>
        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
          <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4 animate-float">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-muted-foreground">Connect your wallet to start staking</p>
        </div>
      </FadeIn>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Your Stake", value: formatPicks(userStaked), unit: "$PICKS", color: "text-foreground" },
          { label: "Tier", value: getTierName(userTier), unit: `${boostMultiplier}x boost`, color: userTier === 3 ? "text-yellow-400" : userTier === 2 ? "text-gray-300" : userTier === 1 ? "text-amber-500" : "text-muted-foreground" },
          { label: "Rewards", value: formatPicks(pendingRewards), unit: "$PICKS", color: "text-neon-cyan" },
          { label: "Total Staked", value: formatPicks(totalStakedData as bigint | undefined), unit: "all users", color: "text-blue-400" },
        ].map((stat, i) => (
          <GlowCard key={stat.label} delay={i * 0.05} className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            <p className={`text-lg sm:text-xl font-bold mt-1 truncate font-mono ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.unit}</p>
          </GlowCard>
        ))}
      </div>

      {/* Tier Info */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
        <h3 className="text-sm font-display font-semibold mb-3">Staking Tiers</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center text-[10px] sm:text-xs">
          {tierConfig.map((t, i) => (
            <div
              key={t.name}
              className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${t.bg} border ${
                userTier > i ? `${t.border} ${t.glow}` : "border-white/[0.04]"
              } transition-all`}
            >
              <p className={`font-bold ${t.color}`}>{t.name}</p>
              <p className="text-muted-foreground mt-1">{t.amount}</p>
              <p className="text-muted-foreground">{t.days}</p>
              <p className={`${t.color} font-semibold mt-1`}>{t.boost}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Rewards */}
      {pendingRewards && pendingRewards > 0n && (
        <PressScale>
          <button
            onClick={() => claimRewards()}
            disabled={isClaiming}
            className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-[0_0_20px_hsl(185_100%_55%/0.2)]"
          >
            {isClaiming
              ? "Claiming..."
              : `Claim ${formatPicks(pendingRewards)} $PICKS Rewards`}
          </button>
        </PressScale>
      )}

      {/* Stake / Unstake Tabs */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
        <div className="flex border-b border-white/[0.06] relative">
          {(["stake", "unstake"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`relative flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === t
                  ? t === "stake"
                    ? "text-blue-400"
                    : "text-red-400"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {activeTab === t && (
                <motion.div
                  layoutId="staking-tab"
                  className={`absolute inset-0 ${
                    t === "stake" ? "bg-blue-500/10" : "bg-red-500/10"
                  }`}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative capitalize">{t}</span>
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {activeTab === "stake" ? (
            <>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">Available</span>
                <span className="font-mono text-foreground truncate">
                  {formatPicks(balance as bigint | undefined)} $PICKS
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="Amount to stake"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all"
                />
                <button
                  onClick={() =>
                    setStakeAmount(
                      formatPicks(balance as bigint | undefined)
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  MAX
                </button>
              </div>
              <PressScale>
                <button
                  onClick={handleStake}
                  disabled={isStaking || isApproving || !stakeAmount}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-[0_0_15px_hsl(220_80%_55%/0.2)]"
                >
                  {isStaking || isApproving ? "Processing..." : "Stake $PICKS"}
                </button>
              </PressScale>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground shrink-0">Staked</span>
                <span className="font-mono text-foreground truncate">
                  {formatPicks(userStaked)} $PICKS
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="Amount to unstake"
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/30 transition-all"
                />
                <button
                  onClick={() => setUnstakeAmount(formatPicks(userStaked))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  MAX
                </button>
              </div>
              <PressScale>
                <button
                  onClick={handleUnstake}
                  disabled={isUnstaking || !unstakeAmount}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {isUnstaking ? "Processing..." : "Unstake $PICKS"}
                </button>
              </PressScale>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
