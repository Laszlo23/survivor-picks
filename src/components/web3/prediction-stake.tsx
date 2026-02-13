"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { parseEther, type Address } from "viem";
import {
  usePicksBalance,
  usePicksAllowance,
  useApprovePicksToken,
  useMakePrediction,
  toBytes32,
  formatPicks,
} from "@/lib/web3/hooks";
import { getContractAddress } from "@/lib/web3/contracts";

interface PredictionStakeProps {
  questionId: string;
  selectedOption: number;
  isRisk: boolean;
  onSuccess?: () => void;
}

export function PredictionStake({ questionId, selectedOption, isRisk, onSuccess }: PredictionStakeProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");

  const qId = toBytes32(questionId);
  const engineAddress = getContractAddress("PredictionEngine");

  const { data: balance } = usePicksBalance(address);
  const { data: allowance } = usePicksAllowance(address, engineAddress);
  const { approve, isPending: isApproving, isConfirming: isApproveConfirming } = useApprovePicksToken();
  const { predict, isPending: isPredicting, isConfirming: isPredictConfirming, isSuccess } = useMakePrediction();

  const stakeAmount = amount ? parseEther(amount) : 0n;
  const needsApproval = allowance !== undefined && stakeAmount > 0n && (allowance as bigint) < stakeAmount;
  const isProcessing = isApproving || isApproveConfirming || isPredicting || isPredictConfirming;

  const handleStake = () => {
    if (!address || stakeAmount === 0n || selectedOption === 0) return;

    if (needsApproval) {
      approve(engineAddress, stakeAmount);
    } else {
      predict(qId, selectedOption, stakeAmount, isRisk);
    }
  };

  if (isSuccess) {
    onSuccess?.();
  }

  if (!address) {
    return (
      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 text-center text-zinc-400">
        Connect your wallet to stake $PICKS on predictions
      </div>
    );
  }

  return (
    <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">Your $PICKS Balance</span>
        <span className="font-mono text-white">{formatPicks(balance as bigint | undefined)}</span>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-zinc-400">Stake Amount</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            min="0"
            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-600 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setAmount(formatPicks(balance as bigint | undefined))}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
          >
            MAX
          </button>
        </div>
      </div>

      {isRisk && (
        <div className="flex items-center gap-2 p-2 bg-red-900/30 border border-red-800/50 rounded text-xs text-red-300">
          <span className="font-bold">RISK BET</span>
          <span>1.5x multiplier if correct, lose all if wrong (no joker protection)</span>
        </div>
      )}

      <button
        onClick={handleStake}
        disabled={isProcessing || stakeAmount === 0n || selectedOption === 0}
        className={`w-full py-3 rounded-lg font-medium transition-all text-sm ${
          isProcessing
            ? "bg-zinc-700 text-zinc-400 cursor-wait"
            : needsApproval
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
        }`}
      >
        {isProcessing
          ? "Processing..."
          : needsApproval
            ? `Approve ${amount} $PICKS`
            : `Stake ${amount || "0"} $PICKS on Option ${selectedOption}`
        }
      </button>

      {isSuccess && (
        <div className="p-2 bg-green-900/30 border border-green-800/50 rounded text-xs text-green-300 text-center">
          Prediction submitted on-chain!
        </div>
      )}
    </div>
  );
}
