"use client";

import { motion } from "framer-motion";

interface ScoreboardRowProps {
  rank: number;
  name: string;
  value: string | number;
  avatar?: string;
  index?: number;
}

function getRankStyle(rank: number) {
  if (rank === 1) return { text: "text-neon-gold", glow: "text-neon-gold", bg: "bg-neon-gold/10 border-neon-gold/30" };
  if (rank === 2) return { text: "text-gray-300", glow: "text-gray-300", bg: "bg-white/5 border-white/10" };
  if (rank === 3) return { text: "text-amber-600", glow: "text-amber-600", bg: "bg-amber-900/10 border-amber-700/20" };
  return { text: "text-white/50", glow: "", bg: "bg-white/[0.02] border-white/[0.05]" };
}

export function ScoreboardRow({ rank, name, value, avatar, index = 0 }: ScoreboardRowProps) {
  const style = getRankStyle(rank);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors duration-200 hover:bg-white/[0.04] ${style.bg}`}
    >
      {/* Rank */}
      <span className={`w-8 text-center font-headline text-lg font-bold ${style.text}`}>
        {String(rank).padStart(2, "0")}
      </span>

      {/* Avatar placeholder */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/60">
        {avatar || name.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <span className="flex-1 truncate text-sm font-medium text-white/90">
        {name}
      </span>

      {/* Points */}
      <span className={`font-mono text-sm font-bold tabular-nums ${rank <= 3 ? style.text : "text-neon-cyan"}`}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </motion.div>
  );
}
