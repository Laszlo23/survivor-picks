import { ABIS } from "./abis";
import { getChainId } from "./config";
import { type Address } from "viem";

/**
 * Contract addresses per chain.
 * Populated after deployment. For local dev, run `npx hardhat node` + deploy script.
 * For testnet/mainnet, update with actual deployed addresses.
 */
const ADDRESSES: Record<number, Record<string, Address>> = {
  // Hardhat local (populated by deploy script)
  31337: {
    PicksToken: (process.env.NEXT_PUBLIC_PICKS_TOKEN_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3") as Address,
    PredictionEngine: (process.env.NEXT_PUBLIC_PREDICTION_ENGINE_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0") as Address,
    StakingVault: (process.env.NEXT_PUBLIC_STAKING_VAULT_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9") as Address,
    BadgeNFT: (process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS || "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9") as Address,
    SeasonPass: (process.env.NEXT_PUBLIC_SEASON_PASS_ADDRESS || "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707") as Address,
    Treasury: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512") as Address,
  },
  // Base Sepolia testnet
  84532: {
    PicksToken: (process.env.NEXT_PUBLIC_PICKS_TOKEN_ADDRESS || "0x0") as Address,
    PredictionEngine: (process.env.NEXT_PUBLIC_PREDICTION_ENGINE_ADDRESS || "0x0") as Address,
    StakingVault: (process.env.NEXT_PUBLIC_STAKING_VAULT_ADDRESS || "0x0") as Address,
    BadgeNFT: (process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS || "0x0") as Address,
    SeasonPass: (process.env.NEXT_PUBLIC_SEASON_PASS_ADDRESS || "0x0") as Address,
    Treasury: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "0x0") as Address,
  },
  // Base mainnet
  8453: {
    PicksToken: (process.env.NEXT_PUBLIC_PICKS_TOKEN_ADDRESS || "0x0") as Address,
    PredictionEngine: (process.env.NEXT_PUBLIC_PREDICTION_ENGINE_ADDRESS || "0x0") as Address,
    StakingVault: (process.env.NEXT_PUBLIC_STAKING_VAULT_ADDRESS || "0x0") as Address,
    BadgeNFT: (process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS || "0x0") as Address,
    SeasonPass: (process.env.NEXT_PUBLIC_SEASON_PASS_ADDRESS || "0x0") as Address,
    Treasury: (process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "0x0") as Address,
  },
};

export function getContractAddress(contractName: string): Address {
  const chainId = getChainId();
  const addrs = ADDRESSES[chainId];
  if (!addrs || !addrs[contractName]) {
    throw new Error(`No address for ${contractName} on chain ${chainId}`);
  }
  return addrs[contractName];
}

export function getContractConfig(contractName: keyof typeof ABIS) {
  return {
    address: getContractAddress(contractName),
    abi: ABIS[contractName],
  } as const;
}

// Convenience exports
export const picksTokenConfig = () => getContractConfig("PicksToken");
export const predictionEngineConfig = () => getContractConfig("PredictionEngine");
export const stakingVaultConfig = () => getContractConfig("StakingVault");
export const badgeNFTConfig = () => getContractConfig("BadgeNFT");
export const seasonPassConfig = () => getContractConfig("SeasonPass");
export const treasuryConfig = () => getContractConfig("Treasury");

export { ABIS };
