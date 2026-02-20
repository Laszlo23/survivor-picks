"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Brain,
  TrendingUp,
  TrendingDown,
  Trophy,
  Zap,
  BarChart3,
  Target,
} from "lucide-react";
import { FadeIn } from "@/components/motion";

const AI_PICKS = [
  {
    id: "1",
    show: "Survivor S47",
    question: "Will the merge happen this episode?",
    aiPick: "Yes",
    aiConfidence: 78,
    aiReason: "Merge typically occurs ep 7-8. This is ep 8 with 12 remaining — high probability.",
    odds: "x1.9",
    crowdAgree: 62,
    result: null,
  },
  {
    id: "2",
    show: "The Bachelor",
    question: "Does Sarah get the final rose?",
    aiPick: "Yes",
    aiConfidence: 85,
    aiReason: "Based on screen time analysis and edit patterns, Sarah has 2.3x more positive coverage.",
    odds: "x2.1",
    crowdAgree: 54,
    result: null,
  },
  {
    id: "3",
    show: "Love Island",
    question: "Will there be a surprise recoupling?",
    aiPick: "No",
    aiConfidence: 61,
    aiReason: "Recouplings follow a 3-episode cycle. We're at episode 2 of the current cycle.",
    odds: "x2.8",
    crowdAgree: 71,
    result: null,
  },
  {
    id: "4",
    show: "The Traitors",
    question: "Tribal blindside tonight?",
    aiPick: "No",
    aiConfidence: 72,
    aiReason: "Alliance stability is high. No idol hints detected in the last 3 episodes.",
    odds: "x2.4",
    crowdAgree: 45,
    result: null,
  },
];

const LEADERBOARD = [
  { rank: 1, name: "AI (Gemini)", accuracy: 73, streak: 5, isAI: true },
  { rank: 2, name: "StrategyKing", accuracy: 71, streak: 4, isAI: false },
  { rank: 3, name: "RealityPro22", accuracy: 68, streak: 3, isAI: false },
  { rank: 4, name: "PredictorMax", accuracy: 65, streak: 2, isAI: false },
  { rank: 5, name: "ShowWatcher", accuracy: 63, streak: 6, isAI: false },
];

export function AIClient() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = AI_PICKS[activeIdx];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/25">
            <Brain className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h1 className="font-headline text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white">
              Tips vs AI
            </h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-10 max-w-xl">
          AI looks at show patterns and stats and suggests a pick. See its picks, then decide: pick the same or pick the opposite.
        </p>
      </FadeIn>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* AI Pick Cards — main area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pick selector tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {AI_PICKS.map((pick, i) => (
              <button
                key={pick.id}
                onClick={() => setActiveIdx(i)}
                className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                  activeIdx === i
                    ? "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20"
                    : "text-muted-foreground border-white/[0.06] hover:border-white/[0.12] hover:text-white"
                }`}
              >
                {pick.show}
              </button>
            ))}
          </div>

          {/* Active pick card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
            >
              <div className="p-6 sm:p-8">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                  {active.show}
                </p>
                <h2 className="text-xl font-bold text-white mb-6">
                  {active.question}
                </h2>

                {/* AI Analysis */}
                <div className="rounded-xl bg-violet-500/5 border border-violet-500/15 p-5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-4 w-4 text-violet-400" />
                    <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                      AI Analysis
                    </span>
                  </div>
                  <p className="text-sm text-white/80 mb-5">{active.aiReason}</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">AI Pick</span>
                      <p className="text-2xl font-bold text-neon-cyan">{active.aiPick}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Confidence</span>
                      <p className="text-2xl font-bold text-neon-gold">{active.aiConfidence}%</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">Boost</span>
                      <p className="text-2xl font-bold text-white">~{active.odds.replace("x", "")}x</p>
                    </div>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                    <span>AI Confidence: {active.aiConfidence}%</span>
                    <span>Community agrees: {active.crowdAgree}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${active.aiConfidence}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-neon-cyan"
                    />
                  </div>
                </div>

                {/* Follow / Fade */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan font-bold hover:bg-neon-cyan/20 transition-colors">
                    <TrendingUp className="h-4 w-4" />
                    Pick the same
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-neon-magenta/10 border border-neon-magenta/20 text-neon-magenta font-bold hover:bg-neon-magenta/20 transition-colors">
                    <TrendingDown className="h-4 w-4" />
                    Pick the opposite
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Boost is approximate and can change.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Target, label: "AI hit rate", value: "73%", color: "text-violet-400" },
              { icon: Zap, label: "Win streak", value: "5W", color: "text-neon-cyan" },
              { icon: BarChart3, label: "Picks this week", value: "12", color: "text-neon-gold" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <stat.icon className={`h-4 w-4 mx-auto mb-2 ${stat.color}`} />
                <p className="text-lg font-bold font-mono text-white">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar — AI vs Community leaderboard */}
        <div>
          <div className="sticky top-20 space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-neon-gold" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    AI vs Community
                  </h3>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {LEADERBOARD.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      entry.isAI
                        ? "bg-violet-500/10 border border-violet-500/15"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className={`w-6 text-center font-mono text-sm font-bold ${
                      entry.rank === 1 ? "text-neon-gold" : "text-white/40"
                    }`}>
                      {entry.rank}
                    </span>
                    {entry.isAI && <Bot className="h-4 w-4 text-violet-400 shrink-0" />}
                    <span className={`flex-1 text-sm truncate ${entry.isAI ? "text-violet-300 font-bold" : "text-white/80"}`}>
                      {entry.name}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {entry.accuracy}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-violet-500/5 border border-violet-500/15 text-center">
              <Brain className="h-6 w-6 text-violet-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-white mb-1">Powered by Gemini AI</p>
              <p className="text-xs text-muted-foreground">
                Analyzes historical data, player stats, and show patterns to generate predictions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
