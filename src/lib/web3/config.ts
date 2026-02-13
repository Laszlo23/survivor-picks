import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { base, baseSepolia, hardhat } from "wagmi/chains";

// Use hardhat for local dev, baseSepolia for testnet, base for mainnet
const activeChains =
  process.env.NEXT_PUBLIC_CHAIN === "mainnet"
    ? ([base] as const)
    : process.env.NEXT_PUBLIC_CHAIN === "testnet"
      ? ([baseSepolia] as const)
      : ([hardhat] as const);

export const wagmiConfig = getDefaultConfig({
  appName: "SurvivorPicks",
  appDescription: "Survivor prediction market on Base",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://survivorpicks.com",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: activeChains,
  transports: {
    [base.id]: http(
      process.env.NEXT_PUBLIC_BASE_RPC || "https://mainnet.base.org"
    ),
    [baseSepolia.id]: http(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"
    ),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
  ssr: true,
});

export const getChainId = () => {
  if (process.env.NEXT_PUBLIC_CHAIN === "mainnet") return base.id;
  if (process.env.NEXT_PUBLIC_CHAIN === "testnet") return baseSepolia.id;
  return hardhat.id;
};
