"use client";

import { useState, useTransition } from "react";
import { createPrediction } from "@/lib/actions/predictions";
import { convertOddsToMultiplier } from "@/lib/scoring";
import { type ShowInfo } from "@/lib/shows";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertTriangle,
  Shield,
  Check,
  X,
  Loader2,
  Clock,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────

export interface PredictionCardQuestion {
  id: string;
  type: string;
  prompt: string;
  odds: number;
  options: string[];
  correctOption: string | null;
  status: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  lockAt: string;
  communityPicks: Record<string, number>;
  userPick?: {
    chosenOption: string;
    isRisk: boolean;
    usedJoker: boolean;
    isCorrect: boolean | null;
    pointsAwarded: number | null;
  };
}

interface PredictionCardProps {
  question: PredictionCardQuestion;
  show?: ShowInfo;
  jokersRemaining: number;
  contestantImages?: Record<string, string>;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getTimeUntilLock(lockAt: string): string {
  const diff = new Date(lockAt).getTime() - Date.now();
  if (diff <= 0) return "Locked";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function isBinaryQuestion(options: string[]): boolean {
  return options.length === 2;
}

function isYesNoQuestion(options: string[]): boolean {
  if (options.length !== 2) return false;
  const lower = options.map((o) => o.toLowerCase().trim());
  return (
    (lower.includes("yes") && lower.includes("no")) ||
    (lower.includes("true") && lower.includes("false"))
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function PredictionCard({
  question,
  show,
  jokersRemaining,
  contestantImages = {},
}: PredictionCardProps) {
  const [selected, setSelected] = useState<string>(
    question.userPick?.chosenOption || ""
  );
  const [isRisk, setIsRisk] = useState(question.userPick?.isRisk || false);
  const [useJoker, setUseJoker] = useState(
    question.userPick?.usedJoker || false
  );
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(!!question.userPick);

  const isLocked =
    question.status === "LOCKED" ||
    question.status === "RESOLVED" ||
    new Date() >= new Date(question.lockAt);
  const isResolved = question.status === "RESOLVED";
  const multiplier = convertOddsToMultiplier(question.odds);
  const potentialPts = Math.round(100 * multiplier * (isRisk ? 1.5 : 1));

  const handleSelect = (option: string) => {
    if (isLocked || isPending) return;
    setSelected(option);
    // Auto-save on selection
    startTransition(async () => {
      const result = await createPrediction({
        questionId: question.id,
        chosenOption: option,
        isRisk,
        useJoker,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        setSaved(true);
        toast.success("Pick saved!", { duration: 1500 });
      }
    });
  };

  const handleToggleRisk = (v: boolean) => {
    setIsRisk(v);
    if (v) setUseJoker(false);
    // Re-save if already saved
    if (saved && selected) {
      startTransition(async () => {
        await createPrediction({
          questionId: question.id,
          chosenOption: selected,
          isRisk: v,
          useJoker: v ? false : useJoker,
        });
      });
    }
  };

  const handleToggleJoker = (v: boolean) => {
    setUseJoker(v);
    if (v) setIsRisk(false);
    if (saved && selected) {
      startTransition(async () => {
        await createPrediction({
          questionId: question.id,
          chosenOption: selected,
          isRisk: v ? false : isRisk,
          useJoker: v,
        });
      });
    }
  };

  // Determine card variant
  const yesNo = isYesNoQuestion(question.options);
  const binary = isBinaryQuestion(question.options);

  // Card border color when resolved
  const resolvedBorder = isResolved && question.userPick
    ? question.userPick.isCorrect
      ? "border-emerald-500/40"
      : "border-red-500/40"
    : "";

  const accentColor = show?.accent || "#a78bfa";

  return (
    <div
      className={`rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden transition-all ${resolvedBorder || "border-border/40"}`}
    >
      {/* ── Card Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {show && <span>{show.emoji}</span>}
          <span>Ep. {question.episodeNumber}</span>
          <span className="text-border">|</span>
          <span className="capitalize">
            {question.type.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isPending && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          {saved && !isPending && !isResolved && (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          )}
          {!isLocked ? (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {getTimeUntilLock(question.lockAt)}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          )}
        </div>
      </div>

      {/* ── Question Prompt ───────────────────────────────────────── */}
      <div className="px-4 pb-3">
        <p className="text-sm font-semibold leading-snug">{question.prompt}</p>
      </div>

      {/* ── Options ───────────────────────────────────────────────── */}
      {yesNo ? (
        <YesNoOptions
          options={question.options}
          selected={selected}
          communityPicks={question.communityPicks}
          correctOption={question.correctOption}
          userPick={question.userPick}
          isLocked={isLocked}
          isResolved={isResolved}
          accentColor={accentColor}
          onSelect={handleSelect}
        />
      ) : binary ? (
        <BinaryOptions
          options={question.options}
          selected={selected}
          communityPicks={question.communityPicks}
          correctOption={question.correctOption}
          userPick={question.userPick}
          isLocked={isLocked}
          isResolved={isResolved}
          accentColor={accentColor}
          contestantImages={contestantImages}
          onSelect={handleSelect}
        />
      ) : (
        <MultiOptions
          options={question.options}
          selected={selected}
          communityPicks={question.communityPicks}
          correctOption={question.correctOption}
          userPick={question.userPick}
          isLocked={isLocked}
          isResolved={isResolved}
          accentColor={accentColor}
          contestantImages={contestantImages}
          onSelect={handleSelect}
        />
      )}

      {/* ── Footer: Points + Risk/Joker ───────────────────────────── */}
      <div className="px-4 py-3 border-t border-border/20">
        {isResolved && question.userPick ? (
          /* Resolved footer */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {question.userPick.isCorrect ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                  Correct
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                  Wrong
                </Badge>
              )}
              {question.userPick.usedJoker && (
                <Badge
                  variant="outline"
                  className="text-primary border-primary/30 text-xs"
                >
                  Joker
                </Badge>
              )}
              {question.userPick.isRisk && (
                <Badge
                  variant="outline"
                  className="text-accent border-accent/30 text-xs"
                >
                  Risk
                </Badge>
              )}
            </div>
            <span className="font-mono font-bold text-sm">
              {question.userPick.pointsAwarded !== null
                ? `+${question.userPick.pointsAwarded}`
                : "—"}{" "}
              <span className="text-xs text-muted-foreground">pts</span>
            </span>
          </div>
        ) : (
          /* Active footer */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Risk toggle */}
              {!isLocked && (
                <>
                  <div className="flex items-center gap-1.5">
                    <Switch
                      id={`risk-${question.id}`}
                      checked={isRisk}
                      onCheckedChange={handleToggleRisk}
                      className="scale-75 origin-left"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label
                          htmlFor={`risk-${question.id}`}
                          className="flex items-center gap-1 cursor-pointer text-xs"
                        >
                          <AlertTriangle className="h-3 w-3 text-accent" />
                          Risk
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[180px]">
                          1.5x if correct, 0 if wrong. No joker save.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Joker toggle */}
                  <div className="flex items-center gap-1.5">
                    <Switch
                      id={`joker-${question.id}`}
                      checked={useJoker}
                      onCheckedChange={handleToggleJoker}
                      disabled={jokersRemaining <= 0 || isRisk}
                      className="scale-75 origin-left"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Label
                          htmlFor={`joker-${question.id}`}
                          className="flex items-center gap-1 cursor-pointer text-xs"
                        >
                          <Shield className="h-3 w-3 text-primary" />
                          <span>{jokersRemaining}</span>
                        </Label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs max-w-[180px]">
                          Wrong pick still earns 100 pts. {jokersRemaining} left.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </>
              )}
            </div>

            {/* Points potential */}
            <div className="text-right">
              <span className="text-xs text-muted-foreground">
                {question.odds >= 0 ? "+" : ""}
                {question.odds}
              </span>
              <span className="ml-2 font-mono text-xs font-bold" style={{ color: accentColor }}>
                {potentialPts} pts
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Yes / No Variant ────────────────────────────────────────────────

function YesNoOptions({
  options,
  selected,
  communityPicks,
  correctOption,
  userPick,
  isLocked,
  isResolved,
  accentColor,
  onSelect,
}: {
  options: string[];
  selected: string;
  communityPicks: Record<string, number>;
  correctOption: string | null;
  userPick?: PredictionCardQuestion["userPick"];
  isLocked: boolean;
  isResolved: boolean;
  accentColor: string;
  onSelect: (option: string) => void;
}) {
  const yesOption = options.find((o) => o.toLowerCase() === "yes") || options[0];
  const noOption = options.find((o) => o.toLowerCase() === "no") || options[1];
  const yesPct = communityPicks[yesOption] || 0;
  const noPct = communityPicks[noOption] || 0;

  return (
    <div className="grid grid-cols-2 gap-2 px-4 pb-3">
      <OptionButton
        option={yesOption}
        label="YES"
        pct={yesPct}
        isSelected={selected === yesOption}
        isCorrect={isResolved && correctOption === yesOption}
        isUserWrong={
          isResolved &&
          userPick?.chosenOption === yesOption &&
          !userPick.isCorrect
        }
        isLocked={isLocked}
        accentColor="#34d399"
        onClick={() => onSelect(yesOption)}
      />
      <OptionButton
        option={noOption}
        label="NO"
        pct={noPct}
        isSelected={selected === noOption}
        isCorrect={isResolved && correctOption === noOption}
        isUserWrong={
          isResolved &&
          userPick?.chosenOption === noOption &&
          !userPick.isCorrect
        }
        isLocked={isLocked}
        accentColor="#f87171"
        onClick={() => onSelect(noOption)}
      />
    </div>
  );
}

// ─── Binary (A vs B) Variant ─────────────────────────────────────────

function BinaryOptions({
  options,
  selected,
  communityPicks,
  correctOption,
  userPick,
  isLocked,
  isResolved,
  accentColor,
  contestantImages,
  onSelect,
}: {
  options: string[];
  selected: string;
  communityPicks: Record<string, number>;
  correctOption: string | null;
  userPick?: PredictionCardQuestion["userPick"];
  isLocked: boolean;
  isResolved: boolean;
  accentColor: string;
  contestantImages: Record<string, string>;
  onSelect: (option: string) => void;
}) {
  const [a, b] = options;
  const aPct = communityPicks[a] || 0;
  const bPct = communityPicks[b] || 0;

  return (
    <div className="px-4 pb-3">
      <div className="grid grid-cols-2 gap-2">
        <OptionButton
          option={a}
          pct={aPct}
          image={contestantImages[a]}
          isSelected={selected === a}
          isCorrect={isResolved && correctOption === a}
          isUserWrong={
            isResolved && userPick?.chosenOption === a && !userPick.isCorrect
          }
          isLocked={isLocked}
          accentColor={accentColor}
          onClick={() => onSelect(a)}
        />
        <OptionButton
          option={b}
          pct={bPct}
          image={contestantImages[b]}
          isSelected={selected === b}
          isCorrect={isResolved && correctOption === b}
          isUserWrong={
            isResolved && userPick?.chosenOption === b && !userPick.isCorrect
          }
          isLocked={isLocked}
          accentColor={accentColor}
          onClick={() => onSelect(b)}
        />
      </div>
    </div>
  );
}

// ─── Multi-Option Variant (3+ options) ───────────────────────────────

function MultiOptions({
  options,
  selected,
  communityPicks,
  correctOption,
  userPick,
  isLocked,
  isResolved,
  accentColor,
  contestantImages,
  onSelect,
}: {
  options: string[];
  selected: string;
  communityPicks: Record<string, number>;
  correctOption: string | null;
  userPick?: PredictionCardQuestion["userPick"];
  isLocked: boolean;
  isResolved: boolean;
  accentColor: string;
  contestantImages: Record<string, string>;
  onSelect: (option: string) => void;
}) {
  // Show max 6, then "show all" (TODO: expand)
  const visible = options.slice(0, 6);
  const maxPct = Math.max(...options.map((o) => communityPicks[o] || 0), 1);

  return (
    <div className="px-4 pb-3 space-y-1.5">
      {visible.map((option) => {
        const pct = communityPicks[option] || 0;
        const isSelected = selected === option;
        const isCorrectOption = isResolved && correctOption === option;
        const isUserWrong =
          isResolved &&
          userPick?.chosenOption === option &&
          !userPick.isCorrect;

        return (
          <button
            key={option}
            onClick={() => onSelect(option)}
            disabled={isLocked}
            className={`
              relative w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all overflow-hidden
              ${
                isCorrectOption
                  ? "border border-emerald-500/50 bg-emerald-500/10"
                  : isUserWrong
                  ? "border border-red-500/50 bg-red-500/10"
                  : isSelected
                  ? "border bg-white/[0.06]"
                  : "border border-transparent bg-white/[0.03] hover:bg-white/[0.06]"
              }
              ${isLocked ? "cursor-default" : "cursor-pointer active:scale-[0.98]"}
            `}
            style={
              isSelected && !isResolved
                ? { borderColor: `${accentColor}60` }
                : undefined
            }
          >
            {/* Background percentage bar */}
            <div
              className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
              style={{
                width: `${Math.max((pct / Math.max(maxPct, 1)) * 100, 0)}%`,
                backgroundColor: isSelected
                  ? `${accentColor}15`
                  : "rgba(255,255,255,0.02)",
              }}
            />

            {/* Content */}
            <div className="relative flex items-center gap-3 flex-1 min-w-0">
              {contestantImages[option] && (
                <img
                  src={contestantImages[option]}
                  alt={option}
                  className="h-7 w-7 rounded-full object-cover shrink-0"
                />
              )}
              <span className="font-medium truncate">{option}</span>
            </div>

            {/* Percentage */}
            <div className="relative flex items-center gap-2 shrink-0">
              {pct > 0 && (
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: isSelected ? accentColor : undefined }}
                >
                  {pct}%
                </span>
              )}
              {isCorrectOption && (
                <Check className="h-4 w-4 text-emerald-400" />
              )}
              {isUserWrong && <X className="h-4 w-4 text-red-400" />}
              {isSelected && !isResolved && (
                <Check className="h-4 w-4" style={{ color: accentColor }} />
              )}
            </div>
          </button>
        );
      })}
      {options.length > 6 && (
        <p className="text-center text-xs text-muted-foreground py-1">
          +{options.length - 6} more options
        </p>
      )}
    </div>
  );
}

// ─── Shared Option Button (for binary/yesno) ─────────────────────────

function OptionButton({
  option,
  label,
  pct,
  image,
  isSelected,
  isCorrect,
  isUserWrong,
  isLocked,
  accentColor,
  onClick,
}: {
  option: string;
  label?: string;
  pct: number;
  image?: string;
  isSelected: boolean;
  isCorrect: boolean;
  isUserWrong: boolean;
  isLocked: boolean;
  accentColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative flex flex-col items-center justify-center gap-1 rounded-xl p-4 min-h-[80px] transition-all
        ${
          isCorrect
            ? "border-2 border-emerald-500/60 bg-emerald-500/10"
            : isUserWrong
            ? "border-2 border-red-500/60 bg-red-500/10"
            : isSelected
            ? "border-2 bg-white/[0.06]"
            : "border-2 border-transparent bg-white/[0.03] hover:bg-white/[0.06]"
        }
        ${isLocked ? "cursor-default" : "cursor-pointer active:scale-[0.96]"}
      `}
      style={
        isSelected && !isCorrect && !isUserWrong
          ? { borderColor: `${accentColor}80` }
          : undefined
      }
    >
      {/* Avatar or initials */}
      {image ? (
        <img
          src={image}
          alt={option}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
          style={{
            backgroundColor: isSelected
              ? `${accentColor}25`
              : "rgba(255,255,255,0.06)",
            color: isSelected ? accentColor : undefined,
          }}
        >
          {(label || option).slice(0, 3).toUpperCase()}
        </div>
      )}

      {/* Percentage */}
      <span
        className="text-xl font-bold tabular-nums"
        style={{ color: isSelected ? accentColor : undefined }}
      >
        {pct > 0 ? `${pct}%` : "—"}
      </span>

      {/* Label */}
      <span className="text-xs text-muted-foreground truncate max-w-full">
        {label || option}
      </span>

      {/* Result indicator */}
      {isCorrect && (
        <div className="absolute top-2 right-2">
          <Check className="h-4 w-4 text-emerald-400" />
        </div>
      )}
      {isUserWrong && (
        <div className="absolute top-2 right-2">
          <X className="h-4 w-4 text-red-400" />
        </div>
      )}
      {isSelected && !isCorrect && !isUserWrong && (
        <div className="absolute top-2 right-2">
          <Check className="h-4 w-4" style={{ color: accentColor }} />
        </div>
      )}
    </button>
  );
}
