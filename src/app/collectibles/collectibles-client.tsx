"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Shield, Award, Lock, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/motion";
import { NeonButton } from "@/components/ui/neon-button";

const NFT_TIERS = [
  {
    name: "Early Supporter",
    image: "/nfts/early-supporter.png",
    border: "border-amber-500/30",
    supply: "1,111 max",
    desc: "First supporters of the platform",
  },
  {
    name: "Player",
    image: "/nfts/player.png",
    border: "border-indigo-500/30",
    supply: "3,000 max",
    desc: "33+ predictions made",
  },
  {
    name: "Community OG",
    image: "/nfts/community-og.png",
    border: "border-teal-500/30",
    supply: "1,000 max",
    desc: "Referred 3+ friends",
  },
  {
    name: "Survivor Pro",
    image: "/nfts/survivor-pro.png",
    border: "border-red-500/30",
    supply: "500 max",
    desc: "3-episode win streak",
  },
  {
    name: "Legend",
    image: "/nfts/legend.png",
    border: "border-yellow-500/40",
    supply: "111 max",
    desc: "Top 33 all-time",
  },
];

const UTILITY_CARDS = [
  {
    icon: Zap,
    title: "XP Boost",
    desc: "Earn 1.5x points on every correct prediction. Stack with streak bonuses.",
    color: "text-neon-cyan",
    accent: "hsl(185 100% 55%)",
  },
  {
    icon: TrendingUp,
    title: "Multiplier Perks",
    desc: "Higher tier NFTs unlock bigger multipliers on risk bets — up to 2x returns.",
    color: "text-neon-gold",
    accent: "hsl(45 100% 55%)",
  },
  {
    icon: Shield,
    title: "Streak Insurance",
    desc: "Protect your win streak once per season. One wrong pick won't break your run.",
    color: "text-neon-magenta",
    accent: "hsl(320 100% 60%)",
  },
  {
    icon: Award,
    title: "Season Pass",
    desc: "Exclusive access to premium markets, early predictions, and bonus challenges.",
    color: "text-violet-400",
    accent: "hsl(260 80% 60%)",
  },
];

export function CollectiblesClient() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <FadeIn>
        <h1 className="font-headline text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-2">
          Collectibles
        </h1>
        <p className="text-sm text-muted-foreground mb-12 max-w-xl">
          NFT badges with real gameplay utility. Boost your edge, protect your streaks, unlock perks.
        </p>
      </FadeIn>

      {/* Utility section */}
      <section className="mb-16">
        <FadeIn>
          <p className="text-[10px] uppercase tracking-widest text-neon-cyan/60 font-bold mb-2">UTILITY</p>
          <h2 className="font-headline text-2xl font-extrabold uppercase text-white mb-8">
            Boost Your Edge
          </h2>
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {UTILITY_CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:shadow-[0_0_20px_hsl(185_100%_55%/0.08)] transition-all"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg mb-4"
                style={{ background: `${card.accent}12`, border: `1px solid ${card.accent}25` }}
              >
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{card.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NFT Grid */}
      <section className="mb-16">
        <FadeIn>
          <p className="text-[10px] uppercase tracking-widest text-neon-cyan/60 font-bold mb-2">COLLECTION</p>
          <h2 className="font-headline text-2xl font-extrabold uppercase text-white mb-8">
            Badge Tiers
          </h2>
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NFT_TIERS.map((nft, i) => (
            <motion.div
              key={nft.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`relative rounded-2xl border ${nft.border} bg-studio-dark/60 overflow-hidden group`}
            >
              <div className="aspect-square relative">
                <Image
                  src={nft.image}
                  alt={nft.name}
                  fill
                  className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-0 transition-opacity">
                  <Lock className="h-8 w-8 text-white/40" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-white">{nft.name}</p>
                  <span className="text-[10px] font-mono text-muted-foreground">{nft.supply}</span>
                </div>
                <p className="text-xs text-muted-foreground">{nft.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <div className="text-center p-8 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
        <Sparkles className="h-6 w-6 text-neon-gold mx-auto mb-3" />
        <h3 className="text-lg font-display font-bold text-white mb-2">
          Minting Opens at Fair Launch
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Your eligibility is being tracked. Keep predicting to unlock higher tiers.
        </p>
        <p className="text-[10px] text-white/30">Powered by NFTs on Base</p>
      </div>
    </div>
  );
}
