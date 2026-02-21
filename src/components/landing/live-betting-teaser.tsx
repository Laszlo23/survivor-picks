"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Radio,
  Sparkles,
  Bell,
  TrendingUp,
  Zap,
  Eye,
  Bot,
  Timer,
  Users,
  Trophy,
  Coins,
  Maximize,
} from "lucide-react";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import { NeonButton } from "@/components/ui/neon-button";

const SCENARIO = {
  title: "SURVIVOR S50 — TRIBAL COUNCIL",
  outcomeA: { label: "Venus Voted Out", color: "#00e5ff", icon: "🔥" },
  outcomeB: { label: "Q Voted Out", color: "#ff0080", icon: "⚡" },
  communityA: 62,
  aiPick: "A" as const,
  aiConfidence: 74,
  timeLeft: "2:33",
  viewers: 14_833,
};

const BALANCE = 33_333;
const MIN_BET = 333;

export function LandingLiveBettingTeaser() {
  const [sliderPos, setSliderPos] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [betAmount, setBetAmount] = useState(3_333);
  const [confirmed, setConfirmed] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const side: "A" | "B" | null =
    sliderPos < 0.42 ? "A" : sliderPos > 0.58 ? "B" : null;

  const communityB = 100 - SCENARIO.communityA;
  const oddsA = (100 / SCENARIO.communityA).toFixed(2);
  const oddsB = (100 / communityB).toFixed(2);
  const potentialWin =
    side === "A"
      ? Math.round(betAmount * parseFloat(oddsA))
      : side === "B"
        ? Math.round(betAmount * parseFloat(oddsB))
        : 0;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (confirmed) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [confirmed]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !sliderRef.current || confirmed) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setSliderPos(x);
      const dist = Math.abs(x - 0.5) * 2;
      setBetAmount(Math.max(MIN_BET, Math.round(dist * BALANCE)));
    },
    [isDragging, confirmed]
  );

  const handlePointerUp = useCallback(() => setIsDragging(false), []);

  const [demoWon, setDemoWon] = useState(false);

  const handleConfirm = () => {
    if (!side) return;
    setConfirmed(true);
    const won = Math.random() > 0.5;
    setDemoWon(won);
    setTimeout(() => setShowResult(true), 3_000);
  };

  const handleReset = () => {
    setConfirmed(false);
    setShowResult(false);
    setSliderPos(0.5);
    setBetAmount(3_333);
  };

  const chosenOutcome = side === "A" ? SCENARIO.outcomeA : side === "B" ? SCENARIO.outcomeB : null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="mb-3 flex items-center gap-3 flex-wrap">
          <LowerThird label="INTERACTIVE DEMO" value="Live Betting" />
          <span className="inline-flex items-center gap-1 rounded-full bg-neon-magenta/10 border border-neon-magenta/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neon-magenta animate-pulse">
            <Sparkles className="h-3 w-3" />
            Try It Now
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-8 max-w-xl">
          Drag the line to pick a side and set your bet. This is what live betting
          looks like — video on the left, your bet on the right. Two outcomes, one slider, real-time odds.
        </p>
      </FadeIn>

      {/* ── Main Split: Video | Betting Panel ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="rounded-2xl border border-white/[0.08] bg-studio-dark/80 backdrop-blur-sm overflow-hidden"
      >
        <div className="grid lg:grid-cols-5">
          {/* ── LEFT: Video Feed ──────────────────────────────────── */}
          <div className="lg:col-span-3 relative">
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
                LIVE
              </span>
              <span className="flex items-center gap-1 rounded bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/80">
                <Eye className="h-3 w-3" />
                {SCENARIO.title}
              </span>
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-none">
              <span className="flex items-center gap-1 rounded bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] text-white/60">
                <Users className="h-3 w-3" />
                {SCENARIO.viewers.toLocaleString("en-US")}
              </span>
            </div>
            {/* Fullscreen link */}
            <Link
              href="/live-demo"
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-black/70 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold text-white/80 hover:text-white hover:bg-black/80 transition-colors"
            >
              <Maximize className="h-3 w-3" />
              Fullscreen
            </Link>
          </div>

          {/* ── RIGHT: Betting Panel ─────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col border-t lg:border-t-0 lg:border-l border-white/[0.06]">
            {/* Header: Internal wallet */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Radio className="h-3.5 w-3.5 text-neon-cyan animate-pulse" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Bet
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase tracking-wider text-white/40">Your $PICKS</span>
                <div className="flex items-center gap-1.5 text-[10px] text-neon-gold">
                  <Coins className="h-3 w-3" />
                  <span className="font-mono font-bold">{BALANCE.toLocaleString("en-US")}</span>
                  <span className="text-white/30">$PICKS</span>
                </div>
              </div>
            </div>

            {/* AI Companion */}
            <div className="px-4 py-2 bg-violet-500/5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Bot className="h-3.5 w-3.5 text-violet-400" />
                <span className="text-[10px] text-violet-300">
                  AI picks <strong>{SCENARIO.outcomeA.label}</strong> — {SCENARIO.aiConfidence}%
                </span>
              </div>
            </div>

            {/* Outcomes */}
            <div className="flex-1 px-4 py-3 space-y-2">
              {/* Outcome A */}
              <motion.div
                animate={{
                  borderColor: side === "A" ? SCENARIO.outcomeA.color : "rgba(255,255,255,0.06)",
                }}
                className="rounded-xl border-2 bg-black/20 p-3 transition-colors"
                style={{
                  boxShadow: side === "A" ? `0 0 20px ${SCENARIO.outcomeA.color}15` : "none",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{SCENARIO.outcomeA.icon}</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: side === "A" ? SCENARIO.outcomeA.color : "white" }}
                    >
                      {SCENARIO.outcomeA.label}
                    </span>
                  </div>
                  <span
                    className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ color: SCENARIO.outcomeA.color, background: `${SCENARIO.outcomeA.color}15` }}
                  >
                    x{oddsA}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${SCENARIO.communityA}%`, background: SCENARIO.outcomeA.color }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold" style={{ color: SCENARIO.outcomeA.color }}>
                    {SCENARIO.communityA}%
                  </span>
                </div>
                {side === "A" && !confirmed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 pt-2 border-t border-white/[0.06]">
                    <p className="text-xs text-neon-gold">
                      {betAmount.toLocaleString("en-US")} $PICKS → Win {potentialWin.toLocaleString("en-US")}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Timer */}
              <div className="flex items-center justify-center gap-2 py-1">
                <Timer className="h-3 w-3 text-neon-gold" />
                <span className="text-[10px] font-mono font-bold text-neon-gold">{SCENARIO.timeLeft}</span>
                <span className="text-xl font-display font-black text-white/10">VS</span>
              </div>

              {/* Outcome B */}
              <motion.div
                animate={{
                  borderColor: side === "B" ? SCENARIO.outcomeB.color : "rgba(255,255,255,0.06)",
                }}
                className="rounded-xl border-2 bg-black/20 p-3 transition-colors"
                style={{
                  boxShadow: side === "B" ? `0 0 20px ${SCENARIO.outcomeB.color}15` : "none",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{SCENARIO.outcomeB.icon}</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: side === "B" ? SCENARIO.outcomeB.color : "white" }}
                    >
                      {SCENARIO.outcomeB.label}
                    </span>
                  </div>
                  <span
                    className="text-xs font-mono font-bold px-1.5 py-0.5 rounded"
                    style={{ color: SCENARIO.outcomeB.color, background: `${SCENARIO.outcomeB.color}15` }}
                  >
                    x{oddsB}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${communityB}%`, background: SCENARIO.outcomeB.color }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold" style={{ color: SCENARIO.outcomeB.color }}>
                    {communityB}%
                  </span>
                </div>
                {side === "B" && !confirmed && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 pt-2 border-t border-white/[0.06]">
                    <p className="text-xs text-neon-gold">
                      {betAmount.toLocaleString("en-US")} $PICKS → Win {potentialWin.toLocaleString("en-US")}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* ── Slider + Confirm ────────────────────────────────── */}
            <div className="px-4 pb-4">
              <AnimatePresence mode="wait">
                {showResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl ${demoWon ? "bg-neon-gold/5 border border-neon-gold/20" : "bg-neon-magenta/5 border border-neon-magenta/20"}`}
                  >
                    <Trophy className={`h-6 w-6 ${demoWon ? "text-neon-gold" : "text-muted-foreground"}`} />
                    <p className={`text-sm font-bold ${demoWon ? "text-neon-gold" : "text-neon-magenta"}`}>
                      {demoWon
                        ? `You Won ${potentialWin.toLocaleString("en-US")} $PICKS!`
                        : `You Lost ${betAmount.toLocaleString("en-US")} $PICKS`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">This is a demo — no real tokens used</p>
                    <button
                      onClick={handleReset}
                      className="mt-1 px-4 py-1.5 rounded-lg bg-neon-cyan text-studio-black text-xs font-bold hover:bg-neon-cyan/90 transition-colors"
                    >
                      Try Again
                    </button>
                  </motion.div>
                ) : confirmed ? (
                  <motion.div
                    key="locked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]"
                  >
                    <div className="h-2 w-2 rounded-full bg-neon-gold animate-pulse" />
                    <p className="text-xs font-bold text-white">
                      Bet locked — waiting…
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="slider" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {/* Instruction */}
                    <p className="text-[10px] text-white/30 text-center mb-2 uppercase tracking-wider">
                      {side
                        ? `${betAmount.toLocaleString("en-US")} $PICKS on ${chosenOutcome?.label}`
                        : "← Drag to pick a side →"}
                    </p>

                    {/* Slider Track */}
                    <div
                      ref={sliderRef}
                      onPointerDown={handlePointerDown}
                      onPointerMove={handlePointerMove}
                      onPointerUp={handlePointerUp}
                      className="relative h-10 rounded-xl bg-black/40 border border-white/[0.06] cursor-grab active:cursor-grabbing overflow-hidden touch-none mb-3"
                    >
                      {/* Left fill */}
                      <div
                        className="absolute top-0 left-0 bottom-0 rounded-l-xl transition-all duration-75"
                        style={{
                          width: `${sliderPos * 100}%`,
                          background: sliderPos < 0.42 ? `linear-gradient(90deg, ${SCENARIO.outcomeA.color}25, ${SCENARIO.outcomeA.color}08)` : "transparent",
                        }}
                      />
                      {/* Right fill */}
                      <div
                        className="absolute top-0 right-0 bottom-0 rounded-r-xl transition-all duration-75"
                        style={{
                          width: `${(1 - sliderPos) * 100}%`,
                          background: sliderPos > 0.58 ? `linear-gradient(270deg, ${SCENARIO.outcomeB.color}25, ${SCENARIO.outcomeB.color}08)` : "transparent",
                        }}
                      />

                      {/* Labels */}
                      <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                        <span className="text-[10px] font-bold" style={{ color: SCENARIO.outcomeA.color, opacity: sliderPos < 0.42 ? 1 : 0.25 }}>
                          {SCENARIO.outcomeA.icon} {SCENARIO.outcomeA.label}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: SCENARIO.outcomeB.color, opacity: sliderPos > 0.58 ? 1 : 0.25 }}>
                          {SCENARIO.outcomeB.label} {SCENARIO.outcomeB.icon}
                        </span>
                      </div>

                      {/* Draggable line */}
                      <motion.div
                        className="absolute top-0 bottom-0 w-0.5 -translate-x-1/2 pointer-events-none"
                        style={{ left: `${sliderPos * 100}%` }}
                        animate={{
                          backgroundColor: side === "A" ? SCENARIO.outcomeA.color : side === "B" ? SCENARIO.outcomeB.color : "rgba(255,255,255,0.3)",
                          boxShadow: side ? `0 0 12px ${side === "A" ? SCENARIO.outcomeA.color : SCENARIO.outcomeB.color}50` : "none",
                        }}
                      >
                        <div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center backdrop-blur-sm"
                          style={{
                            borderColor: side === "A" ? SCENARIO.outcomeA.color : side === "B" ? SCENARIO.outcomeB.color : "rgba(255,255,255,0.2)",
                            background: side === "A" ? `${SCENARIO.outcomeA.color}15` : side === "B" ? `${SCENARIO.outcomeB.color}15` : "rgba(0,0,0,0.4)",
                          }}
                        >
                          <span className="text-[8px] font-mono font-bold text-white">
                            {side ? (betAmount >= 1000 ? `${(betAmount / 1000).toFixed(1)}K` : betAmount) : "—"}
                          </span>
                        </div>
                      </motion.div>

                      {/* Dead zone */}
                      <div className="absolute top-0 bottom-0 left-[42%] w-[16%] pointer-events-none">
                        <div className="h-full border-l border-r border-dashed border-white/[0.04]" />
                      </div>
                    </div>

                    {/* Confirm */}
                    <button
                      onClick={handleConfirm}
                      disabled={!side}
                      className={`w-full py-2.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        side
                          ? "bg-neon-cyan text-studio-black hover:bg-neon-cyan/90 shadow-[0_0_20px_hsl(185_100%_55%/0.15)]"
                          : "bg-white/[0.03] text-white/25 cursor-not-allowed"
                      }`}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {side ? `Lock ${betAmount.toLocaleString("en-US")} $PICKS` : "Pick a Side"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Features Row ──────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-3 mt-6">
        {[
          { icon: Radio, title: "Watch & Bet Live", desc: "Stream in-app while the community bets alongside you in real-time.", color: "text-neon-cyan", accent: "hsl(185 100% 55%)" },
          { icon: Bell, title: "Community-Driven Odds", desc: "Odds shift as players pick sides. Early conviction = better payout potential.", color: "text-violet-400", accent: "hsl(260 80% 60%)" },
          { icon: TrendingUp, title: "One Slider, Two Outcomes", desc: "Drag the line to pick your side and set your stake. Simple and fast.", color: "text-neon-gold", accent: "hsl(45 100% 55%)" },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.06 }}
            className="flex gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: `${f.accent}12`, border: `1px solid ${f.accent}25` }}
            >
              <f.icon className={`h-4 w-4 ${f.color}`} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white mb-0.5">{f.title}</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Fullscreen CTA */}
      <div className="mt-4 text-center">
        <Link
          href="/live-demo"
          className="inline-flex items-center gap-2 text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors font-bold uppercase tracking-wider"
        >
          <Maximize className="h-3.5 w-3.5" />
          Open Fullscreen 16:9 Experience
        </Link>
      </div>
    </section>
  );
}
