"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import { NeonButton } from "@/components/ui/neon-button";
import { ArrowRight, Users, Clock, DollarSign } from "lucide-react";

interface MarketCard {
  emoji: string;
  showName: string;
  question: string;
  participants: number;
  timeLeft: string;
  pool: string;
  isLive: boolean;
  href: string;
}

const FEATURED_MARKETS: MarketCard[] = [
  {
    emoji: "\uD83C\uDFDD\uFE0F",
    showName: "Survivor S47 \u00B7 EP7",
    question: "Who Gets Voted Off Episode 7?",
    participants: 18,
    timeLeft: "2h 15m",
    pool: "$1,250",
    isLive: true,
    href: "/dashboard",
  },
  {
    emoji: "\uD83C\uDF39",
    showName: "The Bachelor \u00B7 Finale",
    question: "Final Rose Winner Prediction",
    participants: 12,
    timeLeft: "1d 6h",
    pool: "$840",
    isLive: false,
    href: "/dashboard",
  },
  {
    emoji: "\uD83D\uDC95",
    showName: "Love Island \u00B7 EP12",
    question: "Next Couple Eliminated",
    participants: 9,
    timeLeft: "5h 30m",
    pool: "$620",
    isLive: true,
    href: "/dashboard",
  },
  {
    emoji: "\uD83C\uDFE0",
    showName: "Big Brother \u00B7 Week 8",
    question: "Who Wins Head of Household?",
    participants: 7,
    timeLeft: "3d 12h",
    pool: "$380",
    isLive: false,
    href: "/dashboard",
  },
];

export function LandingFeaturedMarkets() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="mb-8 flex items-center justify-between">
          <LowerThird label="COMING SOON" value="Featured Shows" />
          <Link href="/dashboard">
            <NeonButton variant="ghost" className="gap-1 text-xs hidden sm:inline-flex">
              All Markets <ArrowRight className="h-3 w-3" />
            </NeonButton>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground -mt-4 mb-8">
          Predict outcomes on the hottest reality TV shows and win $PICKS.
        </p>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURED_MARKETS.map((market, i) => (
          <FadeIn key={i}>
            <Link href={market.href} className="block group">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04] transition-all h-full flex flex-col">
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
                <h3 className="text-sm font-semibold text-white mb-4 group-hover:text-neon-cyan transition-colors flex-1">
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
                  <span className="flex items-center gap-1 text-neon-cyan font-bold">
                    <DollarSign className="h-3 w-3" />
                    {market.pool.replace("$", "")} pool
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
