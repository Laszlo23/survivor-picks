"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Brain,
  Zap,
  BarChart3,
} from "lucide-react";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";

const AI_PICKS = [
  {
    question: "Will Survivor's merge happen this episode?",
    aiPick: "Yes",
    aiConfidence: 78,
    aiReason: "Pattern analysis: merge typically occurs ep 7-8. This is ep 8 with 12 remaining.",
    odds: "x1.9",
    crowd: 62,
  },
  {
    question: "Ronaldo takes 4+ shots?",
    aiPick: "Yes",
    aiConfidence: 85,
    aiReason: "Ronaldo averages 5.2 shots/game vs this opponent. High confidence.",
    odds: "x2.1",
    crowd: 54,
  },
  {
    question: "Tribal blindside tonight?",
    aiPick: "No",
    aiConfidence: 61,
    aiReason: "Alliance stability high. No idol hints detected in last 3 episodes.",
    odds: "x2.8",
    crowd: 71,
  },
];

export function LandingAICompanion() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = AI_PICKS[activeIdx];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="mb-3 flex items-center gap-3">
          <LowerThird label="AI POWERED" value="Bet Companion" />
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-400">
            <Brain className="h-3 w-3" />
            Gemini AI
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-10 max-w-xl">
          See what AI would bet — then decide to <span className="text-neon-cyan font-bold">follow</span> or{" "}
          <span className="text-neon-magenta font-bold">fade</span>. The AI analyzes patterns, stats, and
          live feeds. You make the final call.
        </p>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* AI Pick Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-3 rounded-2xl border border-white/[0.08] bg-studio-dark/80 backdrop-blur-sm overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06]">
            {AI_PICKS.map((pick, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all ${
                  activeIdx === i
                    ? "text-neon-cyan border-b-2 border-neon-cyan bg-neon-cyan/5"
                    : "text-muted-foreground hover:text-white/70"
                }`}
              >
                Pick {i + 1}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              {/* Question */}
              <p className="text-base font-bold text-white mb-4">
                {active.question}
              </p>

              {/* AI Analysis */}
              <div className="rounded-xl bg-violet-500/5 border border-violet-500/15 p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-violet-400" />
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                    AI Analysis
                  </span>
                </div>
                <p className="text-sm text-white/80 mb-3">{active.aiReason}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Pick</span>
                    <p className="text-lg font-bold text-neon-cyan">{active.aiPick}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</span>
                    <p className="text-lg font-bold text-neon-gold">{active.aiConfidence}%</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Odds</span>
                    <p className="text-lg font-bold text-white">{active.odds}</p>
                  </div>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                  <span>AI Confidence</span>
                  <span>Community: {active.crowd}% agree</span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${active.aiConfidence}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-neon-cyan"
                  />
                </div>
              </div>

              {/* Follow / Fade buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-bold hover:bg-neon-cyan/20 transition-colors">
                  <TrendingUp className="h-4 w-4" />
                  Follow AI
                </button>
                <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-magenta/10 border border-neon-magenta/20 text-neon-magenta text-sm font-bold hover:bg-neon-magenta/20 transition-colors">
                  <TrendingDown className="h-4 w-4" />
                  Fade AI
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Feature list */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {[
            {
              icon: Brain,
              title: "Pattern Recognition",
              desc: "AI analyzes historical data, player stats, and show patterns to predict outcomes.",
              color: "text-violet-400",
              accent: "hsl(260 80% 60%)",
            },
            {
              icon: Zap,
              title: "Follow or Fade",
              desc: "See the AI's pick and confidence level, then choose to follow or bet against it.",
              color: "text-neon-cyan",
              accent: "hsl(185 100% 55%)",
            },
            {
              icon: BarChart3,
              title: "Track AI vs You",
              desc: "Leaderboard tracks AI accuracy vs community. Can you beat the machine?",
              color: "text-neon-gold",
              accent: "hsl(45 100% 55%)",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              className="flex gap-3"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: `${f.accent}12`,
                  border: `1px solid ${f.accent}25`,
                }}
              >
                <f.icon className={`h-4 w-4 ${f.color}`} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">{f.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </motion.div>
          ))}

          <div className="mt-auto p-4 rounded-xl bg-neon-gold/5 border border-neon-gold/15 text-center">
            <p className="text-xs text-neon-gold font-bold mb-1">333 Spirit</p>
            <p className="text-[10px] text-muted-foreground">
              AI bets start at 333 $PICKS. Beat the AI 3 times in a row for a 3.33x bonus.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
