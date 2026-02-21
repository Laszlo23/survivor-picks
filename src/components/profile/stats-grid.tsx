"use client";

import { Zap, Target, Trophy, Flame, BarChart3, Coins } from "lucide-react";

type StatsGridProps = {
  stats: {
    totalPoints: number;
    overallWinRate: number;
    rank: number | null;
    totalPlayers: number | null;
    bestStreak: number;
    totalPredictions: number;
    totalPicksEarned: string;
  };
};

export function StatsGrid({ stats }: StatsGridProps) {
  const topPercent =
    stats.rank && stats.totalPlayers
      ? Math.round((stats.rank / stats.totalPlayers) * 100)
      : null;
  const winPct = Math.round(stats.overallWinRate * 100);
  const picksEarned = BigInt(stats.totalPicksEarned || "0");

  const cards = [
    {
      icon: Zap,
      label: "Total Points",
      value: stats.totalPoints.toLocaleString(),
      color: "text-primary",
      bg: "from-primary/20 to-primary/5",
      border: "border-primary/20",
    },
    {
      icon: Target,
      label: "Win Rate",
      value: `${winPct}%`,
      color: "text-neon-cyan",
      bg: "from-neon-cyan/20 to-neon-cyan/5",
      border: "border-neon-cyan/20",
      ring: winPct,
    },
    {
      icon: Trophy,
      label: "Global Rank",
      value: stats.rank ? `#${stats.rank}` : "--",
      sub: topPercent !== null && topPercent <= 50 ? `Top ${topPercent}%` : undefined,
      color: "text-amber-400",
      bg: "from-amber-500/20 to-amber-500/5",
      border: "border-amber-500/20",
    },
    {
      icon: Flame,
      label: "Best Streak",
      value: `${stats.bestStreak}`,
      sub: stats.bestStreak >= 3 ? "On fire!" : undefined,
      color: "text-orange-400",
      bg: "from-orange-500/20 to-orange-500/5",
      border: "border-orange-500/20",
    },
    {
      icon: BarChart3,
      label: "Predictions",
      value: stats.totalPredictions.toLocaleString(),
      color: "text-violet-400",
      bg: "from-violet-500/20 to-violet-500/5",
      border: "border-violet-500/20",
    },
    {
      icon: Coins,
      label: "$PICKS Earned",
      value: picksEarned > BigInt(999_999)
        ? `${(Number(picksEarned) / 1_000_000).toFixed(1)}M`
        : picksEarned > BigInt(999)
        ? `${(Number(picksEarned) / 1_000).toFixed(1)}K`
        : Number(picksEarned).toLocaleString(),
      color: "text-emerald-400",
      bg: "from-emerald-500/20 to-emerald-500/5",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-xl border ${card.border} bg-gradient-to-br ${card.bg} p-4 group hover:scale-[1.02] transition-transform`}
        >
          {"ring" in card && card.ring !== undefined && (
            <svg className="absolute top-3 right-3 h-10 w-10 -rotate-90 opacity-40" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/[0.06]" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${card.ring} ${100 - card.ring}`}
                className={card.color}
              />
            </svg>
          )}
          <card.icon className={`h-5 w-5 ${card.color} mb-2`} />
          <p className={`text-xl sm:text-2xl font-bold font-mono ${card.color}`}>{card.value}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{card.label}</p>
          {"sub" in card && card.sub && (
            <p className={`text-[10px] ${card.color} opacity-70 mt-0.5`}>{card.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
