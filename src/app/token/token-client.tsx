"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  TrendingUp,
  Users,
  Zap,
  Shield,
  ExternalLink,
  Coins,
  BarChart3,
  Lock,
  Gift,
} from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { ConnectWallet } from "@/components/web3/connect-wallet";
import {
  usePicksBalance,
  useTotalStaked,
  useTreasuryBalance,
  useTotalBurned,
  formatPicks,
} from "@/lib/web3/hooks";
import { getContractAddress } from "@/lib/web3/contracts";

export function TokenClient() {
  const { address, isConnected } = useAccount();
  const { data: balance } = usePicksBalance(address);
  const { data: totalStaked } = useTotalStaked();
  const { data: treasuryBalance } = useTreasuryBalance();
  const { data: totalBurned } = useTotalBurned();

  // Token address for links
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
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
              <Flame className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400 shrink-0" />
              $PICKS Token
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              The utility token powering SurvivorPicks on Base
            </p>
          </div>
          <div className="shrink-0">
            <ConnectWallet />
          </div>
        </div>
      </div>

      {/* Your Balance */}
      {isConnected && (
        <div className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-orange-900/30 to-amber-900/30 rounded-xl border border-orange-800/30">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm text-orange-300">Your $PICKS Balance</p>
              <p className="text-2xl sm:text-3xl font-bold text-white truncate">
                {formatPicks(balance as bigint | undefined)}
              </p>
            </div>
            <Coins className="h-8 w-8 sm:h-10 sm:w-10 text-orange-400/50 shrink-0" />
          </div>
        </div>
      )}

      {/* Buy / Trade Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <a
          href={uniswapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-xl border border-pink-800/30 hover:border-pink-600/50 transition-all group"
        >
          <div className="p-3 bg-pink-500/20 rounded-xl">
            <Zap className="h-6 w-6 text-pink-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">Buy on Uniswap</h3>
            <p className="text-sm text-muted-foreground">
              Trade $PICKS on Uniswap V4 (Base)
            </p>
          </div>
          <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-pink-400 transition-colors" />
        </a>

        <a
          href={clankerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-xl border border-blue-800/30 hover:border-blue-600/50 transition-all group"
        >
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <BarChart3 className="h-6 w-6 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">View on Clanker</h3>
            <p className="text-sm text-muted-foreground">
              Token info, LP rewards, admin
            </p>
          </div>
          <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-blue-400 transition-colors" />
        </a>
      </div>

      {/* Protocol Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Staked"
          value={totalStaked ? formatPicks(totalStaked as bigint) : "0"}
          icon={<Lock className="h-4 w-4 text-blue-400" />}
        />
        <StatCard
          label="Treasury"
          value={treasuryBalance ? formatPicks(treasuryBalance as bigint) : "0"}
          icon={<Shield className="h-4 w-4 text-green-400" />}
        />
        <StatCard
          label="Total Burned"
          value={totalBurned ? formatPicks(totalBurned as bigint) : "0"}
          icon={<Flame className="h-4 w-4 text-red-400" />}
        />
        <StatCard
          label="Total Supply"
          value="1,000,000,000"
          icon={<Coins className="h-4 w-4 text-yellow-400" />}
        />
      </div>

      {/* Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <ExternalLinkCard
          href={basescanUrl}
          label="Basescan"
          description="View contract"
        />
        <ExternalLinkCard
          href={dexscreenerUrl}
          label="DEX Screener"
          description="Price charts"
        />
        <ExternalLinkCard
          href={uniswapUrl}
          label="Uniswap"
          description="Trade"
        />
        <ExternalLinkCard
          href={clankerUrl}
          label="Clanker"
          description="Admin & rewards"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Token Utility */}
        <div className="p-6 bg-card rounded-xl border">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            What is $PICKS?
          </h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              $PICKS is the utility token for the SurvivorPicks prediction
              platform, deployed on <strong className="text-foreground">Base</strong> (Ethereum L2)
              via Clanker for instant liquidity and fair launch.
            </p>
            <div className="space-y-3">
              <UtilityItem
                icon={<TrendingUp className="h-4 w-4 text-green-400" />}
                title="Predict"
                description="Stake $PICKS on episode outcomes. Winners share the pool (97%, minus 3% platform fee)."
              />
              <UtilityItem
                icon={<Lock className="h-4 w-4 text-blue-400" />}
                title="Stake"
                description="Lock $PICKS to earn staking rewards and boost your prediction multiplier up to 1.5x."
              />
              <UtilityItem
                icon={<Flame className="h-4 w-4 text-red-400" />}
                title="Season Pass"
                description="Burn $PICKS for a premium Season Pass NFT with exclusive perks and boosted rewards."
              />
              <UtilityItem
                icon={<Gift className="h-4 w-4 text-purple-400" />}
                title="Earn Badges"
                description="Collect achievement NFTs as you play. Some are tradeable on secondary markets."
              />
            </div>
          </div>
        </div>

        {/* Tokenomics */}
        <div className="p-6 bg-card rounded-xl border">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Tokenomics
          </h2>
          <div className="space-y-3">
            <TokenomicsRow label="Total Supply" value="1,000,000,000" pct="100%" />
            <TokenomicsRow
              label="Uniswap V4 LP"
              value="~450,000,000"
              pct="~45%"
              color="text-pink-400"
            />
            <TokenomicsRow
              label="Vaulted (Team + Community)"
              value="~500,000,000"
              pct="~50%"
              color="text-blue-400"
              note="7d lock, 2yr vest"
            />
            <TokenomicsRow
              label="Airdrop (Early Supporters)"
              value="~50,000,000"
              pct="~5%"
              color="text-green-400"
              note="30d lock, 30d vest"
            />

            <div className="pt-4 border-t mt-4">
              <h3 className="font-semibold text-sm mb-2">Deflationary Mechanics</h3>
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
        </div>
      </div>

      {/* Revenue Model */}
      <div className="mt-8 p-6 bg-gradient-to-br from-orange-900/20 to-amber-900/20 rounded-xl border border-orange-800/30">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-400" />
          How Value Accrues
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <ValueCard
            title="LP Trading Fees"
            description="Every $PICKS trade on Uniswap generates LP fees for the protocol. More users = more volume = more revenue."
            icon={<BarChart3 className="h-5 w-5 text-pink-400" />}
          />
          <ValueCard
            title="Prediction Fees"
            description="3% of all prediction stakes flow to the Treasury. Used for buyback-and-burn, increasing token scarcity."
            icon={<Shield className="h-5 w-5 text-green-400" />}
          />
          <ValueCard
            title="Deflationary Burns"
            description="Season Pass purchases, buybacks, and community burns all reduce supply permanently. Less supply = more value."
            icon={<Flame className="h-5 w-5 text-red-400" />}
          />
        </div>
      </div>

      {/* Contract Info */}
      {tokenAddress && tokenAddress !== "0x0" && (
        <div className="mt-8 p-4 bg-muted/50 rounded-xl">
          <p className="text-xs text-muted-foreground font-mono break-all">
            Token Contract: {tokenAddress} (Base)
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ───────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-card rounded-xl border">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-lg font-bold truncate" title={value}>
        {value}
      </p>
    </div>
  );
}

function ExternalLinkCard({
  href,
  label,
  description,
}: {
  href: string;
  label: string;
  description: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 bg-card rounded-lg border hover:border-muted-foreground/30 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>
      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
    </a>
  );
}

function UtilityItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function TokenomicsRow({
  label,
  value,
  pct,
  color,
  note,
}: {
  label: string;
  value: string;
  pct: string;
  color?: string;
  note?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0 min-w-0">
        <span className={`${color || "text-muted-foreground"} truncate`}>{label}</span>
        {note && (
          <span className="text-xs text-muted-foreground/60">({note})</span>
        )}
      </div>
      <div className="text-right shrink-0">
        <span className="font-medium">{pct}</span>
      </div>
    </div>
  );
}

function ValueCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-card/50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
