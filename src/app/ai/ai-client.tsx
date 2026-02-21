"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Brain,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Bell,
  ChevronRight,
} from "lucide-react";
import { FadeIn } from "@/components/motion";

const CONCEPT_FEATURES = [
  {
    icon: Brain,
    title: "Pattern Analysis",
    desc: "AI studies historical show data, edit patterns, and player behavior to find edges.",
  },
  {
    icon: TrendingUp,
    title: "Follow the AI",
    desc: "Agree with the AI pick and ride its confidence on any open market.",
  },
  {
    icon: TrendingDown,
    title: "Fade the AI",
    desc: "Think the AI is wrong? Pick the opposite and earn contrarian bonus points.",
  },
  {
    icon: Sparkles,
    title: "Live Accuracy Tracking",
    desc: "See how AI stacks up against the community in real-time leaderboards.",
  },
];

export function AIClient() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <FadeIn>
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/25 mb-6"
          >
            <Bot className="h-8 w-8 text-violet-400" />
          </motion.div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-3 w-3" />
            Coming Soon
          </div>

          <h1 className="font-headline text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-white mb-4">
            Can You Beat the AI?
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We&apos;re building an AI prediction engine that analyzes show patterns and stats.
            See what the AI picks, then decide: follow it or fade it.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {CONCEPT_FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-violet-500/20 transition-colors"
            >
              <feature.icon className="h-5 w-5 text-violet-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={0.25}>
        <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-neon-cyan/5 border border-violet-500/20 p-8 text-center">
          <Bell className="h-6 w-6 text-violet-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">
            Get Notified at Launch
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Be the first to test AI predictions and compete for the top of the AI vs Community leaderboard.
          </p>

          {submitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
            >
              <Sparkles className="h-4 w-4" />
              You&apos;re on the list!
            </motion.div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
              <button
                onClick={() => {
                  if (email.includes("@")) setSubmitted(true);
                }}
                disabled={!email.includes("@")}
                className="px-6 py-3 rounded-xl bg-violet-500 text-white text-sm font-bold hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                Notify Me
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
