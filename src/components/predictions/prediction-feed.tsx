"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShowTabs } from "@/components/shows/show-tabs";
import {
  PredictionCard,
  type PredictionCardQuestion,
} from "@/components/predictions/prediction-card";
import { LIVE_SHOWS, getShowBySlug, getDefaultShow } from "@/lib/shows";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Zap,
  Trophy,
  Target,
} from "lucide-react";
import { convertOddsToMultiplier } from "@/lib/scoring";

// ─── Types ───────────────────────────────────────────────────────────

interface ShowFeedData {
  showSlug: string;
  seasonId: string;
  questions: PredictionCardQuestion[];
}

interface PredictionFeedProps {
  feeds: ShowFeedData[];
  jokersRemaining: number;
  contestantImages?: Record<string, string>;
  seasonId?: string;
  internalBalance?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getTimeUntilLock(lockAt: string): string {
  const diff = new Date(lockAt).getTime() - Date.now();
  if (diff <= 0) return "Locked";
  const hours = Math.floor(diff / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ─── Episode Command Center ──────────────────────────────────────────

function EpisodeCommandCenter({
  questions,
  showEmoji,
}: {
  questions: PredictionCardQuestion[];
  showEmoji?: string;
}) {
  if (questions.length === 0) return null;

  const ep = questions[0];
  const locked = questions.filter((q) => q.userPick).length;
  const open = questions.filter(
    (q) =>
      !q.userPick &&
      q.status !== "RESOLVED" &&
      q.status !== "LOCKED" &&
      new Date() < new Date(q.lockAt)
  ).length;
  const resolved = questions.filter((q) => q.status === "RESOLVED").length;
  const total = questions.length;
  const progressPct = total > 0 ? (locked / total) * 100 : 0;
  const allLocked = locked === total && total > 0;

  const potentialReward = questions.reduce((sum, q) => {
    const mult = convertOddsToMultiplier(q.odds);
    const risk = q.userPick?.isRisk ? 1.5 : 1;
    return sum + Math.round(100 * mult * risk);
  }, 0);

  const timeLeft = getTimeUntilLock(ep.lockAt);
  const isTimeLocked =
    ep.status === "LOCKED" || new Date() >= new Date(ep.lockAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4"
    >
      {/* Status banner when user already has picks */}
      {locked > 0 && !allLocked && (
        <div className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-neon-cyan/5 border border-neon-cyan/20 mb-3">
          <CheckCircle className="h-4 w-4 text-neon-cyan shrink-0" />
          <p className="text-xs text-neon-cyan">
            You already made your picks for EP{ep.episodeNumber}. You can still change until the episode locks.
          </p>
        </div>
      )}

      {/* Episode header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {showEmoji && <span className="text-lg">{showEmoji}</span>}
          <div>
            <p className="text-sm font-display font-semibold leading-tight">
              EP {ep.episodeNumber} — {ep.episodeTitle}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {allLocked
                ? "All picks locked"
                : `${open} question${open !== 1 ? "s" : ""} still open`}
            </p>
          </div>
        </div>
        {!isTimeLocked && (
          <span className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-white/[0.04] border border-white/[0.08] px-2 py-1 rounded-md">
            <Clock className="h-3 w-3 text-neon-cyan" />
            {timeLeft}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            {locked} / {total} picks completed
          </span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <div className="w-full bg-secondary/50 rounded-full h-1.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className={`h-1.5 rounded-full ${
              allLocked ? "bg-neon-cyan" : "bg-neon-cyan/60"
            }`}
          />
        </div>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap items-center gap-2">
        {locked > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neon-cyan bg-neon-cyan/5 border border-neon-cyan/15 px-2 py-1 rounded-md">
            <CheckCircle className="h-3 w-3" />
            {locked} locked in
          </span>
        )}
        {open > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/5 border border-amber-400/15 px-2 py-1 rounded-md">
            <Target className="h-3 w-3" />
            {open} open
          </span>
        )}
        {resolved > 0 && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-white/40 bg-white/[0.03] border border-white/[0.06] px-2 py-1 rounded-md">
            <Trophy className="h-3 w-3" />
            {resolved} resolved
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-mono font-bold text-neon-cyan">
          <Zap className="h-3 w-3" />
          {potentialReward.toLocaleString("en-US")} possible points
        </span>
      </div>
    </motion.div>
  );
}

// ─── Component ───────────────────────────────────────────────────────

export function PredictionFeed({
  feeds,
  jokersRemaining,
  contestantImages = {},
  seasonId,
  internalBalance,
}: PredictionFeedProps) {
  const parsedBalance = internalBalance ? BigInt(internalBalance) : undefined;
  const feedSlugs = new Set(feeds.map((f) => f.showSlug));
  const availableShows = LIVE_SHOWS.filter((s) => feedSlugs.has(s.slug));
  const defaultSlug = availableShows[0]?.slug || getDefaultShow().slug;
  const [activeSlug, setActiveSlug] = useState(defaultSlug);
  const feedRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const focusEpisodeId = searchParams.get("episode");
  const [highlighted, setHighlighted] = useState(false);

  const currentFeed = feeds.find((f) => f.showSlug === activeSlug);
  const currentShow = getShowBySlug(activeSlug);
  const questions = currentFeed?.questions || [];

  useEffect(() => {
    if (focusEpisodeId && feedRef.current) {
      const timer = setTimeout(() => {
        feedRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setHighlighted(true);
        setTimeout(() => setHighlighted(false), 2000);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [focusEpisodeId]);

  return (
    <div
      ref={feedRef}
      className={`space-y-4 scroll-mt-20 transition-all duration-500 ${
        highlighted
          ? "ring-1 ring-neon-cyan/20 rounded-2xl shadow-[0_0_30px_hsl(185_100%_55%/0.06)]"
          : ""
      }`}
    >
      <ShowTabs
        shows={LIVE_SHOWS.filter((s) => s.hasData)}
        activeSlug={activeSlug}
        onSelect={setActiveSlug}
      />

      <AnimatePresence mode="wait">
        {questions.length > 0 ? (
          <motion.div
            key={activeSlug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Episode Command Center */}
            <EpisodeCommandCenter
              questions={questions}
              showEmoji={currentShow?.emoji}
            />

            {/* Atmospheric show vibe header */}
            {currentShow && (
              <Link
                href={
                  seasonId && questions[0]
                    ? `/season/${seasonId}/episode/${questions[0].episodeId}`
                    : "/dashboard"
                }
                className="flex items-center gap-2.5 px-1 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {currentShow.emoji}
                </span>
                <p className="text-xs text-muted-foreground italic leading-relaxed group-hover:text-foreground transition-colors">
                  {currentShow.vibeText}
                </p>
                <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}

            {/* Prediction cards with staggered entrance */}
            {questions.map((q, i) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.06,
                  ease: [0.25, 0.4, 0.25, 1],
                }}
              >
                <PredictionCard
                  question={q}
                  show={currentShow}
                  jokersRemaining={jokersRemaining}
                  contestantImages={contestantImages}
                  internalBalance={parsedBalance}
                />
              </motion.div>
            ))}

            {seasonId && questions[0] && (
              <Link
                href={`/season/${seasonId}/episode/${questions[0].episodeId}`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-2 text-muted-foreground hover:text-foreground"
                >
                  View All Episode Details
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            key={`empty-${activeSlug}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <FadeIn>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl mb-4 animate-float"
                  style={{
                    background: currentShow
                      ? `linear-gradient(135deg, ${currentShow.accent}15, ${currentShow.accent}05)`
                      : "rgba(255,255,255,0.03)",
                    border: currentShow
                      ? `1px solid ${currentShow.accent}20`
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-3xl">
                    {currentShow?.emoji || "\uD83D\uDCFA"}
                  </span>
                </div>
                <h3 className="text-lg font-display font-semibold mb-1">
                  {currentShow?.emptyTitle || "No predictions available"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {currentShow?.emptyDescription ||
                    "Select a show to see available predictions."}
                </p>
              </div>
            </FadeIn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
