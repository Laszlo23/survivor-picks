"use client";

import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import { NeonButton } from "@/components/ui/neon-button";
import { ArrowRight } from "lucide-react";

const NFT_TIERS = [
  {
    name: "Early Supporter",
    rarity: "Common",
    rarityColor: "text-amber-400 bg-amber-500/20 border-amber-500/30",
    image: "/nfts/early-supporter.png",
    supply: "1,111",
    price: "0.000111 ETH",
  },
  {
    name: "Player",
    rarity: "Uncommon",
    rarityColor: "text-indigo-400 bg-indigo-500/20 border-indigo-500/30",
    image: "/nfts/player.png",
    supply: "3,000",
    price: "0.00111 ETH",
  },
  {
    name: "Community OG",
    rarity: "Rare",
    rarityColor: "text-teal-400 bg-teal-500/20 border-teal-500/30",
    image: "/nfts/community-og.png",
    supply: "1,000",
    price: "0.00333 ETH",
  },
  {
    name: "Survivor Pro",
    rarity: "Epic",
    rarityColor: "text-red-400 bg-red-500/20 border-red-500/30",
    image: "/nfts/survivor-pro.png",
    supply: "500",
    price: "0.00888 ETH",
  },
  {
    name: "Legend",
    rarity: "Legendary",
    rarityColor: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30",
    image: "/nfts/legend.png",
    supply: "111",
    price: "0.0111 ETH",
  },
];

export function LandingNFTPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="mb-8 flex items-center justify-between">
          <LowerThird label="COLLECTIBLES" value="NFT Collection" />
          <Link href="/nfts">
            <NeonButton variant="ghost" className="gap-1 text-xs hidden sm:inline-flex">
              Mint NFTs <ArrowRight className="h-3 w-3" />
            </NeonButton>
          </Link>
        </div>
      </FadeIn>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {NFT_TIERS.map((tier, i) => (
          <FadeIn key={tier.name}>
            <Link href="/nfts" className="block group">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden hover:border-white/[0.12] transition-all">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={tier.image}
                    alt={tier.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${tier.rarityColor}`}>
                      {tier.rarity}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div className="p-3">
                  <p className="text-xs font-semibold text-white truncate">{tier.name}</p>
                  <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                    <span>{tier.supply} max</span>
                    <span className="font-mono">{tier.price}</span>
                  </div>
                </div>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
