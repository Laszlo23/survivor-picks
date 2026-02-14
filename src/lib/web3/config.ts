import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { createConfig, http } from "wagmi";
import { base, baseSepolia, hardhat } from "wagmi/chains";

// Use hardhat for local dev, baseSepolia for testnet, base for mainnet
const activeChains =
  process.env.NEXT_PUBLIC_CHAIN === "mainnet"
    ? ([base] as const)
    : process.env.NEXT_PUBLIC_CHAIN === "testnet"
      ? ([baseSepolia] as const)
      : ([hardhat] as const);

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo";

// RainbowKit wallet connectors (for standalone web mode)
const rainbowKitConnectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        coinbaseWallet,
        metaMaskWallet,
        rainbowWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: "RealityPicks",
    appDescription: "Reality TV prediction market on Base",
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz",
    projectId,
  }
);

export const wagmiConfig = createConfig({
  chains: activeChains,
  connectors: [
    // Farcaster Mini App connector (auto-connects inside Warpcast/Farcaster)
    farcasterMiniApp(),
    // Standard wallet connectors (for standalone web users)
    ...rainbowKitConnectors,
  ],
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
