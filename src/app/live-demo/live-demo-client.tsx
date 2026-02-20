"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Timer,
  Users,
  Trophy,
  Bot,
  ChevronLeft,
  Volume2,
  VolumeX,
  Coins,
  LayoutGrid,
  X,
} from "lucide-react";
import Link from "next/link";

const PICKS_BALANCE = 33_333;
const MIN_BET = 333;

const SCENARIOS = [
  {
    id: "survivor",
    title: "SURVIVOR S50 — TRIBAL COUNCIL",
    outcomeA: { label: "Venus Voted Out", color: "#00e5ff", icon: "🔥" },
    outcomeB: { label: "Q Voted Out", color: "#ff0080", icon: "⚡" },
    communityA: 62,
    aiPick: "A" as const,
    aiConfidence: 74,
    timeLeft: "2:33",
    viewers: 14_833,
  },
  {
    id: "soccer",
    title: "REAL MADRID vs MAN CITY — LIVE",
    outcomeA: { label: "Mbappé Gets Fouled", color: "#00e5ff", icon: "⚽" },
    outcomeB: { label: "No Foul Before 30'", color: "#ff0080", icon: "🛡️" },
    communityA: 58,
    aiPick: "A" as const,
    aiConfidence: 67,
    timeLeft: "8:33",
    viewers: 33_333,
  },
];

export function LiveDemoClient() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const scenario = SCENARIOS[scenarioIdx];

  const [betAmount, setBetAmount] = useState(3_333);
  const [sliderPos, setSliderPos] = useState(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const side: "A" | "B" | null = sliderPos < 0.45 ? "A" : sliderPos > 0.55 ? "B" : null;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !sliderRef.current || confirmed) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setSliderPos(x);
      const dist = Math.abs(x - 0.5) * 2;
      setBetAmount(Math.max(MIN_BET, Math.round(dist * PICKS_BALANCE)));
    },
    [isDragging, confirmed]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleConfirm = () => {
    if (!side) return;
    setConfirmed(true);
    setTimeout(() => {
      setShowResult(true);
      setNotificationCount((n) => n + 1);
    }, 3_333);
  };

  const handleReset = useCallback(() => {
    setConfirmed(false);
    setShowResult(false);
    setSliderPos(0.5);
    setBetAmount(3_333);
    setScenarioIdx((i) => (i + 1) % SCENARIOS.length);
  }, []);

  const togglePanel = useCallback(() => {
    setPanelOpen((o) => {
      if (!o) setNotificationCount(0);
      return !o;
    });
  }, []);

  const communityB = 100 - scenario.communityA;
  const oddsA = (100 / scenario.communityA).toFixed(2);
  const oddsB = (100 / communityB).toFixed(2);
  const potentialWin =
    side === "A"
      ? Math.round(betAmount * parseFloat(oddsA))
      : side === "B"
        ? Math.round(betAmount * parseFloat(oddsB))
        : 0;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (panelOpen) setPanelOpen(false);
        else handleReset();
      }
    },
    [handleReset, panelOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const content = (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col select-none overflow-hidden">
      {/* ── Video Background ──────────────────────────────────────── */}
      <div className="absolute inset-0">
        <iframe
          src={`https://www.youtube.com/embed/s3PE3dl6v7g?autoplay=1&mute=${muted ? 1 : 0}&controls=0&loop=1&playlist=s3PE3dl6v7g&modestbranding=1&rel=0&showinfo=0`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: "scale(1.15)" }}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60" />
      </div>

      {/* ── Minimal Top Bar (always visible) ──────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Exit</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-red-400">
              LIVE
            </span>
          </div>
          <span className="text-xs font-bold text-white/80 uppercase tracking-wider hidden sm:block">
            {scenario.title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMuted(!muted)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Pixel Icon (bottom right) ──────────────────────────────── */}
      <button
        onClick={togglePanel}
        className="absolute bottom-6 right-6 z-20 flex items-center justify-center w-12 h-12 rounded-xl bg-black/70 backdrop-blur-md border border-white/[0.12] hover:bg-black/80 hover:border-neon-cyan/40 transition-all shadow-lg"
        aria-label={panelOpen ? "Close betting panel" : "Open betting panel"}
      >
        <LayoutGrid className="h-5 w-5 text-white" strokeWidth={2.5} />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neon-gold text-[10px] font-bold text-studio-black animate-pulse">
            {notificationCount > 9 ? "9+" : notificationCount}
          </span>
        )}
      </button>

      {/* ── Betting Panel Overlay (when pixel icon clicked) ────────── */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-[15] flex flex-col bg-black/60 backdrop-blur-sm"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-mono">{scenario.viewers.toLocaleString()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-white/40">Your $PICKS</span>
                  <div className="flex items-center gap-1.5 text-xs text-neon-gold">
                    <Coins className="h-3.5 w-3.5" />
                    <span className="font-mono font-bold">{PICKS_BALANCE.toLocaleString()}</span>
                    <span className="text-white/30">$PICKS</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white"
                aria-label="Close panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ── Center Content ────────────────────────────────────────── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-4">
        {/* AI Companion Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 backdrop-blur-md">
            <Bot className="h-4 w-4 text-violet-400" />
            <span className="text-xs text-violet-300">
              AI picks <strong>{scenario.aiPick === "A" ? scenario.outcomeA.label : scenario.outcomeB.label}</strong>
              {" "}— {scenario.aiConfidence}% confidence
            </span>
          </div>
        </motion.div>

        {/* Outcome Cards */}
        <div className="w-full max-w-5xl flex items-stretch gap-4 sm:gap-8 mb-8">
          {/* Outcome A */}
          <motion.div
            animate={{
              scale: side === "A" ? 1.02 : 1,
              borderColor: side === "A" ? scenario.outcomeA.color : "rgba(255,255,255,0.06)",
            }}
            className="flex-1 rounded-2xl border-2 bg-black/40 backdrop-blur-md p-4 sm:p-6 transition-colors"
            style={{
              boxShadow: side === "A" ? `0 0 40px ${scenario.outcomeA.color}25` : "none",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl sm:text-3xl">{scenario.outcomeA.icon}</span>
              <span
                className="text-xs font-mono font-bold px-2 py-1 rounded-md"
                style={{
                  color: scenario.outcomeA.color,
                  background: `${scenario.outcomeA.color}15`,
                }}
              >
                x{oddsA}
              </span>
            </div>
            <h3
              className="text-lg sm:text-xl font-display font-bold mb-2"
              style={{ color: side === "A" ? scenario.outcomeA.color : "white" }}
            >
              {scenario.outcomeA.label}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{ width: `${scenario.communityA}%` }}
                  className="h-full rounded-full"
                  style={{ background: scenario.outcomeA.color }}
                />
              </div>
              <span className="text-xs font-mono font-bold" style={{ color: scenario.outcomeA.color }}>
                {scenario.communityA}%
              </span>
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">
              {Math.round(scenario.viewers * scenario.communityA / 100).toLocaleString()} bettors
            </p>

            {side === "A" && !confirmed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03]"
              >
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Your Bet</p>
                <p className="text-xl font-mono font-bold" style={{ color: scenario.outcomeA.color }}>
                  {betAmount.toLocaleString()} <span className="text-xs text-white/40">$PICKS</span>
                </p>
                <p className="text-xs text-neon-gold mt-1">
                  → Win {potentialWin.toLocaleString()} $PICKS
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="h-4 w-4 text-neon-gold" />
              <span className="text-sm font-mono font-bold text-neon-gold">{scenario.timeLeft}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-black text-white/20">VS</div>
          </div>

          {/* Outcome B */}
          <motion.div
            animate={{
              scale: side === "B" ? 1.02 : 1,
              borderColor: side === "B" ? scenario.outcomeB.color : "rgba(255,255,255,0.06)",
            }}
            className="flex-1 rounded-2xl border-2 bg-black/40 backdrop-blur-md p-4 sm:p-6 transition-colors"
            style={{
              boxShadow: side === "B" ? `0 0 40px ${scenario.outcomeB.color}25` : "none",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl sm:text-3xl">{scenario.outcomeB.icon}</span>
              <span
                className="text-xs font-mono font-bold px-2 py-1 rounded-md"
                style={{
                  color: scenario.outcomeB.color,
                  background: `${scenario.outcomeB.color}15`,
                }}
              >
                x{oddsB}
              </span>
            </div>
            <h3
              className="text-lg sm:text-xl font-display font-bold mb-2"
              style={{ color: side === "B" ? scenario.outcomeB.color : "white" }}
            >
              {scenario.outcomeB.label}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  animate={{ width: `${communityB}%` }}
                  className="h-full rounded-full"
                  style={{ background: scenario.outcomeB.color }}
                />
              </div>
              <span className="text-xs font-mono font-bold" style={{ color: scenario.outcomeB.color }}>
                {communityB}%
              </span>
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">
              {Math.round(scenario.viewers * communityB / 100).toLocaleString()} bettors
            </p>

            {side === "B" && !confirmed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03]"
              >
                <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Your Bet</p>
                <p className="text-xl font-mono font-bold" style={{ color: scenario.outcomeB.color }}>
                  {betAmount.toLocaleString()} <span className="text-xs text-white/40">$PICKS</span>
                </p>
                <p className="text-xs text-neon-gold mt-1">
                  → Win {potentialWin.toLocaleString()} $PICKS
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Bottom Slider Bar ─────────────────────────────────────── */}
      <div className="relative z-10 px-4 sm:px-8 pb-6">
        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-neon-gold/20">
                <Trophy className="h-8 w-8 text-neon-gold" />
                <p className="text-lg font-display font-bold text-neon-gold">
                  You Won {potentialWin.toLocaleString()} $PICKS!
                </p>
                <p className="text-xs text-white/50">
                  Your {side === "A" ? scenario.outcomeA.label : scenario.outcomeB.label} bet paid off at x{side === "A" ? oddsA : oddsB}
                </p>
                <button
                  onClick={handleReset}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-neon-cyan text-studio-black text-sm font-bold hover:bg-neon-cyan/90 transition-colors"
                >
                  Next Bet →
                </button>
              </div>
            </motion.div>
          ) : confirmed ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/[0.08]">
                <div className="h-2 w-2 rounded-full bg-neon-gold animate-pulse" />
                <p className="text-sm font-bold text-white">
                  Bet locked — {betAmount.toLocaleString()} $PICKS on{" "}
                  <span style={{ color: side === "A" ? scenario.outcomeA.color : scenario.outcomeB.color }}>
                    {side === "A" ? scenario.outcomeA.label : scenario.outcomeB.label}
                  </span>
                </p>
                <span className="text-xs text-white/40">Waiting for outcome…</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="slider"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-3xl mx-auto"
            >
              {/* Instruction */}
              <div className="text-center mb-3">
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  {side
                    ? `${betAmount.toLocaleString()} $PICKS on ${side === "A" ? scenario.outcomeA.label : scenario.outcomeB.label}`
                    : "Drag the line to pick a side and set your bet"
                  }
                </p>
              </div>

              {/* Slider Track */}
              <div
                ref={sliderRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative h-16 rounded-2xl bg-black/60 backdrop-blur-md border border-white/[0.08] cursor-grab active:cursor-grabbing overflow-hidden touch-none"
              >
                {/* Left fill */}
                <div
                  className="absolute top-0 left-0 bottom-0 rounded-l-2xl transition-all duration-75"
                  style={{
                    width: `${sliderPos * 100}%`,
                    background:
                      sliderPos < 0.45
                        ? `linear-gradient(90deg, ${scenario.outcomeA.color}30, ${scenario.outcomeA.color}10)`
                        : "transparent",
                  }}
                />
                {/* Right fill */}
                <div
                  className="absolute top-0 right-0 bottom-0 rounded-r-2xl transition-all duration-75"
                  style={{
                    width: `${(1 - sliderPos) * 100}%`,
                    background:
                      sliderPos > 0.55
                        ? `linear-gradient(270deg, ${scenario.outcomeB.color}30, ${scenario.outcomeB.color}10)`
                        : "transparent",
                  }}
                />

                {/* Labels on track */}
                <div className="absolute inset-0 flex items-center justify-between px-5 pointer-events-none">
                  <span
                    className="text-sm font-bold transition-opacity"
                    style={{
                      color: scenario.outcomeA.color,
                      opacity: sliderPos < 0.45 ? 1 : 0.3,
                    }}
                  >
                    {scenario.outcomeA.icon} {scenario.outcomeA.label}
                  </span>
                  <span
                    className="text-sm font-bold transition-opacity"
                    style={{
                      color: scenario.outcomeB.color,
                      opacity: sliderPos > 0.55 ? 1 : 0.3,
                    }}
                  >
                    {scenario.outcomeB.label} {scenario.outcomeB.icon}
                  </span>
                </div>

                {/* Draggable Line */}
                <motion.div
                  className="absolute top-0 bottom-0 w-1 -translate-x-1/2 pointer-events-none"
                  style={{ left: `${sliderPos * 100}%` }}
                  animate={{
                    backgroundColor:
                      side === "A"
                        ? scenario.outcomeA.color
                        : side === "B"
                          ? scenario.outcomeB.color
                          : "rgba(255,255,255,0.4)",
                    boxShadow:
                      side
                        ? `0 0 20px ${side === "A" ? scenario.outcomeA.color : scenario.outcomeB.color}60`
                        : "0 0 10px rgba(255,255,255,0.1)",
                  }}
                >
                  {/* Handle */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 flex items-center justify-center backdrop-blur-sm"
                    style={{
                      borderColor:
                        side === "A"
                          ? scenario.outcomeA.color
                          : side === "B"
                            ? scenario.outcomeB.color
                            : "rgba(255,255,255,0.3)",
                      background:
                        side === "A"
                          ? `${scenario.outcomeA.color}20`
                          : side === "B"
                            ? `${scenario.outcomeB.color}20`
                            : "rgba(0,0,0,0.5)",
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold text-white">
                      {side ? betAmount >= 1000 ? `${(betAmount / 1000).toFixed(1)}K` : betAmount : "—"}
                    </span>
                  </div>
                </motion.div>

                {/* Center dead zone indicator */}
                <div className="absolute top-0 bottom-0 left-[45%] w-[10%] pointer-events-none">
                  <div className="h-full border-l border-r border-dashed border-white/[0.06]" />
                </div>
              </div>

              {/* Confirm Button */}
              <div className="flex items-center justify-center mt-4 gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={!side}
                  className={`px-8 py-3 rounded-xl text-sm font-display font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                    side
                      ? "bg-neon-cyan text-studio-black hover:bg-neon-cyan/90 shadow-[0_0_30px_hsl(185_100%_55%/0.2)]"
                      : "bg-white/[0.04] text-white/30 cursor-not-allowed"
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  {side ? `Lock ${betAmount.toLocaleString()} $PICKS` : "Pick a Side"}
                </button>
                <span className="text-[10px] text-white/20 font-mono">min 333</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Info Strip (inside panel) ───────────────────────── */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-2 border-t border-white/[0.04] bg-black/40 backdrop-blur-sm">
              <div className="flex items-center gap-4 text-[10px] text-white/30 font-mono uppercase tracking-wider">
                <span>RealityPicks</span>
                <span className="text-neon-gold">The 333 Model</span>
                <span>$0.00333/token</span>
              </div>
              <div className="flex items-center gap-4 text-[10px] text-white/30 font-mono">
                <span>33.3% to community pool</span>
                <span className="hidden sm:inline">ESC to close</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(content, document.body)
    : content;
}
