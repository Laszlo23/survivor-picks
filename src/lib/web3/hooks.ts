"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther, type Address, keccak256, toHex } from "viem";
import {
  safeContractConfig,
  isContractDeployed,
  realityPicksNFTConfig,
} from "./contracts";

// ─── Utility ────────────────────────────────────────────────────────

/** Convert a string ID to bytes32 (keccak256 hash) */
export function toBytes32(id: string): `0x${string}` {
  return keccak256(toHex(id));
}

// ─── Safe Read Hook Helper ──────────────────────────────────────────

/**
 * Wraps `useReadContract` with zero-address safety.
 * If the contract is not deployed, the hook returns idle state (enabled: false).
 */
function useSafeRead(
  contractName: Parameters<typeof safeContractConfig>[0],
  functionName: string,
  args?: readonly unknown[],
  extraEnabled: boolean = true,
) {
  const config = safeContractConfig(contractName);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useReadContract({
    address: config.address,
    abi: config.abi,
    functionName: functionName as any,
    args: args as any,
    query: { enabled: config.deployed && extraEnabled },
  } as any);
}

// ─── $PICKS Token Hooks ─────────────────────────────────────────────

export function usePicksBalance(address?: Address) {
  return useSafeRead("PicksToken", "balanceOf", address ? [address] : undefined, !!address);
}

export function usePicksAllowance(owner?: Address, spender?: Address) {
  return useSafeRead(
    "PicksToken",
    "allowance",
    owner && spender ? [owner, spender] : undefined,
    !!owner && !!spender,
  );
}

export function useApprovePicksToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = (spender: Address, amount: bigint) => {
    if (!isContractDeployed("PicksToken")) return;
    const cfg = safeContractConfig("PicksToken");
    writeContract({
      address: cfg.address,
      abi: cfg.abi,
      functionName: "approve",
      args: [spender, amount],
    });
  };

  return { approve, hash, isPending, isConfirming, isSuccess, error };
}

// ─── Prediction Engine Hooks ────────────────────────────────────────

export function useQuestion(questionId: `0x${string}`) {
  return useSafeRead("PredictionEngine", "getQuestion", [questionId]);
}

export function useUserPrediction(questionId: `0x${string}`, user?: Address) {
  return useSafeRead(
    "PredictionEngine",
    "getUserPrediction",
    questionId && user ? [questionId, user] : undefined,
    !!user,
  );
}

export function useCalculatePayout(questionId: `0x${string}`, user?: Address) {
  return useSafeRead(
    "PredictionEngine",
    "calculatePayout",
    questionId && user ? [questionId, user] : undefined,
    !!user,
  );
}

export function useMakePrediction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const predict = (questionId: `0x${string}`, option: number, amount: bigint, isRisk: boolean) => {
    if (!isContractDeployed("PredictionEngine")) return;
    const cfg = safeContractConfig("PredictionEngine");
    writeContract({
      address: cfg.address,
      abi: cfg.abi,
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
    if (!isContractDeployed("PredictionEngine")) return;
    const cfg = safeContractConfig("PredictionEngine");
    writeContract({
      address: cfg.address,
      abi: cfg.abi,
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
    if (!isContractDeployed("PredictionEngine")) return;
    const cfg = safeContractConfig("PredictionEngine");
    writeContract({
      address: cfg.address,
      abi: cfg.abi,
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
    if (!isContractDeployed("PredictionEngine")) return;
    const cfg = safeContractConfig("PredictionEngine");
    writeContract({
      address: cfg.address,
      abi: cfg.abi,
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
    if (!isContractDeployed("PredictionEngine")) return;
    const cfg = safeContractConfig("PredictionEngine");
    writeContract({
      address: cfg.address,
      abi: cfg.abi,
      functionName: "resolve",
      args: [questionId, correctOption],
    });
  };

  return { resolve, hash, isPending, isConfirming, isSuccess, error };
}

// ─── Staking Vault Hooks ────────────────────────────────────────────

export function useStakeInfo(user?: Address) {
  return useSafeRead("StakingVault", "getStakeInfo", user ? [user] : undefined, !!user);
}

export function useUserTier(user?: Address) {
  return useSafeRead("StakingVault", "getUserTier", user ? [user] : undefined, !!user);
}

export function useBoostBPS(user?: Address) {
  return useSafeRead("StakingVault", "getBoostBPS", user ? [user] : undefined, !!user);
}

export function usePendingRewards(user?: Address) {
  return useSafeRead("StakingVault", "pendingRewards", user ? [user] : undefined, !!user);
}

export function useTotalStaked() {
  return useSafeRead("StakingVault", "totalStaked");
}

export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = (amount: bigint) => {
    if (!isContractDeployed("StakingVault")) return;
    const cfg = safeContractConfig("StakingVault");
    writeContract({
      address: cfg.address,
      abi: cfg.abi,
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
    if (!isContractDeployed("StakingVault")) return;
    const cfg = safeContractConfig("StakingVault");
    writeContract({
      address: cfg.address,
      abi: cfg.abi,
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
    if (!isContractDeployed("StakingVault")) return;
    const cfg = safeContractConfig("StakingVault");
    writeContract({
      address: cfg.address,
      abi: cfg.abi,
      functionName: "claimRewards",
    });
  };

  return { claimRewards, hash, isPending, isConfirming, isSuccess, error };
}

// ─── Badge NFT Hooks ────────────────────────────────────────────────

export function useUserBadges(user?: Address) {
  return useSafeRead("BadgeNFT", "getUserBadges", user ? [user] : undefined, !!user);
}

export function useBadgeBalance(user?: Address, tokenId?: bigint) {
  return useSafeRead(
    "BadgeNFT",
    "balanceOf",
    user && tokenId !== undefined ? [user, tokenId] : undefined,
    !!user && tokenId !== undefined,
  );
}

export function useBadgeURI(tokenId: bigint) {
  return useSafeRead("BadgeNFT", "uri", [tokenId]);
}

// ─── Season Pass Hooks ──────────────────────────────────────────────

export function useSeasonPassPrice() {
  return useSafeRead("SeasonPass", "currentPrice");
}

export function useRemainingPasses() {
  return useSafeRead("SeasonPass", "remainingSupply");
}

export function useHasActivePass(user?: Address) {
  return useSafeRead("SeasonPass", "hasActivePass", user ? [user] : undefined, !!user);
}

export function usePurchaseSeasonPass() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const purchase = () => {
    if (!isContractDeployed("SeasonPass")) return;
    const cfg = safeContractConfig("SeasonPass");
    writeContract({
      address: cfg.address,
      abi: cfg.abi,
      functionName: "purchase",
    });
  };

  return { purchase, hash, isPending, isConfirming, isSuccess, error };
}

// ─── Treasury Hooks ─────────────────────────────────────────────────

export function useTreasuryBalance() {
  return useSafeRead("Treasury", "treasuryBalance");
}

export function useTotalBurned() {
  return useSafeRead("Treasury", "totalBurned");
}

// ─── Formatting Helpers ─────────────────────────────────────────────

export function formatPicks(amount: bigint | undefined): string {
  if (!amount) return "0";
  try {
    const raw = formatEther(amount);
    const num = parseFloat(raw);
    if (!Number.isFinite(num) || num === 0) return "0";
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    if (Number.isInteger(num)) return num.toLocaleString();
    return num.toFixed(2);
  } catch {
    return "0";
  }
}

export function parsePicks(amount: string): bigint {
  const trimmed = amount.trim();
  if (!trimmed || !/^\d*\.?\d+$/.test(trimmed)) {
    throw new Error("Invalid $PICKS amount");
  }
  try {
    return parseEther(trimmed);
  } catch {
    throw new Error("Invalid $PICKS amount");
  }
}

export const TIER_NAMES = ["None", "Bronze", "Silver", "Gold"] as const;
export const TIER_COLORS = ["gray", "amber", "slate", "yellow"] as const;

export function getTierName(tier: number): string {
  return TIER_NAMES[tier] || "None";
}

// ─── RealityPicks NFT Collection Hooks ───────────────────────────────

export function useNFTTierInfo(tierId: number) {
  return useSafeRead("RealityPicksNFT", "getTierInfo", [BigInt(tierId)]);
}

export function useUserNFTTiers(address?: Address) {
  return useSafeRead("RealityPicksNFT", "getUserTiers", address ? [address] : undefined, !!address);
}

export function useHasMintedTier(address?: Address, tierId?: number) {
  return useSafeRead(
    "RealityPicksNFT",
    "hasMintedTier",
    address && tierId !== undefined ? [address, BigInt(tierId)] : undefined,
    !!address && tierId !== undefined,
  );
}

export function useNFTNonce(address?: Address) {
  return useSafeRead("RealityPicksNFT", "getNonce", address ? [address] : undefined, !!address);
}

export function useMintNFT() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mintOpen = (tierId: number, price: bigint) => {
    if (!isContractDeployed("RealityPicksNFT")) return;
    const config = realityPicksNFTConfig();
    writeContract({
      address: config.address,
      abi: config.abi,
      functionName: "mint",
      args: [BigInt(tierId)],
      value: price,
    } as any);
  };

  const mintWithSig = (tierId: number, signature: `0x${string}`, price: bigint) => {
    if (!isContractDeployed("RealityPicksNFT")) return;
    const config = realityPicksNFTConfig();
    writeContract({
      address: config.address,
      abi: config.abi,
      functionName: "mintWithSignature",
      args: [BigInt(tierId), signature],
      value: price,
    } as any);
  };

  return { mintOpen, mintWithSig, hash, isPending, isConfirming, isSuccess, error };
}

// ─── Contract Readiness Check ────────────────────────────────────────

/**
 * Check if contracts are deployed and ready (addresses are not 0x0).
 * Returns true if the core contracts (PicksToken, StakingVault) have valid addresses.
 */
export function useIsContractsReady(): boolean {
  return isContractDeployed("PicksToken") && isContractDeployed("StakingVault");
}
