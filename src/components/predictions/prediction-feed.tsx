"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShowTabs } from "@/components/shows/show-tabs";
import {
  PredictionCard,
  type PredictionCardQuestion,
} from "@/components/predictions/prediction-card";
import { LIVE_SHOWS, getShowBySlug, getDefaultShow } from "@/lib/shows";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion";
import { ArrowRight } from "lucide-react";

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
}

// ─── Component ───────────────────────────────────────────────────────

export function PredictionFeed({
  feeds,
  jokersRemaining,
  contestantImages = {},
  seasonId,
}: PredictionFeedProps) {
  const feedSlugs = new Set(feeds.map((f) => f.showSlug));
  const availableShows = LIVE_SHOWS.filter((s) => feedSlugs.has(s.slug));
  const defaultSlug = availableShows[0]?.slug || getDefaultShow().slug;
  const [activeSlug, setActiveSlug] = useState(defaultSlug);

  const currentFeed = feeds.find((f) => f.showSlug === activeSlug);
  const currentShow = getShowBySlug(activeSlug);
  const questions = currentFeed?.questions || [];

  return (
    <div className="space-y-4">
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
            {/* ── Atmospheric show vibe header (clickable to episode) ── */}
            {currentShow && (
              <Link
                href={
                  seasonId && questions[0]
                    ? `/season/${seasonId}/episode/${questions[0].episodeId}`
                    : "/dashboard"
                }
                className="flex items-center gap-2.5 px-1 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{currentShow.emoji}</span>
                <p className="text-xs text-muted-foreground italic leading-relaxed group-hover:text-foreground transition-colors">
                  {currentShow.vibeText}
                </p>
                <ArrowRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}

            {questions.map((q) => (
              <PredictionCard
                key={q.id}
                question={q}
                show={currentShow}
                jokersRemaining={jokersRemaining}
                contestantImages={contestantImages}
              />
            ))}

            {seasonId && questions[0] && (
              <Link href={`/season/${seasonId}/episode/${questions[0].episodeId}`}>
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
