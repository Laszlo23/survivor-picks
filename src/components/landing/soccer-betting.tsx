"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  Target,
  AlertTriangle,
  Timer,
  TrendingUp,
  Bot,
} from "lucide-react";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";

const PLAYER_BETS = [
  {
    player: "Cristiano Ronaldo",
    team: "Al Nassr",
    bets: [
      { prompt: "Gets fouled in the first half?", odds: "x1.8", category: "FOUL" },
      { prompt: "Takes 3+ shots on target?", odds: "x2.4", category: "SHOTS" },
      { prompt: "Receives a yellow card?", odds: "x4.5", category: "CARD" },
    ],
  },
  {
    player: "Kylian Mbappé",
    team: "Real Madrid",
    bets: [
      { prompt: "Commits a foul before 30'?", odds: "x3.1", category: "FOUL" },
      { prompt: "Attempts a dribble past 2+ defenders?", odds: "x1.6", category: "SKILL" },
      { prompt: "Gets subbed off before 80'?", odds: "x5.0", category: "TWIST" },
    ],
  },
  {
    player: "Erling Haaland",
    team: "Man City",
    bets: [
      { prompt: "Wins an aerial duel?", odds: "x1.4", category: "DUEL" },
      { prompt: "Gets fouled in the box?", odds: "x3.3", category: "FOUL" },
      { prompt: "Scores a header?", odds: "x6.0", category: "GOAL" },
    ],
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  FOUL: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  SHOTS: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20",
  CARD: "text-red-400 bg-red-400/10 border-red-400/20",
  SKILL: "text-neon-magenta bg-neon-magenta/10 border-neon-magenta/20",
  TWIST: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  DUEL: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  GOAL: "text-neon-gold bg-neon-gold/10 border-neon-gold/20",
};

export function LandingSoccerBetting() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="mb-3 flex items-center gap-3">
          <LowerThird label="COMING SOON" value="Live Soccer" />
          <span className="inline-flex items-center gap-1 rounded-full bg-neon-gold/10 border border-neon-gold/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neon-gold animate-pulse">
            <Zap className="h-3 w-3" />
            Player Behavior Bets
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-10 max-w-xl">
          Not match outcomes — <span className="text-white font-semibold">player behavior</span>.
          Will Ronaldo get fouled? Will Mbappé attempt a dribble?
          AI watches the match and creates dynamic odds in real-time. Min bet: <span className="text-neon-gold font-bold font-mono">333 $PICKS</span>.
        </p>
      </FadeIn>

      <div className="grid gap-5 lg:grid-cols-3">
        {PLAYER_BETS.map((player, pi) => (
          <motion.div
            key={player.player}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: pi * 0.1 }}
            className="rounded-2xl border border-white/[0.08] bg-studio-dark/80 backdrop-blur-sm overflow-hidden"
          >
            {/* Player header */}
            <div className="p-4 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{player.player}</p>
                  <p className="text-[10px] text-muted-foreground">{player.team}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-neon-cyan">
                  <Bot className="h-3 w-3" />
                  AI Tracked
                </div>
              </div>
            </div>

            {/* Bets */}
            <div className="p-4 space-y-2">
              {player.bets.map((bet, bi) => (
                <motion.div
                  key={bet.prompt}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: pi * 0.1 + bi * 0.08 }}
                  className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[8px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5 border shrink-0 ${
                        CATEGORY_COLORS[bet.category] || "text-white/60 bg-white/5 border-white/10"
                      }`}
                    >
                      {bet.category}
                    </span>
                    <span className="text-xs text-white/80 truncate">{bet.prompt}</span>
                  </div>
                  <span className="text-xs font-bold text-neon-gold tabular-nums shrink-0">
                    {bet.odds}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features row */}
      <div className="grid gap-3 sm:grid-cols-4 mt-8">
        {[
          { icon: Bot, label: "AI Watches Live", desc: "Gemini analyzes match feeds for player actions" },
          { icon: Target, label: "Behavior, Not Scores", desc: "Fouls, cards, dribbles, aerial duels — not outcomes" },
          { icon: Timer, label: "Real-Time Odds", desc: "Odds shift as the match unfolds, rewarding early bets" },
          { icon: TrendingUp, label: "333 Spirit", desc: "Min 333 $PICKS per bet, 33.3% to the community pool" },
        ].map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center"
          >
            <f.icon className="h-5 w-5 text-neon-cyan mx-auto mb-2" />
            <p className="text-xs font-bold text-white mb-0.5">{f.label}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
