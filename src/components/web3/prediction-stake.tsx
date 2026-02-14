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
  useIsContractsReady,
} from "@/lib/web3/hooks";
import { isContractDeployed, getContractAddress } from "@/lib/web3/contracts";
import { PressScale } from "@/components/motion";
import { Coins, Rocket } from "lucide-react";

interface PredictionStakeProps {
  questionId: string;
  selectedOption: number;
  isRisk: boolean;
  onSuccess?: () => void;
}

export function PredictionStake({ questionId, selectedOption, isRisk, onSuccess }: PredictionStakeProps) {
  const { address } = useAccount();
  const [amount, setAmount] = useState("");
  const contractsReady = useIsContractsReady();

  // If contracts aren't deployed, show a friendly fallback
  if (!contractsReady) {
    return (
      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
        <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
          <Rocket className="h-6 w-6 text-violet-400" />
        </div>
        <p className="text-sm font-medium mb-1">On-Chain Staking Coming Soon</p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          $PICKS token staking for predictions is not yet available on this network.
          You can still make free picks above!
        </p>
      </div>
    );
  }

  const qId = toBytes32(questionId);
  let engineAddress: Address = "0x0" as Address;
  try {
    engineAddress = getContractAddress("PredictionEngine");
  } catch {}

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
      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
        <Coins className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Connect your wallet to stake $PICKS on predictions
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Your $PICKS Balance</span>
        <span className="font-mono text-foreground">{formatPicks(balance as bigint | undefined)}</span>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Stake Amount</label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            min="0"
            className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all"
          />
          <button
            onClick={() => setAmount(formatPicks(balance as bigint | undefined))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            MAX
          </button>
        </div>
      </div>

      {isRisk && (
        <div className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300">
          <span className="font-bold">RISK BET</span>
          <span>1.5x multiplier if correct, lose all if wrong</span>
        </div>
      )}

      <PressScale>
        <button
          onClick={handleStake}
          disabled={isProcessing || stakeAmount === 0n || selectedOption === 0}
          className={`w-full py-3 rounded-xl font-medium transition-all text-sm ${
            isProcessing
              ? "bg-muted text-muted-foreground cursor-wait"
              : needsApproval
                ? "bg-amber-600 hover:bg-amber-500 text-white"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_0_15px_hsl(220_80%_55%/0.2)]"
          }`}
        >
          {isProcessing
            ? "Processing..."
            : needsApproval
              ? `Approve ${amount} $PICKS`
              : `Stake ${amount || "0"} $PICKS on Option ${selectedOption}`}
        </button>
      </PressScale>

      {isSuccess && (
        <div className="p-2.5 bg-neon-cyan/10 border border-neon-cyan/20 rounded-xl text-xs text-cyan-300 text-center">
          Prediction submitted on-chain!
        </div>
      )}
    </div>
  );
}
