"use client";

import { useAccount } from "wagmi";
import { type Address } from "viem";
import { useCalculatePayout, useClaimReward, toBytes32, formatPicks } from "@/lib/web3/hooks";

interface ClaimRewardsProps {
  questionId: string;
}

export function ClaimRewards({ questionId }: ClaimRewardsProps) {
  const { address } = useAccount();
  const qId = toBytes32(questionId);

  const { data: payout } = useCalculatePayout(qId, address);
  const { claim, isPending, isConfirming, isSuccess, error } = useClaimReward();

  const payoutAmount = payout as bigint | undefined;
  const hasPayout = payoutAmount && payoutAmount > 0n;

  if (!address) return null;

  if (isSuccess) {
    return (
      <div className="p-4 bg-cyan-900/30 border border-cyan-800/50 rounded-lg text-center">
        <p className="text-cyan-300 font-medium">Rewards claimed successfully!</p>
        <p className="text-neon-cyan text-sm mt-1">{formatPicks(payoutAmount)} $PICKS</p>
      </div>
    );
  }

  if (!hasPayout) {
    return (
      <div className="p-3 bg-zinc-800/50 rounded-lg text-center text-sm text-zinc-500">
        No rewards to claim for this question
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 space-y-3">
      <div className="text-center">
        <p className="text-sm text-zinc-400">Your Reward</p>
        <p className="text-2xl font-bold text-neon-cyan">{formatPicks(payoutAmount)} $PICKS</p>
      </div>

      <button
        onClick={() => claim(qId)}
        disabled={isPending || isConfirming}
        className="w-full py-3 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white rounded-lg font-medium transition-all disabled:opacity-50 shadow-[0_0_15px_hsl(185_100%_55%/0.2)]"
      >
        {isPending || isConfirming ? "Claiming..." : "Claim Rewards"}
      </button>

      {error && (
        <p className="text-xs text-red-400 text-center">{(error as Error).message?.slice(0, 100)}</p>
      )}
    </div>
  );
}
