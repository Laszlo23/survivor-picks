"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Sparkles,
  Bell,
  TrendingUp,
  Zap,
  Eye,
} from "lucide-react";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import { NeonButton } from "@/components/ui/neon-button";

function MockBetLine({
  prompt,
  odds,
  category,
  delay,
}: {
  prompt: string;
  odds: string;
  category: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2.5"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-wider text-neon-magenta bg-neon-magenta/10 border border-neon-magenta/20 rounded px-1.5 py-0.5 shrink-0">
          {category}
        </span>
        <span className="text-xs text-white/80 truncate">{prompt}</span>
      </div>
      <span className="text-xs font-bold text-neon-gold tabular-nums shrink-0">
        {odds}
      </span>
    </motion.div>
  );
}

export function LandingLiveBettingTeaser() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="mb-3 flex items-center gap-3">
          <LowerThird label="COMING SOON" value="Live Betting" />
          <span className="inline-flex items-center gap-1 rounded-full bg-neon-magenta/10 border border-neon-magenta/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neon-magenta animate-pulse">
            <Sparkles className="h-3 w-3" />
            In Development
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-10 max-w-xl">
          YouTube Live + AI-Powered Real-Time Predictions. Watch live, stake your $PICKS
          in real-time, and let AI create dynamic odds as the show unfolds. Minimum bet: <span className="text-neon-gold font-bold font-mono">333 $PICKS</span>.
        </p>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Mock Split-Screen Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-3 relative rounded-2xl border border-white/[0.08] bg-studio-dark/80 backdrop-blur-sm overflow-hidden"
        >
          {/* Live Survivor Video Example */}
          <div className="relative">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/s3PE3dl6v7g?rel=0&list=PL7cJ8ZW86m2ju1HQ4TbEQos_uxpoZWReT"
                title="Survivor Türkiye 2026 — Live Betting Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
            {/* Overlay badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
              <span className="flex items-center gap-1 rounded bg-red-600/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Live Example
              </span>
              <span className="flex items-center gap-1 rounded bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/80">
                <Eye className="h-3 w-3" />
                Survivor Türkiye
              </span>
            </div>
          </div>

          {/* Mock Betting Panel */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                Live Bets
              </span>
              <span className="flex items-center gap-1 text-[10px] text-neon-cyan">
                <Radio className="h-3 w-3 animate-pulse" />
                AI-Powered Odds
              </span>
            </div>
            <MockBetLine
              prompt="Who wins immunity?"
              odds="x2.4"
              category="IMMUNITY"
              delay={0.2}
            />
            <MockBetLine
              prompt="Tribal council blindside?"
              odds="x3.1"
              category="FLASH"
              delay={0.3}
            />
            <MockBetLine
              prompt="Will an idol be played?"
              odds="x1.8"
              category="TWIST"
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* Feature List + Notify */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {[
            {
              icon: Radio,
              title: "Watch Live Together",
              desc: "Stream directly in-app via YouTube Live while the whole community bets alongside you.",
              color: "text-neon-cyan",
              accent: "hsl(185 100% 55%)",
            },
            {
              icon: Zap,
              title: "AI Creates Dynamic Odds",
              desc: "Gemini AI analyzes the live feed and generates flash bets with real-time shifting odds.",
              color: "text-neon-magenta",
              accent: "hsl(320 100% 60%)",
            },
            {
              icon: TrendingUp,
              title: "Parimutuel Pools",
              desc: "Odds move with the crowd. The earlier you bet, the better your multiplier.",
              color: "text-neon-gold",
              accent: "hsl(45 100% 55%)",
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
              className="flex gap-3"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: `${feature.accent}12`,
                  border: `1px solid ${feature.accent}25`,
                }}
              >
                <feature.icon className={`h-4 w-4 ${feature.color}`} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-0.5">
                  {feature.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Notify CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-auto rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-neon-cyan" />
              <span className="text-xs font-bold text-white">
                Get Notified at Launch
              </span>
            </div>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.p
                  key="done"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-neon-cyan"
                >
                  You&apos;re on the list! We&apos;ll notify you when live
                  betting goes live.
                </motion.p>
              ) : (
                <motion.form
                  key="form"
                  className="flex gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!email.trim()) return;
                    try {
                      await fetch("/api/newsletter", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                    } catch {
                      // best-effort
                    }
                    setSubmitted(true);
                  }}
                >
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 rounded-md bg-white/[0.04] border border-white/[0.1] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan/40"
                  />
                  <NeonButton variant="primary" className="text-xs px-4 py-2">
                    Notify Me
                  </NeonButton>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
