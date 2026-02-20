"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  StaggerContainer,
  StaggerItem,
  AnimatedCounter,
  AnimatedBar,
  GlowCard,
} from "@/components/motion";
import { Flame, TrendingUp, Coins, Plus, Target } from "lucide-react";
import { BuyPicksModal } from "@/components/wallet/buy-picks-modal";
import { GlossaryTooltip } from "@/components/ui/glossary-tooltip";

interface DashboardStatsProps {
  points: number;
  rank: number;
  winRate: number;
  streak: number;
  longestStreak: number;
  top10Points: number;
  totalPlayers: number;
  picksBalance: string;
}

export function DashboardStats({
  points,
  rank,
  winRate,
  streak,
  longestStreak,
  top10Points,
  totalPlayers,
  picksBalance,
}: DashboardStatsProps) {
  const [buyOpen, setBuyOpen] = useState(false);
  const balance = Number(picksBalance);
  const ptsToTop10 = rank > 10 ? Math.max(0, top10Points - points) : 0;
  const top10ProgressPct =
    top10Points > 0 && rank > 10
      ? Math.min((points / top10Points) * 100, 100)
      : 100;
  const percentile =
    totalPlayers > 0 ? Math.ceil((rank / totalPlayers) * 100) : 100;

  return (
    <>
      <StaggerContainer className="space-y-2 mb-5">
        {/* Row 1 — Primary stats */}
        <div className="grid grid-cols-2 gap-2">
          <StaggerItem>
            <Link href="/staking" className="block">
              <GlowCard className="p-3 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="h-3 w-3 text-neon-cyan" />
                  <GlossaryTooltip term="XP">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      Season points
                    </span>
                  </GlossaryTooltip>
                </div>
                <p className="text-xl font-bold font-mono text-primary leading-none mb-2">
                  <AnimatedCounter value={points} />
                </p>
                {rank > 10 && ptsToTop10 > 0 ? (
                  <div className="space-y-1">
                    <div className="h-1 rounded-full">
                      <AnimatedBar
                        percentage={top10ProgressPct}
                        color="bg-neon-cyan/60"
                        className="h-1"
                        delay={0.3}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground/70 flex items-center gap-1">
                      <Target className="h-2.5 w-2.5" />
                      {ptsToTop10.toLocaleString("en-US")} points to Top 10
                    </p>
                  </div>
                ) : rank > 0 && rank <= 10 ? (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded">
                    Top 10
                  </span>
                ) : null}
              </GlowCard>
            </Link>
          </StaggerItem>

          <StaggerItem>
            <Link href="/leaderboard" className="block">
              <GlowCard className="p-3 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                    Place
                  </span>
                </div>
                <p className="text-xl font-bold font-mono leading-none mb-2">
                  {rank > 0 ? (
                    <>
                      #<AnimatedCounter value={rank} />
                    </>
                  ) : (
                    "\u2014"
                  )}
                </p>
                {rank > 0 && totalPlayers > 0 && (
                  <p className="text-[9px] text-muted-foreground/70">
                    Top {percentile}% of{" "}
                    {totalPlayers.toLocaleString("en-US")} players
                  </p>
                )}
              </GlowCard>
            </Link>
          </StaggerItem>
        </div>

        {/* Row 2 — Secondary stats */}
        <div className="grid grid-cols-3 gap-2">
          <StaggerItem>
            <GlowCard className="p-2.5 text-center">
              <p className="text-base font-bold font-mono">
                <AnimatedCounter
                  value={Math.round(winRate * 100)}
                  suffix="%"
                />
              </p>
              <p className="text-[9px] text-muted-foreground">Hit rate</p>
            </GlowCard>
          </StaggerItem>

          <StaggerItem>
            <GlowCard className="p-2.5 text-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-1">
                {streak > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                    }}
                  >
                    <Flame className="h-4 w-4 text-orange-400 animate-streak-fire" />
                  </motion.div>
                )}
                <p className="text-base font-bold font-mono">
                  <AnimatedCounter value={streak} />
                </p>
              </div>
              <GlossaryTooltip term="streak">
                <p className="text-[9px] text-muted-foreground">
                  Win streak
                </p>
              </GlossaryTooltip>
              {longestStreak > 0 && (
                <p className="text-[8px] text-muted-foreground/50 mt-0.5">
                  Best: {longestStreak}
                </p>
              )}
            </GlowCard>
          </StaggerItem>

          <StaggerItem>
            <GlowCard
              className="p-2.5 text-center cursor-pointer"
              glowColor="accent"
            >
              <button
                onClick={() => setBuyOpen(true)}
                className="w-full"
              >
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Coins className="h-3 w-3 text-neon-cyan" />
                  <p className="text-base font-bold font-mono">
                    {balance >= 1000
                      ? `${(balance / 1000).toFixed(balance >= 10000 ? 0 : 1)}k`
                      : balance.toLocaleString("en-US")}
                  </p>
                </div>
                <p className="text-[9px] text-muted-foreground">Tokens</p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <Plus className="h-2.5 w-2.5 text-neon-cyan/60" />
                  <span className="text-[8px] text-neon-cyan/60 font-semibold">
                    Buy
                  </span>
                </div>
              </button>
            </GlowCard>
          </StaggerItem>
        </div>
      </StaggerContainer>

      <BuyPicksModal open={buyOpen} onClose={() => setBuyOpen(false)} />
    </>
  );
}
