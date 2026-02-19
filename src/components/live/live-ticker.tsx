"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins } from "lucide-react";

interface TickerEntry {
  id: string;
  userName: string;
  option: string;
  amount: string;
  odds: number;
  timestamp: number;
}

interface LiveTickerProps {
  entries: TickerEntry[];
}

export function LiveTicker({ entries }: LiveTickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, [entries.length]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center h-8 px-4 overflow-hidden">
        <span className="text-[10px] text-white/20 animate-pulse">
          Waiting for bets...
        </span>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex items-center h-8 px-3 gap-4 overflow-x-auto scrollbar-hide"
    >
      <AnimatePresence mode="popLayout">
        {entries.slice(0, 20).map((entry) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className="flex items-center gap-1.5 shrink-0"
          >
            <Coins className="h-3 w-3 text-neon-gold" />
            <span className="text-[10px] text-white/50 whitespace-nowrap">
              <span className="text-white/70 font-medium">
                {entry.userName}
              </span>{" "}
              bet{" "}
              <span className="text-neon-gold font-bold">
                {parseFloat(entry.amount).toLocaleString()} $PICKS
              </span>{" "}
              on{" "}
              <span className="text-white/80 font-medium">{entry.option}</span>{" "}
              at{" "}
              <span className="text-neon-cyan font-bold">
                {entry.odds.toFixed(1)}x
              </span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
