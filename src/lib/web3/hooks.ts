"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, type Address, encodeAbiParameters, keccak256, toHex } from "viem";
import {
  picksTokenConfig,
  predictionEngineConfig,
  stakingVaultConfig,
  badgeNFTConfig,
  seasonPassConfig,
  treasuryConfig,
} from "./contracts";

// ─── Utility ────────────────────────────────────────────────────────

/** Convert a string ID to bytes32 (keccak256 hash) */
export function toBytes32(id: string): `0x${string}` {
  return keccak256(toHex(id));
}

// ─── $PICKS Token Hooks ─────────────────────────────────────────────

export function usePicksBalance(address?: Address) {
  return useReadContract({
    ...picksTokenConfig(),
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
}

export function usePicksAllowance(owner?: Address, spender?: Address) {
  return useReadContract({
    ...picksTokenConfig(),
    functionName: "allowance",
    args: owner && spender ? [owner, spender] : undefined,
    query: { enabled: !!owner && !!spender },
  });
}

export function useApprovePicksToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (spender: Address, amount: bigint) => {
    writeContract({
      ...picksTokenConfig(),
      functionName: "approve",
      args: [spender, amount],
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error };
}

// ─── Prediction Engine Hooks ────────────────────────────────────────

export function useQuestion(questionId: `0x${string}`) {
  return useReadContract({
    ...predictionEngineConfig(),
    functionName: "getQuestion",
    args: [questionId],
  });
}

export function useUserPrediction(questionId: `0x${string}`, user?: Address) {
  return useReadContract({
    ...predictionEngineConfig(),
    functionName: "getUserPrediction",
    args: questionId && user ? [questionId, user] : undefined,
    query: { enabled: !!user },
  });
}

export function useCalculatePayout(questionId: `0x${string}`, user?: Address) {
  return useReadContract({
    ...predictionEngineConfig(),
    functionName: "calculatePayout",
    args: questionId && user ? [questionId, user] : undefined,
    query: { enabled: !!user },
  });
}

export function useMakePrediction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const predict = (questionId: `0x${string}`, option: number, amount: bigint, isRisk: boolean) => {
    writeContract({
      ...predictionEngineConfig(),
      functionName: "predict",
      args: [questionId, option, amount, isRisk],
    });
  };

  return { predict, hash, isPending, isConfirming, isSuccess, error };
}

export function useClaimReward() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = (questionId: `0x${string}`) => {
    writeContract({
      ...predictionEngineConfig(),
      functionName: "claim",
      args: [questionId],
    });
  };

  return { claim, hash, isPending, isConfirming, isSuccess, error };
}

export function useUseJoker() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const useJoker = (questionId: `0x${string}`, seasonId: `0x${string}`) => {
    writeContract({
      ...predictionEngineConfig(),
      functionName: "useJoker",
      args: [questionId, seasonId],
    });
  };

  return { useJoker, hash, isPending, isConfirming, isSuccess, error };
}

// Admin hooks
export function useCreateQuestion() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createQuestion = (questionId: `0x${string}`, episodeId: `0x${string}`, optionCount: number, lockTimestamp: bigint) => {
    writeContract({
      ...predictionEngineConfig(),
      functionName: "createQuestion",
      args: [questionId, episodeId, optionCount, lockTimestamp],
    });
  };

  return { createQuestion, hash, isPending, isConfirming, isSuccess, error };
}

export function useResolveQuestion() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const resolve = (questionId: `0x${string}`, correctOption: number) => {
    writeContract({
      ...predictionEngineConfig(),
      functionName: "resolve",
      args: [questionId, correctOption],
    });
  };

  return { resolve, hash, isPending, isConfirming, isSuccess, error };
}

// ─── Staking Vault Hooks ────────────────────────────────────────────

export function useStakeInfo(user?: Address) {
  return useReadContract({
    ...stakingVaultConfig(),
    functionName: "getStakeInfo",
    args: user ? [user] : undefined,
    query: { enabled: !!user },
  });
}

export function useUserTier(user?: Address) {
  return useReadContract({
    ...stakingVaultConfig(),
    functionName: "getUserTier",
    args: user ? [user] : undefined,
    query: { enabled: !!user },
  });
}

export function useBoostBPS(user?: Address) {
  return useReadContract({
    ...stakingVaultConfig(),
    functionName: "getBoostBPS",
    args: user ? [user] : undefined,
    query: { enabled: !!user },
  });
}

export function usePendingRewards(user?: Address) {
  return useReadContract({
    ...stakingVaultConfig(),
    functionName: "pendingRewards",
    args: user ? [user] : undefined,
    query: { enabled: !!user },
  });
}

export function useTotalStaked() {
  return useReadContract({
    ...stakingVaultConfig(),
    functionName: "totalStaked",
  });
}

export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (amount: bigint) => {
    writeContract({
      ...stakingVaultConfig(),
      functionName: "stake",
      args: [amount],
    });
  };

  return { stake, hash, isPending, isConfirming, isSuccess, error };
}

export function useUnstake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unstake = (amount: bigint) => {
    writeContract({
      ...stakingVaultConfig(),
      functionName: "unstake",
      args: [amount],
    });
  };

  return { unstake, hash, isPending, isConfirming, isSuccess, error };
}

export function useClaimStakingRewards() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimRewards = () => {
    writeContract({
      ...stakingVaultConfig(),
      functionName: "claimRewards",
    });
  };

  return { claimRewards, hash, isPending, isConfirming, isSuccess, error };
}

// ─── Badge NFT Hooks ────────────────────────────────────────────────

export function useUserBadges(user?: Address) {
  return useReadContract({
    ...badgeNFTConfig(),
    functionName: "getUserBadges",
    args: user ? [user] : undefined,
    query: { enabled: !!user },
  });
}

export function useBadgeBalance(user?: Address, tokenId?: bigint) {
  return useReadContract({
    ...badgeNFTConfig(),
    functionName: "balanceOf",
    args: user && tokenId !== undefined ? [user, tokenId] : undefined,
    query: { enabled: !!user && tokenId !== undefined },
  });
}

export function useBadgeURI(tokenId: bigint) {
  return useReadContract({
    ...badgeNFTConfig(),
    functionName: "uri",
    args: [tokenId],
  });
}

// ─── Season Pass Hooks ──────────────────────────────────────────────

export function useSeasonPassPrice() {
  return useReadContract({
    ...seasonPassConfig(),
    functionName: "currentPrice",
  });
}

export function useRemainingPasses() {
  return useReadContract({
    ...seasonPassConfig(),
    functionName: "remainingSupply",
  });
}

export function useHasActivePass(user?: Address) {
  return useReadContract({
    ...seasonPassConfig(),
    functionName: "hasActivePass",
    args: user ? [user] : undefined,
    query: { enabled: !!user },
  });
}

export function usePurchaseSeasonPass() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const purchase = () => {
    writeContract({
      ...seasonPassConfig(),
      functionName: "purchase",
    });
  };

  return { purchase, hash, isPending, isConfirming, isSuccess, error };
}

// ─── Treasury Hooks ─────────────────────────────────────────────────

export function useTreasuryBalance() {
  return useReadContract({
    ...treasuryConfig(),
    functionName: "treasuryBalance",
  });
}

export function useTotalBurned() {
  return useReadContract({
    ...treasuryConfig(),
    functionName: "totalBurned",
  });
}

// ─── Formatting Helpers ─────────────────────────────────────────────

export function formatPicks(amount: bigint | undefined): string {
  if (!amount) return "0";
  return formatEther(amount);
}

export function parsePicks(amount: string): bigint {
  return parseEther(amount);
}

export const TIER_NAMES = ["None", "Bronze", "Silver", "Gold"] as const;
export const TIER_COLORS = ["gray", "amber", "slate", "yellow"] as const;

export function getTierName(tier: number): string {
  return TIER_NAMES[tier] || "None";
}
