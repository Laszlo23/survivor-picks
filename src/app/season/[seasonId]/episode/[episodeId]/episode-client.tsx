"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusChip } from "@/components/ui/status-chip";
import { Countdown } from "@/components/ui/countdown";
import { OddsPill } from "@/components/ui/odds-pill";
import { ShareButton } from "@/components/social/share-button";
import { PredictionStake } from "@/components/web3/prediction-stake";
import { ClaimRewards } from "@/components/web3/claim-rewards";
import { ConnectWallet } from "@/components/web3/connect-wallet";
import { createPrediction } from "@/lib/actions/predictions";
import { convertOddsToMultiplier } from "@/lib/scoring";
import { toast } from "sonner";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Wallet,
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
  jokersRemaining,
  seasonId,
  referralCode,
  contestantImages = {},
}: {
  episode: Episode;
  userPredictions: Record<string, UserPrediction>;
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
  const { isConnected } = useAccount();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {episode.season.title}
            </p>
            <h1 className="text-2xl font-bold">
              Episode {episode.number}: {episode.title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ConnectWallet />
            <StatusChip status={episode.status as any} />
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {isLocked ? "Locked" : "Locks in"}
            </p>
            <Countdown targetDate={new Date(episode.lockAt)} />
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm">
              {jokersRemaining} Joker{jokersRemaining !== 1 ? "s" : ""} remaining
            </span>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {episode.questions.map((question) => (
          <QuestionCard
            key={question.id}
            question={question}
            prediction={userPredictions[question.id]}
            isLocked={isLocked}
            isResolved={isResolved}
            jokersRemaining={jokersRemaining}
            seasonId={seasonId}
            referralCode={referralCode}
            episodeNumber={episode.number}
            episodeTitle={episode.title}
            contestantImages={contestantImages}
          />
        ))}
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  prediction,
  isLocked,
  isResolved,
  jokersRemaining,
  seasonId,
  referralCode,
  episodeNumber,
  episodeTitle,
  contestantImages = {},
}: {
  question: Question;
  prediction?: UserPrediction;
  isLocked: boolean;
  isResolved: boolean;
  jokersRemaining: number;
  seasonId: string;
  referralCode?: string | null;
  episodeNumber: number;
  episodeTitle: string;
  contestantImages?: Record<string, string>;
}) {
  const [selected, setSelected] = useState<string>(
    prediction?.chosenOption || ""
  );
  const [isRisk, setIsRisk] = useState(prediction?.isRisk || false);
  const [useJoker, setUseJoker] = useState(prediction?.usedJoker || false);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(!!prediction);

  const options = question.options as string[];
  const multiplier = convertOddsToMultiplier(question.odds);

  const handleSubmit = () => {
    if (!selected) return;
    startTransition(async () => {
      const result = await createPrediction({
        questionId: question.id,
        chosenOption: selected,
        isRisk,
        useJoker,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Pick saved!");
        setSaved(true);
      }
    });
  };

  const typeLabel = question.type.replace(/_/g, " ");

  return (
    <Card
      className={`bg-card/50 border-border/50 ${
        isResolved && prediction
          ? prediction.isCorrect
            ? "border-emerald-500/30"
            : "border-destructive/30"
          : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="text-xs capitalize bg-secondary/50"
          >
            {typeLabel}
          </Badge>
          <OddsPill odds={question.odds} />
        </div>
        <CardTitle className="text-base mt-2">{question.prompt}</CardTitle>
        <p className="text-xs text-muted-foreground">
          Multiplier: {multiplier}x
          {isRisk && (
            <span className="text-accent"> × 1.5 Risk</span>
          )}
          {isRisk && (
            <span className="text-muted-foreground">
              {" "}
              = {Math.round(100 * multiplier * 1.5)} pts if correct
            </span>
          )}
          {!isRisk && (
            <span className="text-muted-foreground">
              {" "}
              = {Math.round(100 * multiplier)} pts if correct
            </span>
          )}
        </p>
      </CardHeader>
      <CardContent>
        {/* Options Grid */}
        <div className="grid gap-2 mb-4 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = selected === option;
            const isCorrectOption =
              isResolved && question.correctOption === option;
            const isUserWrongPick =
              isResolved && prediction?.chosenOption === option && !prediction.isCorrect;

            return (
              <button
                key={option}
                onClick={() => !isLocked && setSelected(option)}
                disabled={isLocked}
                className={`relative rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                  isCorrectOption
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : isUserWrongPick
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 hover:border-border hover:bg-secondary/30"
                } ${isLocked ? "cursor-default" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3">
                  {contestantImages[option] && (
                    <img
                      src={contestantImages[option]}
                      alt={option}
                      className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <span className="font-medium">{option}</span>
                </div>
                {isCorrectOption && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                )}
                {isUserWrongPick && (
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                )}
              </button>
            );
          })}
        </div>

        {/* Risk + Joker controls */}
        {!isLocked && (
          <div className="flex flex-wrap items-center gap-6 border-t border-border/30 pt-4">
            <div className="flex items-center gap-2">
              <Switch
                id={`risk-${question.id}`}
                checked={isRisk}
                onCheckedChange={(v) => {
                  setIsRisk(v);
                  if (v) setUseJoker(false);
                }}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor={`risk-${question.id}`}
                    className="flex items-center gap-1 cursor-pointer text-sm"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 text-accent" />
                    Risk Bet
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">
                    1.5x multiplier if correct, but 0 points if wrong. Joker
                    cannot save a risk bet.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id={`joker-${question.id}`}
                checked={useJoker}
                onCheckedChange={(v) => {
                  setUseJoker(v);
                  if (v) setIsRisk(false);
                }}
                disabled={jokersRemaining <= 0 || isRisk}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor={`joker-${question.id}`}
                    className="flex items-center gap-1 cursor-pointer text-sm"
                  >
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    Immunity Joker ({jokersRemaining})
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-[200px]">
                    If your pick is wrong, you still get 100 base points.
                    Cannot be used with Risk Bet.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {saved && (
                <ShareButton
                  shareType="prediction"
                  shareData={{
                    referralCode,
                    questionPrompt: question.prompt,
                    chosenOption: selected,
                    episodeNumber,
                    episodeTitle,
                  }}
                  taskKey="share_prediction"
                  seasonId={seasonId}
                  metadata={{ questionId: question.id }}
                  variant="ghost"
                  size="sm"
                  label="Share Pick"
                />
              )}
              <Button
                onClick={handleSubmit}
                disabled={!selected || isPending}
                size="sm"
                className="gap-2"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : saved ? (
                  <Check className="h-3.5 w-3.5" />
                ) : null}
                {saved ? "Update Pick" : "Confirm Pick"}
              </Button>
            </div>
          </div>
        )}

        {/* On-Chain Stake Section (shown after off-chain pick is saved) */}
        {saved && !isLocked && (
          <div className="border-t border-border/30 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">On-Chain Stake (Optional)</span>
            </div>
            <PredictionStake
              questionId={question.id}
              selectedOption={options.indexOf(selected) + 1}
              isRisk={isRisk}
            />
          </div>
        )}

        {/* Resolved result */}
        {isResolved && prediction && (
          <div className="border-t border-border/30 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {prediction.isCorrect ? (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Correct
                  </Badge>
                ) : (
                  <Badge className="bg-destructive/20 text-destructive border-destructive/30">
                    Wrong
                  </Badge>
                )}
                {prediction.usedJoker && (
                  <Badge variant="outline" className="text-primary border-primary/30">
                    Joker Used
                  </Badge>
                )}
                {prediction.isRisk && (
                  <Badge variant="outline" className="text-accent border-accent/30">
                    Risk Bet
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <ShareButton
                  shareType={prediction.isCorrect ? "result_win" : "result_loss"}
                  shareData={{
                    referralCode,
                    pointsEarned: prediction.pointsAwarded ?? 0,
                    episodeNumber,
                    episodeTitle,
                    questionPrompt: question.prompt,
                    chosenOption: prediction.chosenOption,
                  }}
                  taskKey="share_result"
                  seasonId={seasonId}
                  metadata={{ questionId: question.id, isCorrect: prediction.isCorrect }}
                  variant="ghost"
                  size="sm"
                  label={prediction.isCorrect ? "Share Win" : "Share"}
                />
                <span className="font-mono font-bold text-lg">
                  {prediction.pointsAwarded !== null
                    ? `+${prediction.pointsAwarded}`
                    : "—"}{" "}
                  <span className="text-xs text-muted-foreground">pts</span>
                </span>
              </div>
            </div>

            {/* On-Chain Claim Rewards */}
            <div className="mt-4">
              <ClaimRewards questionId={question.id} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
