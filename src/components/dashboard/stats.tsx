"use client";

import { StaggerContainer, StaggerItem, AnimatedCounter, GlowCard } from "@/components/motion";

interface DashboardStatsProps {
  points: number;
  rank: number;
  winRate: number;
  streak: number;
}

export function DashboardStats({ points, rank, winRate, streak }: DashboardStatsProps) {
  return (
    <StaggerContainer className="grid grid-cols-4 gap-2 mb-6">
      <StaggerItem>
        <GlowCard className="p-3 text-center">
          <p className="text-lg font-bold font-mono text-primary">
            <AnimatedCounter value={points} />
          </p>
          <p className="text-[10px] text-muted-foreground">Points</p>
        </GlowCard>
      </StaggerItem>
      <StaggerItem>
        <GlowCard className="p-3 text-center">
          <p className="text-lg font-bold font-mono">
            {rank > 0 ? (
              <>
                #<AnimatedCounter value={rank} />
              </>
            ) : (
              "\u2014"
            )}
          </p>
          <p className="text-[10px] text-muted-foreground">Rank</p>
        </GlowCard>
      </StaggerItem>
      <StaggerItem>
        <GlowCard className="p-3 text-center">
          <p className="text-lg font-bold font-mono">
            <AnimatedCounter value={Math.round(winRate * 100)} suffix="%" />
          </p>
          <p className="text-[10px] text-muted-foreground">Win Rate</p>
        </GlowCard>
      </StaggerItem>
      <StaggerItem>
        <GlowCard className="p-3 text-center">
          <p className="text-lg font-bold font-mono">
            <AnimatedCounter value={streak} />
          </p>
          <p className="text-[10px] text-muted-foreground">Streak</p>
        </GlowCard>
      </StaggerItem>
    </StaggerContainer>
  );
}
