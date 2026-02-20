"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn, ScaleIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { Sparkles, Lock, ArrowLeft } from "lucide-react";

const NFT_TIERS = [
  { id: 0, name: "Early Supporter", image: "/nfts/early-supporter.png", border: "border-amber-500/30", desc: "First 333 supporters" },
  { id: 1, name: "Player", image: "/nfts/player.png", border: "border-indigo-500/30", desc: "33+ predictions made" },
  { id: 2, name: "Community OG", image: "/nfts/community-og.png", border: "border-teal-500/30", desc: "Referred 3+ friends" },
  { id: 3, name: "Survivor Pro", image: "/nfts/survivor-pro.png", border: "border-red-500/30", desc: "3-episode win streak" },
  { id: 4, name: "Legend", image: "/nfts/legend.png", border: "border-yellow-500/40", desc: "Top 33 all-time" },
];

export function NFTCollectionClient() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      <FadeIn>
        <h1 className="text-2xl font-display font-bold mb-2">NFT Collection</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Earn and collect NFT badges as you play. Each tier unlocks at a milestone.
        </p>
      </FadeIn>

      <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {NFT_TIERS.map((nft) => (
          <StaggerItem key={nft.id}>
            <div className={`relative rounded-2xl border ${nft.border} bg-studio-dark/60 overflow-hidden opacity-70`}>
              <div className="aspect-square relative">
                <Image src={nft.image} alt={nft.name} fill className="object-cover grayscale-[50%]" sizes="300px" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Lock className="h-8 w-8 text-white/40" />
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-white">{nft.name}</p>
                <p className="text-[10px] text-muted-foreground">{nft.desc}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <div className="mt-8 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-gold/5 border border-neon-gold/20 mx-auto mb-3">
          <span className="font-mono text-lg font-bold text-neon-gold">333</span>
        </div>
        <h2 className="text-lg font-display font-bold mb-2">Minting Opens at Fair Launch</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          NFT minting activates with the 333 Fair Launch. Your eligibility is being tracked — keep
          playing to unlock tiers before launch day.
        </p>
      </div>
    </div>
  );
}
