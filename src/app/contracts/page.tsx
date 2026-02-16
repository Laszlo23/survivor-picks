"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion";
import { NeonButton } from "@/components/ui/neon-button";
import {
  Copy,
  Check,
  ExternalLink,
  Coins,
  Shield,
  Target,
  Lock,
  Award,
  Ticket,
  Crown,
} from "lucide-react";

const CONTRACTS = [
  {
    name: "$PICKS Token",
    type: "ERC-20",
    typeColor: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
    icon: Coins,
    address: process.env.NEXT_PUBLIC_PICKS_TOKEN_ADDRESS || "0x5294199EB963B6b868609B324D540B79BFbafB07",
    description: "ERC-20 token powering prediction markets",
  },
  {
    name: "Treasury",
    type: "Multisig",
    typeColor: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    icon: Shield,
    address: process.env.NEXT_PUBLIC_TREASURY_ADDRESS || "0x5bA7Bc0Bfe44DB1AE8D81c09b7FB356f656EAC7d",
    description: "Platform fee collection & ecosystem fund",
  },
  {
    name: "Prediction Engine",
    type: "Core",
    typeColor: "bg-neon-magenta/20 text-neon-magenta border-neon-magenta/30",
    icon: Target,
    address: process.env.NEXT_PUBLIC_PREDICTION_ENGINE_ADDRESS || "0x3599A6B2dCEde53606EBb126f563D5708399d451",
    description: "Core market creation, staking & resolution logic",
  },
  {
    name: "Staking Vault",
    type: "DeFi",
    typeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Lock,
    address: process.env.NEXT_PUBLIC_STAKING_VAULT_ADDRESS || "0x25Bd8674F137f8B5f14808A9034D1d8644A39612",
    description: "Stake $PICKS for boosted multipliers & yield",
  },
  {
    name: "Badge NFT",
    type: "ERC-1155",
    typeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: Award,
    address: process.env.NEXT_PUBLIC_BADGE_NFT_ADDRESS || "0x0EEee99420686733063E4fE83E504c8929e16626",
    description: "Achievement badges with rarity tiers",
  },
  {
    name: "Season Pass",
    type: "ERC-721",
    typeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: Ticket,
    address: process.env.NEXT_PUBLIC_SEASON_PASS_ADDRESS || "0x938B88628Cfcffe230D58a1EC1CC81D04d8eF965",
    description: "Seasonal access passes with exclusive perks",
  },
  {
    name: "RealityPicks NFT",
    type: "ERC-721",
    typeColor: "bg-neon-gold/20 text-neon-gold border-neon-gold/30",
    icon: Crown,
    address: process.env.NEXT_PUBLIC_REALITYPICKS_NFT_ADDRESS || "0x88d614173Af60f9295422110bd925fA9e15F32B3",
    description: "5-tier collectible NFTs — Early Supporter to Legend",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
      title="Copy address"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-neon-cyan" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  );
}

export default function ContractsPage() {
  return (
    <div className="min-h-screen bg-studio-black pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-studio-black to-studio-black" />
        <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-12 text-center">
          <FadeIn>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
              Contracts &{" "}
              <span className="text-gradient-cyan">Liquidity</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base">
              All deployed contracts on Base, verified on BaseScan
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4">
        {/* Key Info */}
        <FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10">
            {[
              { label: "Total Supply", value: "1B $PICKS" },
              { label: "Liquidity", value: "Clanker LP" },
              { label: "Platform Fee", value: "3%" },
              { label: "Chain ID", value: "8453" },
            ].map((stat) => (
              <div key={stat.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                <p className="text-sm font-bold font-mono text-white">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Contract List */}
        <div className="mt-10 space-y-3">
          {CONTRACTS.map((c, i) => {
            const Icon = c.icon;
            return (
              <FadeIn key={c.name}>
                <div className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                      <Icon className="h-5 w-5 text-white/70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-white">{c.name}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${c.typeColor}`}>
                          {c.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <code className="text-xs font-mono text-white/60 bg-white/[0.04] px-2 py-1 rounded truncate block max-w-full">
                          {c.address}
                        </code>
                        <CopyButton text={c.address} />
                        <a
                          href={`https://basescan.org/address/${c.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
                          title="View on BaseScan"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* CTA */}
        <FadeIn>
          <div className="mt-12 text-center">
            <NeonButton variant="ghost" href="/tokenomics" className="gap-2">
              View Tokenomics <ExternalLink className="h-4 w-4" />
            </NeonButton>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
