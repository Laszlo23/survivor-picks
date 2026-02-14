"use client";

import { useState } from "react";
import Link from "next/link";
import { ShowTabs } from "@/components/shows/show-tabs";
import {
  PredictionCard,
  type PredictionCardQuestion,
} from "@/components/predictions/prediction-card";
import { LIVE_SHOWS, getShowBySlug, getDefaultShow } from "@/lib/shows";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tv } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────

interface ShowFeedData {
  showSlug: string;
  seasonId: string;
  questions: PredictionCardQuestion[];
}

interface PredictionFeedProps {
  /** Feed data per show (keyed by show slug) */
  feeds: ShowFeedData[];
  jokersRemaining: number;
  contestantImages?: Record<string, string>;
  /** Season ID for linking to episodes */
  seasonId?: string;
}

// ─── Component ───────────────────────────────────────────────────────

export function PredictionFeed({
  feeds,
  jokersRemaining,
  contestantImages = {},
  seasonId,
}: PredictionFeedProps) {
  // Determine available shows (only those with feed data, plus all live shows for navigation)
  const feedSlugs = new Set(feeds.map((f) => f.showSlug));
  const availableShows = LIVE_SHOWS.filter((s) => feedSlugs.has(s.slug));

  // Default to first show with data, or first live show
  const defaultSlug =
    availableShows[0]?.slug || getDefaultShow().slug;
  const [activeSlug, setActiveSlug] = useState(defaultSlug);

  // Get current feed
  const currentFeed = feeds.find((f) => f.showSlug === activeSlug);
  const currentShow = getShowBySlug(activeSlug);
  const questions = currentFeed?.questions || [];

  return (
    <div className="space-y-4">
      {/* Show Tab Bar */}
      <ShowTabs
        shows={LIVE_SHOWS}
        activeSlug={activeSlug}
        onSelect={setActiveSlug}
      />

      {/* Prediction Cards */}
      {questions.length > 0 ? (
        <div className="space-y-3">
          {questions.map((q) => (
            <PredictionCard
              key={q.id}
              question={q}
              show={currentShow}
              jokersRemaining={jokersRemaining}
              contestantImages={contestantImages}
            />
          ))}

          {/* Link to episode detail */}
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
        </div>
      ) : (
        /* Empty state for selected show */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.03] mb-4">
            <Tv className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {currentShow
              ? `No predictions for ${currentShow.shortName} yet`
              : "No predictions available"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {currentShow
              ? `${currentShow.name} predictions will appear here when a new episode opens.`
              : "Select a show to see available predictions."}
          </p>
        </div>
      )}
    </div>
  );
}
