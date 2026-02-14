"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Flame,
  TrendingUp,
  Zap,
  Shield,
  ExternalLink,
  Coins,
  BarChart3,
  Lock,
  Gift,
} from "lucide-react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@/components/web3/connect-wallet";
import {
  usePicksBalance,
  useTotalStaked,
  useTreasuryBalance,
  useTotalBurned,
  formatPicks,
} from "@/lib/web3/hooks";
import { getContractAddress } from "@/lib/web3/contracts";
import { BuyPicksModal } from "@/components/web3/buy-picks-modal";
import {
  FadeIn,
  GlowCard,
  StaggerContainer,
  StaggerItem,
  PressScale,
  AnimatedBar,
} from "@/components/motion";

export function TokenClient() {
  const { address, isConnected } = useAccount();
  const { data: balance } = usePicksBalance(address);
  const { data: totalStaked } = useTotalStaked();
  const { data: treasuryBalance } = useTreasuryBalance();
  const { data: totalBurned } = useTotalBurned();

  let tokenAddress = "";
  try {
    tokenAddress = getContractAddress("PicksToken");
  } catch {
    // Not configured yet
  }

  const clankerUrl =
    process.env.NEXT_PUBLIC_CLANKER_TOKEN_URL ||
    (tokenAddress
      ? `https://www.clanker.world/clanker/${tokenAddress}`
      : "https://www.clanker.world");
  const uniswapUrl = tokenAddress
    ? `https://app.uniswap.org/swap?outputCurrency=${tokenAddress}&chain=base`
    : "https://app.uniswap.org";
  const basescanUrl = tokenAddress
    ? `https://basescan.org/token/${tokenAddress}`
    : "https://basescan.org";
  const dexscreenerUrl = tokenAddress
    ? `https://dexscreener.com/base/${tokenAddress}`
    : "https://dexscreener.com";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <FadeIn>
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-display font-bold flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <Coins className="h-7 w-7 sm:h-8 sm:w-8 text-primary shrink-0 relative z-10" />
                  <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full" />
                </div>
                <span className="text-gradient">$PICKS</span>{" "}
                Token
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                The utility token powering RealityPicks on Base
              </p>
            </div>
            <div className="shrink-0">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Balance Card */}
      {isConnected && (
        <FadeIn delay={0.1}>
          <div className="mb-8 p-5 sm:p-6 rounded-2xl gradient-border bg-gradient-to-br from-primary/10 via-card/60 to-cyan-900/20 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-primary/80">Your $PICKS Balance</p>
                <p className="text-3xl sm:text-4xl font-display font-bold text-white truncate mt-1">
                  {formatPicks(balance as bigint | undefined)}
                </p>
              </div>
              <div className="shrink-0">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-float">
                  <Coins className="h-7 w-7 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Buy / Trade Actions */}
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <StaggerItem>
          <PressScale>
            <BuyPicksModal>
              <button
                className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-pink-950/40 to-purple-950/40 border border-neon-cyan/20 hover:border-neon-cyan/40 hover:shadow-neon-cyan transition-all group w-full text-left"
              >
                <div className="p-3 bg-neon-cyan/10 rounded-xl border border-neon-cyan/20">
                  <Zap className="h-6 w-6 text-neon-cyan" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg">Buy $PICKS</h3>
                  <p className="text-sm text-muted-foreground">
                    Swap tokens on Uniswap (Base)
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-neon-cyan transition-colors" />
              </button>
            </BuyPicksModal>
          </PressScale>
        </StaggerItem>
        <StaggerItem>
          <PressScale>
            <a
              href={clankerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-blue-950/40 to-cyan-950/40 border border-blue-500/20 hover:border-blue-500/40 hover:shadow-[0_0_20px_hsl(220_70%_50%/0.15)] transition-all group"
            >
              <div className="p-3 bg-blue-500/15 rounded-xl border border-blue-500/20">
                <BarChart3 className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg">View on Clanker</h3>
                <p className="text-sm text-muted-foreground">
                  Token info, LP rewards, admin
                </p>
              </div>
              <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
            </a>
          </PressScale>
        </StaggerItem>
      </StaggerContainer>

      {/* Protocol Stats */}
      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total Staked", value: totalStaked ? formatPicks(totalStaked as bigint) : "0", icon: Lock, color: "text-blue-400" },
          { label: "Treasury", value: treasuryBalance ? formatPicks(treasuryBalance as bigint) : "0", icon: Shield, color: "text-neon-cyan" },
          { label: "Total Burned", value: totalBurned ? formatPicks(totalBurned as bigint) : "0", icon: Flame, color: "text-red-400" },
          { label: "Total Supply", value: "1B", icon: Coins, color: "text-amber-400" },
        ].map((stat) => (
          <StaggerItem key={stat.label}>
            <GlowCard className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-lg font-bold font-mono truncate">{stat.value}</p>
            </GlowCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { href: basescanUrl, label: "Basescan", desc: "View contract" },
          { href: dexscreenerUrl, label: "DEX Screener", desc: "Price charts" },
          { href: uniswapUrl, label: "Uniswap", desc: "Trade" },
          { href: clankerUrl, label: "Clanker", desc: "Admin & rewards" },
        ].map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all group"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{link.label}</p>
              <p className="text-xs text-muted-foreground truncate">{link.desc}</p>
            </div>
            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
          </a>
        ))}
      </div>

      {/* How $PICKS Works - Visual Flow */}
      <FadeIn>
        <div className="mb-8 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
          <h2 className="text-xl font-display font-bold mb-6 text-center">
            How <span className="text-gradient">$PICKS</span> Works
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {[
              { icon: TrendingUp, label: "Predict", color: "text-neon-cyan", bg: "bg-neon-cyan/10 border-neon-cyan/20" },
              { icon: Lock, label: "Stake", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { icon: Gift, label: "Earn", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
              { icon: Flame, label: "Burn", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-3 sm:gap-4">
                <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border ${step.bg}`}>
                  <step.icon className={`h-6 w-6 ${step.color}`} />
                  <span className="text-xs font-semibold">{step.label}</span>
                </div>
                {i < 3 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Token Utility */}
        <GlowCard className="p-6">
          <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            What is $PICKS?
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              $PICKS is the utility token for the RealityPicks prediction
              platform, deployed on <strong className="text-foreground">Base</strong> (Ethereum L2)
              via Clanker for instant liquidity and fair launch.
            </p>
            <div className="space-y-3">
              {[
                { icon: TrendingUp, title: "Predict", desc: "Stake $PICKS on episode outcomes. Winners share the pool (97%, minus 3% platform fee).", color: "text-neon-cyan" },
                { icon: Lock, title: "Stake", desc: "Lock $PICKS to earn staking rewards and boost your prediction multiplier up to 1.5x.", color: "text-blue-400" },
                { icon: Flame, title: "Season Pass", desc: "Burn $PICKS for a premium Season Pass NFT with exclusive perks and boosted rewards.", color: "text-red-400" },
                { icon: Gift, title: "Earn Badges", desc: "Collect achievement NFTs as you play. Some are tradeable on secondary markets.", color: "text-purple-400" },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="mt-0.5">
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GlowCard>

        {/* Tokenomics */}
        <GlowCard className="p-6">
          <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Tokenomics
          </h2>
          <div className="space-y-4">
            {[
              { label: "Uniswap V4 LP", pct: 45, color: "bg-pink-500", textColor: "text-pink-400", note: "~450M" },
              { label: "Vaulted (Team + Community)", pct: 50, color: "bg-blue-500", textColor: "text-blue-400", note: "~500M" },
              { label: "Airdrop (Early Supporters)", pct: 5, color: "bg-neon-cyan", textColor: "text-neon-cyan", note: "~50M" },
            ].map((item, i) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className={item.textColor}>{item.label}</span>
                  <span className="font-mono font-bold">{item.pct}%</span>
                </div>
                <AnimatedBar
                  percentage={item.pct}
                  color={item.color}
                  className="h-2"
                  delay={0.2 + i * 0.15}
                />
              </div>
            ))}

            <div className="pt-4 border-t border-white/[0.06] mt-4">
              <h3 className="font-display font-semibold text-sm mb-3">Deflationary Mechanics</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="text-red-400 font-medium">3% prediction fee</span> flows
                  to Treasury for buyback and burn
                </p>
                <p>
                  <span className="text-red-400 font-medium">Season Pass burns</span> permanently
                  reduce circulating supply
                </p>
                <p>
                  <span className="text-red-400 font-medium">Community burns</span> any holder
                  can burn their tokens voluntarily
                </p>
              </div>
            </div>
          </div>
        </GlowCard>
      </div>

      {/* Revenue Model */}
      <FadeIn delay={0.2}>
        <div className="mt-8 p-6 rounded-2xl gradient-border bg-gradient-to-br from-primary/5 via-card/60 to-cyan-950/30 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[100px]" />
          <div className="relative">
            <h2 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              How Value Accrues
            </h2>
            <StaggerContainer className="grid md:grid-cols-3 gap-4">
              {[
                { title: "LP Trading Fees", desc: "Every $PICKS trade generates LP fees. More users = more volume = more revenue.", icon: BarChart3, color: "text-pink-400" },
                { title: "Prediction Fees", desc: "3% of all stakes flow to Treasury. Used for buyback-and-burn.", icon: Shield, color: "text-neon-cyan" },
                { title: "Deflationary Burns", desc: "Season Passes, buybacks, and community burns reduce supply permanently.", icon: Flame, color: "text-red-400" },
              ].map((item) => (
                <StaggerItem key={item.title}>
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </FadeIn>

      {/* Contract Info */}
      {tokenAddress && tokenAddress !== "0x0" && (
        <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <p className="text-xs text-muted-foreground font-mono break-all">
            Token Contract: {tokenAddress} (Base)
          </p>
        </div>
      )}
    </div>
  );
}
