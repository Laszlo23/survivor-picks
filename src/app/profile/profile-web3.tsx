"use client";

import React from "react";
import { useAccount } from "wagmi";
import Image from "next/image";
import Link from "next/link";
import { BadgeGallery } from "@/components/web3/badge-gallery";
import { WalletLink } from "@/components/web3/wallet-link";
import { usePicksBalance, useUserTier, useStakeInfo, useUserNFTTiers, formatPicks, getTierName } from "@/lib/web3/hooks";
import { isContractDeployed } from "@/lib/web3/contracts";
import { Wallet, Coins, Sparkles, ChevronRight, AlertTriangle } from "lucide-react";

// ─── Error Boundary to catch Web3 hook failures gracefully ──────────

class Web3ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.warn("[ProfileWeb3] Error caught:", error.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
          <AlertTriangle className="h-6 w-6 text-amber-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Web3 data temporarily unavailable. Please refresh or connect your wallet.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── NFT tier images & names ────────────────────────────────────────

const NFT_TIERS = [
  { id: 0, name: "Early Supporter", image: "/nfts/early-supporter.png", border: "border-amber-500/30" },
  { id: 1, name: "Player", image: "/nfts/player.png", border: "border-indigo-500/30" },
  { id: 2, name: "Community OG", image: "/nfts/community-og.png", border: "border-teal-500/30" },
  { id: 3, name: "Survivor Pro", image: "/nfts/survivor-pro.png", border: "border-red-500/30" },
  { id: 4, name: "Legend", image: "/nfts/legend.png", border: "border-yellow-500/40" },
];

// ─── NFT Collection Showcase ────────────────────────────────────────

function NFTShowcase() {
  const { address } = useAccount();
  const { data: userTierIds, isLoading } = useUserNFTTiers(address);
  const nftReady = isContractDeployed("RealityPicksNFT");

  if (!nftReady) return null;

  const ownedTiers = (userTierIds as bigint[] | undefined) || [];
  const ownedSet = new Set(ownedTiers.map((t) => Number(t)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          NFT Collection
        </h3>
        <Link
          href="/nfts"
          className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          Mint More <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Loading collection...</span>
        </div>
      ) : ownedTiers.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {NFT_TIERS.map((nft) => {
            const owned = ownedSet.has(nft.id);
            return (
              <Link
                key={nft.id}
                href="/nfts"
                className={`relative rounded-xl overflow-hidden border transition-all ${
                  owned
                    ? `${nft.border} shadow-sm`
                    : "border-white/[0.06] opacity-40 grayscale"
                }`}
              >
                <div className="aspect-square relative">
                  <Image
                    src={nft.image}
                    alt={nft.name}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                  {owned && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm px-1.5 py-1">
                      <p className="text-[9px] font-bold text-white text-center truncate">
                        {nft.name}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <Link
          href="/nfts"
          className="block p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors text-center"
        >
          <Sparkles className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No NFTs yet</p>
          <p className="text-xs text-primary mt-1">Mint your first NFT &rarr;</p>
        </Link>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

function ProfileWeb3Inner() {
  const { address, isConnected } = useAccount();
  const { data: balance } = usePicksBalance(address);
  const { data: tier } = useUserTier(address);
  const { data: stakeInfo } = useStakeInfo(address);

  const userStaked = stakeInfo ? (stakeInfo as [bigint, bigint, bigint])[0] : 0n;
  const userTier = Number(tier || 0n);

  return (
    <div className="space-y-6">
      {/* Wallet Section */}
      <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-800/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Wallet className="h-4 w-4 text-blue-400" />
            Web3 Wallet
          </h3>
          <WalletLink />
        </div>

        {isConnected && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3">
            <div className="p-2 sm:p-3 bg-zinc-900/50 rounded-lg">
              <p className="text-[10px] sm:text-xs text-zinc-500">$PICKS</p>
              <p className="text-sm sm:text-lg font-bold text-white truncate">{formatPicks(balance as bigint | undefined)}</p>
            </div>
            <div className="p-2 sm:p-3 bg-zinc-900/50 rounded-lg">
              <p className="text-[10px] sm:text-xs text-zinc-500">Staked</p>
              <p className="text-sm sm:text-lg font-bold text-white truncate">{formatPicks(userStaked)}</p>
            </div>
            <div className="p-2 sm:p-3 bg-zinc-900/50 rounded-lg">
              <p className="text-[10px] sm:text-xs text-zinc-500">Tier</p>
              <p className={`text-sm sm:text-lg font-bold truncate ${
                userTier === 3 ? "text-yellow-400" :
                userTier === 2 ? "text-zinc-300" :
                userTier === 1 ? "text-amber-500" : "text-zinc-500"
              }`}>
                {getTierName(userTier)}
              </p>
            </div>
          </div>
        )}

        {isConnected && (
          <Link
            href="/staking"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-3"
          >
            <Coins className="h-3 w-3" />
            Go to Staking Dashboard &rarr;
          </Link>
        )}
      </div>

      {/* NFT Collection Showcase */}
      {isConnected && <NFTShowcase />}

      {/* NFT Badge Gallery (legacy ERC-1155 badges) */}
      <BadgeGallery />
    </div>
  );
}

export function ProfileWeb3Section() {
  return (
    <Web3ErrorBoundary>
      <ProfileWeb3Inner />
    </Web3ErrorBoundary>
  );
}
