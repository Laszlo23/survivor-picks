"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import { NeonButton } from "@/components/ui/neon-button";
import { ArrowRight, Users, Clock } from "lucide-react";

interface MarketCard {
  emoji: string;
  showName: string;
  question: string;
  participants: number;
  timeLeft: string;
  isLive: boolean;
  href: string;
}

const FEATURED_MARKETS: MarketCard[] = [
  {
    emoji: "\uD83C\uDFDD\uFE0F",
    showName: "Survivor 2026: All Star",
    question: "Who Gets Voted Off This Week?",
    participants: 24,
    timeLeft: "2h 15m",
    isLive: true,
    href: "/dashboard",
  },
  {
    emoji: "\uD83C\uDFDD\uFE0F",
    showName: "Survivor 2026: All Star",
    question: "Who Wins the Immunity Challenge?",
    participants: 18,
    timeLeft: "2h 15m",
    isLive: true,
    href: "/dashboard",
  },
  {
    emoji: "\uD83C\uDFDD\uFE0F",
    showName: "Survivor 2026: All Star",
    question: "Which Tribe Wins the Reward?",
    participants: 12,
    timeLeft: "4d 6h",
    isLive: false,
    href: "/dashboard",
  },
];

export function LandingFeaturedMarkets() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="mb-8 flex items-center justify-between">
          <LowerThird label="COMING SOON" value="Featured Markets" />
          <Link href="/dashboard">
            <NeonButton variant="ghost" className="gap-1 text-xs hidden sm:inline-flex">
              All Markets <ArrowRight className="h-3 w-3" />
            </NeonButton>
          </Link>
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_MARKETS.map((market, i) => (
          <FadeIn key={i}>
            <Link href={market.href} className="block group">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all">
                {/* Header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{market.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                      {market.showName}
                    </p>
                  </div>
                  {market.isLive && (
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-neon-cyan">
                      <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />
                      LIVE
                    </span>
                  )}
                </div>

                {/* Question */}
                <h3 className="text-sm font-semibold text-white mb-4 group-hover:text-neon-cyan transition-colors">
                  {market.question}
                </h3>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {market.participants}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {market.timeLeft}
                  </span>
                </div>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
