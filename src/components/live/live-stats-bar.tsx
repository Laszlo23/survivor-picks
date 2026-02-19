"use client";

import { Users, Coins, TrendingUp, TrendingDown, Flame } from "lucide-react";
import { motion } from "framer-motion";

interface LiveStatsBarProps {
  viewerCount: number;
  totalPool: number;
  sessionPnL: number;
  activeBets: number;
}

export function LiveStatsBar({
  viewerCount,
  totalPool,
  sessionPnL,
  activeBets,
}: LiveStatsBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-[#050508] via-[#0a0a12] to-[#050508]">
      {/* Viewers */}
      <div className="flex items-center gap-1.5">
        <Users className="h-3.5 w-3.5 text-neon-cyan" />
        <span className="text-xs font-medium text-white/70">
          {viewerCount.toLocaleString()}
        </span>
      </div>

      {/* Active bets */}
      <div className="flex items-center gap-1.5">
        <Flame className="h-3.5 w-3.5 text-orange-400" />
        <span className="text-xs font-medium text-white/70">
          {activeBets} live
        </span>
      </div>

      {/* Total pool */}
      <div className="flex items-center gap-1.5">
        <Coins className="h-3.5 w-3.5 text-neon-gold" />
        <span className="text-xs font-bold font-headline text-neon-gold">
          {totalPool > 0 ? `${Math.floor(totalPool).toLocaleString()} $PICKS` : "—"}
        </span>
      </div>

      {/* Session P&L */}
      <motion.div
        className="flex items-center gap-1"
        key={sessionPnL.toFixed(0)}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
      >
        {sessionPnL >= 0 ? (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-red-400" />
        )}
        <span
          className={`text-xs font-bold font-headline ${
            sessionPnL >= 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {sessionPnL >= 0 ? "+" : ""}
          {Math.floor(sessionPnL).toLocaleString()}
        </span>
      </motion.div>
    </div>
  );
}
