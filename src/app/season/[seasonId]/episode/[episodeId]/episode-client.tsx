"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { Countdown } from "@/components/ui/countdown";
import { ConnectWallet } from "@/components/web3/connect-wallet";
import { PredictionCard, type PredictionCardQuestion } from "@/components/predictions/prediction-card";
import type { CommunityPicks } from "@/lib/actions/predictions";
import {
  ArrowLeft,
  Shield,
} from "lucide-react";

type QuestionStatus = "DRAFT" | "OPEN" | "LOCKED" | "RESOLVED";

interface Question {
  id: string;
  type: string;
  prompt: string;
  odds: number;
  options: unknown;
  correctOption: string | null;
  status: QuestionStatus;
  sortOrder: number;
}

interface Episode {
  id: string;
  number: number;
  title: string;
  airAt: string;
  lockAt: string;
  status: string;
  season: { id: string; title: string };
  questions: Question[];
}

interface UserPrediction {
  chosenOption: string;
  isRisk: boolean;
  usedJoker: boolean;
  isCorrect: boolean | null;
  pointsAwarded: number | null;
}

export function EpisodeClient({
  episode,
  userPredictions,
  communityPicks = {},
  jokersRemaining,
  seasonId,
  referralCode,
  contestantImages = {},
}: {
  episode: Episode;
  userPredictions: Record<string, UserPrediction>;
  communityPicks?: CommunityPicks;
  jokersRemaining: number;
  seasonId: string;
  referralCode?: string | null;
  contestantImages?: Record<string, string>;
}) {
  const isLocked =
    episode.status === "LOCKED" ||
    episode.status === "RESOLVED" ||
    new Date() >= new Date(episode.lockAt);
  const isResolved = episode.status === "RESOLVED";

  // Convert questions to PredictionCardQuestion format
  const cardQuestions: PredictionCardQuestion[] = episode.questions
    .filter((q) => q.status !== "DRAFT")
    .map((q) => ({
      id: q.id,
      type: q.type,
      prompt: q.prompt,
      odds: q.odds,
      options: q.options as string[],
      correctOption: q.correctOption,
      status: q.status,
      episodeId: episode.id,
      episodeNumber: episode.number,
      episodeTitle: episode.title,
      lockAt: episode.lockAt,
      communityPicks: communityPicks[q.id] || {},
      userPick: userPredictions[q.id],
    }));

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              {episode.season.title}
            </p>
            <h1 className="text-xl font-bold truncate">
              Ep. {episode.number}: {episode.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ConnectWallet />
            <StatusChip status={episode.status as any} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {isLocked ? "Locked" : "Locks in"}
            </p>
            <Countdown targetDate={new Date(episode.lockAt)} />
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm">
              {jokersRemaining} Joker{jokersRemaining !== 1 ? "s" : ""} left
            </span>
          </div>
        </div>
      </div>

      {/* Prediction Cards */}
      <div className="space-y-3">
        {cardQuestions.map((q) => (
          <PredictionCard
            key={q.id}
            question={q}
            jokersRemaining={jokersRemaining}
            contestantImages={contestantImages}
          />
        ))}
      </div>

      {cardQuestions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No predictions available for this episode yet.
          </p>
        </div>
      )}
    </div>
  );
}
