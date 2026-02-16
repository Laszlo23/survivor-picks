"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem, PressScale } from "@/components/motion";
import { ConnectWallet } from "@/components/web3/connect-wallet";
import {
  useNFTTierInfo,
  useHasMintedTier,
  useMintNFT,
} from "@/lib/web3/hooks";
import { isContractDeployed } from "@/lib/web3/contracts";
import {
  Lock,
  Check,
  Loader2,
  Crown,
  Shield,
  Flame,
  Users,
  Sparkles,
  ExternalLink,
} from "lucide-react";

// ─── Tier Metadata ──────────────────────────────────────────────────

interface TierMeta {
  id: number;
  name: string;
  image: string;
  maxSupply: number;
  price: string;
  priceWei: bigint;
  description: string;
  requirement: string;
  icon: typeof Crown;
  gradient: string;
  glowColor: string;
  borderColor: string;
  badgeColor: string;
  soulbound: boolean;
  requireSig: boolean;
}

const TIER_META: TierMeta[] = [
  {
    id: 0,
    name: "Early Supporter",
    image: "/nfts/early-supporter.png",
    maxSupply: 1111,
    price: "0.000111",
    priceWei: 111000000000000n,
    description: "Be one of the first 1,111 to join the RealityPicks revolution. First come, first served.",
    requirement: "Open mint — anyone can mint!",
    icon: Shield,
    gradient: "from-amber-900/40 via-yellow-900/30 to-orange-900/40",
    glowColor: "rgba(251, 191, 36, 0.3)",
    borderColor: "border-amber-500/30",
    badgeColor: "bg-amber-500/20 text-amber-400",
    soulbound: false,
    requireSig: false,
  },
  {
    id: 1,
    name: "Player",
    image: "/nfts/player.png",
    maxSupply: 3000,
    price: "0.00111",
    priceWei: 1110000000000000n,
    description: "Proven predictor. You've made your first 10 picks and you're hooked.",
    requirement: "Make 10+ predictions to unlock",
    icon: Flame,
    gradient: "from-blue-900/40 via-indigo-900/30 to-purple-900/40",
    glowColor: "rgba(99, 102, 241, 0.3)",
    borderColor: "border-indigo-500/30",
    badgeColor: "bg-indigo-500/20 text-indigo-400",
    soulbound: false,
    requireSig: true,
  },
  {
    id: 2,
    name: "Community OG",
    image: "/nfts/community-og.png",
    maxSupply: 1000,
    price: "0.00333",
    priceWei: 3330000000000000n,
    description: "The backbone of RealityPicks. You brought your crew and earned your stripes.",
    requirement: "Refer 3+ friends & hold Early Supporter",
    icon: Users,
    gradient: "from-emerald-900/40 via-teal-900/30 to-cyan-900/40",
    glowColor: "rgba(20, 184, 166, 0.3)",
    borderColor: "border-teal-500/30",
    badgeColor: "bg-teal-500/20 text-teal-400",
    soulbound: false,
    requireSig: true,
  },
  {
    id: 3,
    name: "Survivor Pro",
    image: "/nfts/survivor-pro.png",
    maxSupply: 500,
    price: "0.00888",
    priceWei: 8880000000000000n,
    description: "The fire burns bright. 70%+ accuracy with 25+ predictions. A true expert.",
    requirement: "70%+ win rate, 25+ predictions & hold Player NFT",
    icon: Flame,
    gradient: "from-orange-900/40 via-red-900/30 to-amber-900/40",
    glowColor: "rgba(239, 68, 68, 0.4)",
    borderColor: "border-red-500/30",
    badgeColor: "bg-red-500/20 text-red-400",
    soulbound: false,
    requireSig: true,
  },
  {
    id: 4,
    name: "Legend",
    image: "/nfts/legend.png",
    maxSupply: 111,
    price: "0.0111",
    priceWei: 11100000000000000n,
    description: "Only 111 will ever exist. Top 10 leaderboard status. Soulbound — forever yours.",
    requirement: "Top 10 on leaderboard & hold Survivor Pro — soulbound",
    icon: Crown,
    gradient: "from-yellow-900/40 via-amber-800/30 to-orange-900/40",
    glowColor: "rgba(234, 179, 8, 0.4)",
    borderColor: "border-yellow-500/40",
    badgeColor: "bg-yellow-500/20 text-yellow-400",
    soulbound: true,
    requireSig: true,
  },
];

// ─── Eligibility Data ───────────────────────────────────────────────

interface TierEligibility {
  tierId: number;
  name: string;
  eligible: boolean;
  reason: string;
  signature: string | null;
}

interface EligibilityResponse {
  walletAddress: string;
  stats: {
    predictionCount: number;
    winRate: number;
    totalResolved: number;
    referralCount: number;
    leaderboardRank: number | null;
  };
  tiers: TierEligibility[];
}

// ─── Single Tier Card ───────────────────────────────────────────────

function NFTTierCard({
  tier,
  eligibility,
  onMint,
  isMinting,
}: {
  tier: TierMeta;
  eligibility?: TierEligibility;
  onMint: (tierId: number, sig: string | null) => void;
  isMinting: boolean;
}) {
  const { address } = useAccount();
  const { data: onChainInfo } = useNFTTierInfo(tier.id);
  const { data: hasMinted } = useHasMintedTier(address, tier.id);

  const remaining = onChainInfo
    ? Number((onChainInfo as any)[3]) // remaining_
    : tier.maxSupply;
  const minted = onChainInfo
    ? Number((onChainInfo as any)[2]) // minted_
    : 0;
  const isActive = onChainInfo ? (onChainInfo as any)[5] as boolean : tier.id === 0;
  const alreadyMinted = hasMinted === true;

  const isEligible = eligibility?.eligible ?? false;
  const canMint = isActive && isEligible && !alreadyMinted && remaining > 0;
  const soldOut = remaining === 0;

  const Icon = tier.icon;
  const percentMinted = tier.maxSupply > 0 ? (minted / tier.maxSupply) * 100 : 0;

  return (
    <motion.div
      className={`relative rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden transition-all duration-500 ${
        alreadyMinted
          ? "border-neon-cyan/40 shadow-[0_0_30px_hsl(185_100%_55%/0.15)]"
          : canMint
          ? `${tier.borderColor} shadow-[0_0_30px_${tier.glowColor}]`
          : "border-white/[0.06] opacity-80"
      }`}
      whileHover={canMint ? { scale: 1.01, y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Gradient accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${tier.gradient}`} />

      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={tier.image}
          alt={tier.name}
          fill
          className={`object-cover transition-all duration-500 ${
            !canMint && !alreadyMinted ? "grayscale-[60%] brightness-75" : ""
          }`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay for locked state */}
        {!canMint && !alreadyMinted && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
              <Lock className="h-4 w-4 text-white/70" />
              <span className="text-sm font-medium text-white/80">
                {soldOut ? "Sold Out" : !isActive ? "Coming Soon" : "Locked"}
              </span>
            </div>
          </div>
        )}

        {/* Minted badge */}
        {alreadyMinted && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-neon-cyan/90 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Check className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-bold text-white">OWNED</span>
          </div>
        )}

        {/* Soulbound badge */}
        {tier.soulbound && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-purple-500/80 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-white" />
            <span className="text-[10px] font-bold text-white uppercase">Soulbound</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tier.badgeColor}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base leading-tight">
                {tier.name}
              </h3>
              <p className="text-[10px] text-muted-foreground">
                {minted}/{tier.maxSupply} minted
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold font-mono">{tier.price} ETH</p>
            <p className="text-[10px] text-muted-foreground">{remaining} left</p>
          </div>
        </div>

        {/* Supply bar */}
        <div className="w-full h-1.5 rounded-full bg-white/[0.06] mb-3 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${tier.gradient}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentMinted}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          {tier.description}
        </p>

        {/* Requirement */}
        <div className="flex items-start gap-2 text-xs mb-4 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          {isEligible ? (
            <Check className="h-3.5 w-3.5 text-neon-cyan shrink-0 mt-0.5" />
          ) : (
            <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          )}
          <span className={isEligible ? "text-neon-cyan" : "text-muted-foreground"}>
            {eligibility?.reason || tier.requirement}
          </span>
        </div>

        {/* Mint button */}
        {alreadyMinted ? (
          <Button
            variant="secondary"
            size="sm"
            className="w-full gap-2 pointer-events-none"
            disabled
          >
            <Check className="h-4 w-4 text-neon-cyan" />
            Minted
          </Button>
        ) : canMint ? (
          <PressScale>
            <Button
              size="sm"
              className="w-full gap-2 font-bold"
              onClick={() => onMint(tier.id, eligibility?.signature || null)}
              disabled={isMinting}
            >
              {isMinting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isMinting ? "Minting..." : `Mint for ${tier.price} ETH`}
            </Button>
          </PressScale>
        ) : (
          <Button variant="secondary" size="sm" className="w-full" disabled>
            {soldOut ? "Sold Out" : !isActive ? "Coming Soon" : "Requirements Not Met"}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────

export function NFTCollectionClient() {
  const { address, isConnected } = useAccount();
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [mintingTier, setMintingTier] = useState<number | null>(null);
  const { mintOpen, mintWithSig, isPending, isConfirming, isSuccess, error } = useMintNFT();

  const nftReady = isContractDeployed("RealityPicksNFT");

  const fetchEligibility = useCallback(async () => {
    if (!isConnected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/nft/eligibility");
      if (res.ok) {
        const data = await res.json();
        setEligibility(data);
      }
    } catch (e) {
      console.error("Failed to fetch eligibility:", e);
    } finally {
      setLoading(false);
    }
  }, [isConnected]);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  // Handle mint success
  useEffect(() => {
    if (isSuccess && mintingTier !== null) {
      toast.success(`${TIER_META[mintingTier].name} NFT minted!`, {
        description: "Welcome to the club! Check your profile.",
        duration: 5000,
      });
      setMintingTier(null);
      // Refresh eligibility after mint
      setTimeout(fetchEligibility, 2000);
    }
  }, [isSuccess, mintingTier, fetchEligibility]);

  useEffect(() => {
    if (error) {
      toast.error("Mint failed", {
        description: error.message?.slice(0, 100) || "Transaction rejected",
      });
      setMintingTier(null);
    }
  }, [error]);

  const handleMint = (tierId: number, signature: string | null) => {
    const tier = TIER_META[tierId];
    setMintingTier(tierId);

    if (tier.requireSig && signature) {
      mintWithSig(tierId, signature as `0x${string}`, tier.priceWei);
    } else {
      mintOpen(tierId, tier.priceWei);
    }
  };

  const isMinting = isPending || isConfirming;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28">
      {/* Header */}
      <FadeIn>
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-3">
            Reality<span className="text-primary">Picks</span>{" "}
            <span className="text-gradient">Collection</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Exclusive NFTs on Base. Earn your way up from Early Supporter to the
            ultra-rare Legend. 75% of mint revenue goes to $PICKS liquidity.
          </p>
        </div>
      </FadeIn>

      {/* Wallet Connection */}
      {!isConnected && (
        <ScaleIn>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-6 p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <Shield className="h-12 w-12 text-primary mx-auto mb-3 animate-float" />
              <h3 className="font-display font-semibold text-lg mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                Connect your wallet to check eligibility and mint your NFTs on Base.
              </p>
              <ConnectWallet />
            </div>
          </div>
        </ScaleIn>
      )}

      {/* NFT Not Deployed Notice */}
      {isConnected && !nftReady && (
        <FadeIn>
          <div className="text-center py-8 mb-8 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-3" />
            <h3 className="font-display font-semibold text-lg mb-1">
              Collection Coming Soon
            </h3>
            <p className="text-sm text-muted-foreground">
              The NFT contract is being deployed to Base. Check back shortly!
            </p>
          </div>
        </FadeIn>
      )}

      {/* Stats Bar */}
      {eligibility?.stats && (
        <FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Predictions", value: eligibility.stats.predictionCount },
              { label: "Win Rate", value: `${eligibility.stats.winRate}%` },
              { label: "Referrals", value: eligibility.stats.referralCount },
              { label: "Rank", value: eligibility.stats.leaderboardRank ? `#${eligibility.stats.leaderboardRank}` : "—" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center"
              >
                <p className="text-lg font-bold font-mono">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-muted-foreground">Checking eligibility...</span>
        </div>
      )}

      {/* Tier Cards Grid */}
      <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TIER_META.map((tier, i) => (
          <StaggerItem key={tier.id}>
            <NFTTierCard
              tier={tier}
              eligibility={eligibility?.tiers.find((t) => t.tierId === tier.id)}
              onMint={handleMint}
              isMinting={isMinting && mintingTier === tier.id}
            />
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Season Pass - Coming Soon */}
      <FadeIn>
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-violet-950/30 to-purple-950/20 border border-violet-500/20">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/20">
              <Crown className="h-7 w-7 text-violet-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-display font-bold text-lg text-white">Season Pass</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/20">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-violet-300/70">
                Premium access with exclusive perks — boosted points, priority predictions, and unique rewards.
                Burns $PICKS tokens on purchase.
              </p>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Revenue Info */}
      <FadeIn>
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            75% of mint revenue goes to $PICKS liquidity &middot; 25% to treasury
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
