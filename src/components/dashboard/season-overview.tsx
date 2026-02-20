"use client";

import { motion } from "framer-motion";
import { Trophy, Tv } from "lucide-react";
import { AnimatedBar } from "@/components/motion";

interface SeasonOverviewProps {
  seasonTitle: string;
  currentEpisode: number;
  totalEpisodes: number;
  resolvedEpisodes: number;
  rank: number;
  totalPlayers: number;
}

export function SeasonOverview({
  seasonTitle,
  currentEpisode,
  totalEpisodes,
  resolvedEpisodes,
  rank,
  totalPlayers,
}: SeasonOverviewProps) {
  const progressPct =
    totalEpisodes > 0 ? (resolvedEpisodes / totalEpisodes) * 100 : 0;
  const percentile =
    totalPlayers > 0 ? Math.ceil((rank / totalPlayers) * 100) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Tv className="h-4 w-4 text-neon-cyan" />
          <span className="text-sm font-display font-semibold truncate">
            {seasonTitle}
          </span>
        </div>
        {rank > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-white/[0.04] border border-white/[0.08] px-2 py-1 rounded-md text-muted-foreground">
            <Trophy className="h-3 w-3 text-amber-400" />
            Top {percentile}%
          </span>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            Episode {currentEpisode} of {totalEpisodes}
          </span>
          <span>{Math.round(progressPct)}% complete</span>
        </div>
        <div className="h-1.5 rounded-full">
          <AnimatedBar
            percentage={progressPct}
            color="bg-neon-cyan"
            className="h-1.5"
          />
        </div>
      </div>
    </motion.div>
  );
}
