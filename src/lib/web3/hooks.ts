// Web3 hooks — dormant until on-chain fair launch
// All on-chain interactions disabled for web2-first onboarding

export function formatPicks(value: bigint | undefined): string {
  if (!value) return "0";
  const n = Number(value) / 1e18;
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export function getTierName(tier: number): string {
  switch (tier) {
    case 3: return "Gold";
    case 2: return "Silver";
    case 1: return "Bronze";
    default: return "None";
  }
}

export function toBytes32(id: string): `0x${string}` {
  const hex = Buffer.from(id).toString("hex").padEnd(64, "0");
  return `0x${hex}` as `0x${string}`;
}

export function usePicksBalance(_address?: string) { return { data: undefined }; }
export function usePicksAllowance(_a?: string, _b?: string) { return { data: undefined }; }
export function useApprovePicksToken() { return { approve: () => {}, isPending: false, isConfirming: false }; }
export function useMakePrediction() { return { predict: () => {}, hash: undefined, isPending: false, isConfirming: false, isSuccess: false }; }
export function useIsContractsReady() { return false; }
export function useUserTier(_a?: string) { return { data: undefined }; }
export function useStakeInfo(_a?: string) { return { data: undefined }; }
export function useUserNFTTiers(_a?: string) { return { data: undefined, isLoading: false }; }
export function useUserBadges(_a?: string) { return { data: undefined }; }
export function useBadgeURI(_a?: bigint) { return { data: undefined }; }
export function useTotalStaked() { return { data: undefined }; }
export function useTreasuryBalance() { return { data: undefined }; }
export function useTotalBurned() { return { data: undefined }; }
export function useNFTTierInfo(_a?: number) { return { data: undefined }; }
export function useHasMintedTier(_a?: string, _b?: number) { return { data: undefined }; }
export function useMintNFT() { return { mint: () => {}, isPending: false }; }
export function useStake() { return { stake: () => {}, isPending: false }; }
export function useUnstake() { return { unstake: () => {}, isPending: false }; }
export function useClaimStakingRewards() { return { claim: () => {}, isPending: false }; }
export function useCalculatePayout() { return { data: undefined }; }
export function useClaimReward() { return { claim: () => {}, isPending: false }; }
export function useBoostBPS() { return { data: undefined }; }
export function usePendingRewards() { return { data: undefined }; }
export function useRewardRate() { return { data: undefined }; }
export function useRewardEndTime() { return { data: undefined }; }
