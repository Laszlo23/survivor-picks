"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Share2,
  Coins,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Trophy,
  Flame,
  Target,
  Hourglass,
  Pencil,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { useFarcaster } from "@/lib/farcaster/provider";

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
  internalBalance?: bigint;
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

const QUICK_AMOUNTS = ["10", "50", "100", "500"];

// ─── Main Component ──────────────────────────────────────────────────

export function PredictionCard({
  question,
  show,
  jokersRemaining,
  contestantImages = {},
  internalBalance,
}: PredictionCardProps) {
  const [selected, setSelected] = useState<string>(
    question.userPick?.chosenOption || ""
  );
  const [isRisk, setIsRisk] = useState(question.userPick?.isRisk || false);
  const [useJoker, setUseJoker] = useState(
    question.userPick?.usedJoker || false
  );
  const [stakeInput, setStakeInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(!!question.userPick);
  const [justLocked, setJustLocked] = useState(false);
  const [showXpAnim, setShowXpAnim] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);

  const stakeAmount = stakeInput ? BigInt(Math.floor(parseFloat(stakeInput) || 0)) : 0n;

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
  };

  const handleToggleRisk = (v: boolean) => {
    setIsRisk(v);
    if (v) setUseJoker(false);
  };

  const handleToggleJoker = (v: boolean) => {
    setUseJoker(v);
    if (v) setIsRisk(false);
  };

  const useInternalStaking =
    internalBalance !== undefined && internalBalance > 0n;

  const handlePick = () => {
    if (!selected || isLocked || isPending) return;
    savePredictionToDb();
  };  const savePredictionToDb = () => {
    startTransition(async () => {
      const result = await createPrediction({
        questionId: question.id,
        chosenOption: selected,
        isRisk,
        useJoker,
        stakeAmount: stakeAmount > 0n ? stakeInput : undefined,
        useInternalBalance: useInternalStaking && stakeAmount > 0n,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        setSaved(true);
        setJustLocked(true);
        setShowXpAnim(true);
        setTimeout(() => setJustLocked(false), 1200);
        setTimeout(() => setShowXpAnim(false), 1500);
        const msg =
          stakeAmount > 0n
            ? `Pick locked with ${stakeInput} $PICKS!`
            : "Pick saved!";
        toast.success(msg, { duration: 2000 });
      }
    });
  };

  const yesNo = isYesNoQuestion(question.options);
  const binary = isBinaryQuestion(question.options);

  const resolvedBorder =
    isResolved && question.userPick
      ? question.userPick.isCorrect
        ? "border-neon-cyan/40"
        : "border-red-500/40"
      : "";

  const accentColor = show?.accent || "#a78bfa";
  const { isInMiniApp, composeCast } = useFarcaster();

  const handleShareOnFarcaster = async () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz";
    const showSlug = show?.slug || "reality-picks";
    const resultText =
      isResolved && question.userPick
        ? question.userPick.isCorrect
          ? `I got it right on ${show?.shortName || "RealityPicks"}! +${question.userPick.pointsAwarded} pts`
          : `Tough break on ${show?.shortName || "RealityPicks"}, but I'm still in the game!`
        : `I just made my prediction on ${show?.shortName || "RealityPicks"}!`;
    await composeCast(`${resultText}\n\nMake your picks:`, [
      `${baseUrl}/frame/${showSlug}`,
    ]);
  };

  const canPick =
    selected && !isLocked && !isPending && !saved;
  const hasStake = stakeAmount > 0n;

  const showStaking = useInternalStaking;
  const displayBalance = Number(internalBalance ?? 0).toLocaleString();

  const communityEntries = Object.entries(question.communityPicks);
  const hotPick =
    communityEntries.length > 0
      ? communityEntries.reduce((a, b) => (b[1] > a[1] ? b : a))
      : null;
  const hasHotPick = hotPick && hotPick[1] >= 60;
  const contrarianOptions =
    question.options.length >= 3
      ? communityEntries.filter(([, pct]) => pct > 0 && pct <= 15)
      : [];

  const isLockedNoAction = isLocked && !isResolved && !saved;

  // ─── Shared staking section (rendered inline after selected tile) ──
  const stakingSection =
    !isLocked && !isResolved && !saved && selected ? (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3"
        >
          {showStaking && (
            <div className="rounded-xl border border-white/[0.08] bg-studio-dark/60 backdrop-blur-sm p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5 font-headline uppercase tracking-wider text-[10px]">
                  <Coins className="h-3.5 w-3.5 text-neon-gold" />
                  Stake $PICKS
                </span>
                <span className="font-mono text-muted-foreground text-[10px]">
                  Bal: {displayBalance}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={stakeInput}
                  onChange={(e) => setStakeInput(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2.5 bg-black/30 border border-white/[0.08] rounded-lg text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-neon-gold/40 focus:border-neon-gold/30 transition-all font-mono"
                />
                <button
                  onClick={() => {
                    const bal = Number(internalBalance ?? 0).toString();
                    if (bal !== "0") setStakeInput(bal);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neon-gold/70 hover:text-neon-gold transition-colors uppercase tracking-wider"
                >
                  MAX
                </button>
              </div>
              <div className="flex gap-1.5">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setStakeInput(amt)}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold font-headline tracking-wider transition-all ${
                      stakeInput === amt
                        ? "bg-neon-gold/20 text-neon-gold border border-neon-gold/30 shadow-[0_0_10px_hsl(45_100%_55%/0.15)]"
                        : "bg-white/[0.03] text-muted-foreground border border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
              {!stakeInput && (
                <p className="text-[10px] text-muted-foreground/50 text-center">
                  Optional — pick for free or stake $PICKS for extra rewards
                </p>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    ) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      className={`relative rounded-2xl border overflow-hidden transition-shadow duration-300 ${resolvedBorder || "border-white/[0.06]"} ${
        isResolved && question.userPick?.isCorrect
          ? "shadow-[0_0_30px_hsl(185_100%_55%/0.2)]"
          : ""
      } ${justLocked ? "animate-lock-in-glow" : ""} ${isLockedNoAction ? "opacity-60 grayscale-[30%]" : ""}`}
      style={{ background: "linear-gradient(180deg, hsl(220 15% 6%) 0%, hsl(220 12% 4%) 100%)" }}
    >
      {/* XP floating animation on lock-in */}
      <AnimatePresence>
        {showXpAnim && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute top-2 right-4 z-50 font-mono font-bold text-sm text-neon-cyan pointer-events-none"
          >
            +{potentialPts} XP
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── Scanline overlay on the card ────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(185 100% 55% / 0.06) 2px, hsl(185 100% 55% / 0.06) 4px)",
        }}
      />

      {/* ── Broadcast-style header bar ─────────────────────────── */}
      <div
        className="relative z-20 px-4 py-3"
        style={{
          background: show?.headerGradient
            ? undefined
            : "linear-gradient(90deg, hsl(220 15% 8%) 0%, hsl(220 12% 6%) 100%)",
        }}
      >
        <div
          className={`absolute inset-0 bg-gradient-to-r opacity-20 ${show?.headerGradient || "from-neon-cyan/20 to-transparent"}`}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            {show && (
              <span className="text-lg">{show.emoji}</span>
            )}
            <div>
              <span
                className="font-headline text-sm font-bold uppercase tracking-wider"
                style={{ color: show?.accent }}
              >
                {show?.shortName || "RealityPicks"}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span>EP {question.episodeNumber}</span>
                <span className="text-white/20">|</span>
                <span className="uppercase">
                  {question.type.replace(/_/g, " ").toLowerCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPending && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
            {saved && !isPending && !isResolved && (
              <Check className="h-4 w-4 text-neon-cyan" />
            )}
            {!isLocked ? (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono bg-white/[0.04] px-2 py-1 rounded-md">
                <Clock className="h-3 w-3" />
                {getTimeUntilLock(question.lockAt)}
              </span>
            ) : isLockedNoAction ? (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-mono bg-white/[0.03] px-2 py-1 rounded-md">
                <Hourglass className="h-3 w-3" />
                Awaiting results
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60 font-mono bg-white/[0.03] px-2 py-1 rounded-md">
                <Lock className="h-3 w-3" />
                LOCKED
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Accent divider ──────────────────────────────────────── */}
      {show && (
        <div
          className={`h-[2px] w-full bg-gradient-to-r ${show.headerGradient} opacity-60`}
        />
      )}

      {/* ── Question Prompt (broadcast style) ───────────────────── */}
      <div className="relative z-20 px-4 pt-4 pb-2">
        <p className="font-headline text-base md:text-lg font-bold leading-snug tracking-tight uppercase">
          {question.prompt}
        </p>

        {/* Hot Pick / Contrarian tags */}
        {!isResolved && (hasHotPick || contrarianOptions.length > 0) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {hasHotPick && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-0.5 rounded-full">
                <Flame className="h-3 w-3" />
                Hot Pick: {hotPick[0]}
              </span>
            )}
            {contrarianOptions.map(([opt]) => (
              <span
                key={opt}
                className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded-full"
              >
                <Target className="h-3 w-3" />
                Contrarian: {opt}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Options ───────────────────────────────────────────────── */}
      <div className="relative z-20">
        {yesNo ? (
          <BroadcastYesNo
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
          <BroadcastBinary
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
          <BroadcastGrid
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
      </div>

      {/* ── Inline staking ──────────────────────────────────────── */}
      {stakingSection && (
        <div className="relative z-20 px-4 pb-1">{stakingSection}</div>
      )}

      {/* ── Footer: Risk/Joker toggles + LOCK IN button ─────────── */}
      <div className="relative z-20 px-4 py-3 border-t border-white/[0.04]">
        {isResolved && question.userPick ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {question.userPick.isCorrect ? (
                <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 text-xs font-headline uppercase tracking-wider">
                  <Trophy className="h-3 w-3 mr-1" />
                  Correct
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs font-headline uppercase tracking-wider">
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
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm">
                {question.userPick.pointsAwarded !== null
                  ? `+${question.userPick.pointsAwarded}`
                  : "\u2014"}{" "}
                <span className="text-xs text-muted-foreground">pts</span>
              </span>
              {isInMiniApp && (
                <button
                  onClick={handleShareOnFarcaster}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                  title="Share on Farcaster"
                >
                  <Share2 className="h-3.5 w-3.5 text-muted-foreground hover:text-white" />
                </button>
              )}
            </div>
          </motion.div>
        ) : saved ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Badge className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20 text-xs font-headline uppercase tracking-wider">
                    <Check className="h-3 w-3 mr-1" />
                    Locked In
                  </Badge>
                </motion.div>
                {isRisk && (
                  <Badge
                    variant="outline"
                    className="text-accent border-accent/30 text-xs"
                  >
                    1.5x Risk
                  </Badge>
                )}
                {useJoker && (
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/30 text-xs"
                  >
                    Joker
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: accentColor }}
                >
                  {potentialPts} pts
                </span>
                {isInMiniApp && (
                  <button
                    onClick={handleShareOnFarcaster}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                    title="Share on Farcaster"
                  >
                    <Share2 className="h-3.5 w-3.5 text-muted-foreground hover:text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Action buttons */}
            {!isLocked && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSaved(false)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-muted-foreground bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  Edit Pick
                </button>
                {!isRisk && (
                  <button
                    onClick={() => {
                      setSaved(false);
                      setIsRisk(true);
                      setUseJoker(false);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-accent/70 bg-accent/5 border border-accent/10 hover:bg-accent/10 hover:text-accent transition-colors"
                  >
                    <AlertTriangle className="h-3 w-3" />
                    Go Risk
                  </button>
                )}
                <button
                  onClick={() => setShowCommunity(!showCommunity)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                    showCommunity
                      ? "text-neon-cyan bg-neon-cyan/10 border border-neon-cyan/20"
                      : "text-muted-foreground bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <BarChart3 className="h-3 w-3" />
                  Community
                </button>
              </div>
            )}

            {/* Community breakdown */}
            <AnimatePresence>
              {showCommunity && Object.keys(question.communityPicks).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 space-y-1.5">
                    <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold">
                      Community Picks
                    </p>
                    {Object.entries(question.communityPicks)
                      .sort(([, a], [, b]) => b - a)
                      .map(([option, pct]) => (
                        <div key={option} className="flex items-center gap-2">
                          <span className="text-[10px] text-white/70 truncate flex-1 min-w-0">
                            {option}
                            {option === selected && (
                              <span className="text-neon-cyan ml-1">← You</span>
                            )}
                          </span>
                          <div className="w-20 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-neon-cyan/40"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
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
                            {isRisk ? "1.5x Risk" : "Risk"}
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-[200px]">
                            1.5x multiplier if correct, 0 if wrong. Joker cannot save a risk bet.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

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
                            Wrong pick still earns 100 pts. {jokersRemaining}{" "}
                            left.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </>
                )}
              </div>

              <div className="text-right flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded cursor-help"
                      style={{ color: accentColor }}
                    >
                      {multiplier}x
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-[200px]">
                      Based on {question.odds >= 0 ? "+" : ""}{question.odds} odds. Higher multiplier = harder pick = bigger reward.
                    </p>
                  </TooltipContent>
                </Tooltip>
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: accentColor }}
                >
                  {potentialPts} pts
                </span>
              </div>
            </div>

            {/* ── LOCK IN Button (broadcast style) ─────────────── */}
            <motion.button
              onClick={handlePick}
              disabled={!canPick}
              whileTap={canPick ? { scale: 0.97 } : undefined}
              className={`w-full py-3.5 rounded-xl font-headline font-bold text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${
                !selected
                  ? "bg-white/[0.03] text-muted-foreground/40 border border-white/[0.04] cursor-not-allowed"
                  : isPending
                    ? "bg-white/[0.06] text-muted-foreground cursor-wait border border-white/[0.08]"
                    : hasStake
                        ? "bg-gradient-to-r from-neon-gold/20 via-amber-500/20 to-neon-gold/20 text-white border border-neon-gold/40 hover:from-neon-gold/30 hover:to-neon-gold/30 shadow-[0_0_25px_hsl(45_100%_55%/0.2)]"
                        : "bg-gradient-to-r from-neon-cyan/15 to-neon-cyan/10 text-neon-cyan border border-neon-cyan/25 hover:from-neon-cyan/25 hover:to-neon-cyan/20 hover:border-neon-cyan/40 shadow-[0_0_15px_hsl(185_100%_55%/0.1)]"
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : !selected ? (
                "Select a contestant"
              ) : hasStake ? (
                <>
                  <Zap className="h-4 w-4" />
                  Lock In &middot; {stakeInput} $PICKS
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Lock In
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ── ContestantTile (broadcast TV tile with large avatar + vote bar) ──
// ═══════════════════════════════════════════════════════════════════════

interface ContestantTileProps {
  option: string;
  pct: number;
  image?: string;
  isSelected: boolean;
  isCorrect: boolean;
  isUserWrong: boolean;
  isLocked: boolean;
  isResolved: boolean;
  accentColor: string;
  compact?: boolean;
  onSelect: () => void;
}

function ContestantTile({
  option,
  pct,
  image,
  isSelected,
  isCorrect,
  isUserWrong,
  isLocked,
  isResolved,
  accentColor,
  compact = false,
  onSelect,
}: ContestantTileProps) {
  const avatarSize = compact
    ? "h-14 w-14 md:h-16 md:w-16"
    : "h-[72px] w-[72px] md:h-20 md:w-20";
  const ringSize = compact ? "ring-[2px]" : "ring-[3px]";

  const ringColor = isCorrect
    ? "ring-neon-cyan"
    : isUserWrong
      ? "ring-red-500"
      : isSelected
        ? ""
        : "ring-white/10";

  const glowShadow = isCorrect
    ? "0 0 20px hsl(185 100% 55% / 0.4), 0 0 40px hsl(185 100% 55% / 0.15)"
    : isUserWrong
      ? "0 0 20px hsl(0 80% 50% / 0.3)"
      : isSelected
        ? `0 0 20px ${accentColor}40, 0 0 40px ${accentColor}15`
        : "none";

  return (
    <motion.button
      onClick={onSelect}
      disabled={isLocked}
      whileTap={!isLocked ? { scale: 0.95 } : undefined}
      className={`relative flex flex-col items-center gap-2 rounded-2xl p-3 md:p-4 transition-all ${
        isCorrect
          ? "bg-neon-cyan/[0.08]"
          : isUserWrong
            ? "bg-red-500/[0.08]"
            : isSelected
              ? "bg-white/[0.06]"
              : "bg-white/[0.02] hover:bg-white/[0.05]"
      } ${isLocked ? "cursor-default" : "cursor-pointer"}`}
    >
      {/* Avatar with glow ring */}
      <div className="relative">
        <div
          className={`${avatarSize} rounded-full ${ringSize} ${ringColor} overflow-hidden transition-all duration-300`}
          style={{
            boxShadow: glowShadow,
            ...(isSelected && !isCorrect && !isUserWrong
              ? { ringColor: accentColor, ["--tw-ring-color" as string]: accentColor }
              : {}),
          }}
        >
          {image ? (
            <img
              src={image}
              alt={option}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center rounded-full font-headline font-bold text-lg md:text-xl"
              style={{
                backgroundColor: isSelected
                  ? `${accentColor}25`
                  : "hsl(220 12% 12%)",
                color: isSelected ? accentColor : "hsl(150 5% 60%)",
              }}
            >
              {option
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
        </div>

        {/* Correct crown overlay */}
        {isCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-neon-cyan rounded-full p-1 shadow-[0_0_10px_hsl(185_100%_55%/0.5)]"
          >
            <Trophy className="h-3 w-3 text-black" />
          </motion.div>
        )}
        {isUserWrong && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
          >
            <X className="h-3 w-3 text-white" />
          </motion.div>
        )}
      </div>

      {/* Name chyron (lower-third bar) */}
      <div
        className={`w-full rounded-lg px-2 py-1 text-center ${
          isSelected
            ? "bg-white/[0.08]"
            : "bg-white/[0.03]"
        }`}
      >
        <span className="text-[11px] md:text-xs font-semibold truncate block leading-tight">
          {option}
        </span>
      </div>

      {/* Big percentage */}
      <span
        className={`font-headline font-bold tabular-nums leading-none ${
          compact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
        }`}
        style={{
          color: isCorrect
            ? "hsl(185 100% 55%)"
            : isUserWrong
              ? "hsl(0 80% 60%)"
              : isSelected
                ? accentColor
                : "hsl(150 5% 50%)",
        }}
      >
        {pct > 0 ? `${pct}%` : "\u2014"}
      </span>

      {/* Vote indicator (thumbs up when selected) */}
      {!isResolved && (
        <div className="flex items-center gap-1 mt-0.5">
          {isSelected ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColor,
                boxShadow: `0 0 10px ${accentColor}25`,
              }}
            >
              <ThumbsUp className="h-3 w-3" />
              Picked
            </motion.div>
          ) : (
            <span className="text-[10px] text-muted-foreground/40 uppercase tracking-wider">
              Tap to choose
            </span>
          )}
        </div>
      )}
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ── Broadcast Yes/No (large glowing panels) ─────────────────────────
// ═══════════════════════════════════════════════════════════════════════

function BroadcastYesNo({
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
  const yesOption =
    options.find((o) => o.toLowerCase() === "yes") || options[0];
  const noOption =
    options.find((o) => o.toLowerCase() === "no") || options[1];
  const yesPct = communityPicks[yesOption] || 0;
  const noPct = communityPicks[noOption] || 0;

  const yesCorrect = isResolved && correctOption === yesOption;
  const noCorrect = isResolved && correctOption === noOption;
  const yesUserWrong =
    isResolved &&
    userPick?.chosenOption === yesOption &&
    !userPick.isCorrect;
  const noUserWrong =
    isResolved &&
    userPick?.chosenOption === noOption &&
    !userPick.isCorrect;

  return (
    <div className="grid grid-cols-2 gap-3 px-4 pb-3">
      {/* YES Panel */}
      <motion.button
        onClick={() => onSelect(yesOption)}
        disabled={isLocked}
        whileTap={!isLocked ? { scale: 0.96 } : undefined}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl p-5 min-h-[140px] transition-all overflow-hidden ${
          yesCorrect
            ? "border-2 border-neon-cyan/60"
            : yesUserWrong
              ? "border-2 border-red-500/60"
              : selected === yesOption
                ? "border-2 border-emerald-400/50"
                : "border-2 border-white/[0.06] hover:border-emerald-400/30"
        } ${isLocked ? "cursor-default" : "cursor-pointer"}`}
        style={{
          background: yesCorrect
            ? "linear-gradient(180deg, hsl(185 80% 20% / 0.2) 0%, hsl(185 60% 10% / 0.1) 100%)"
            : selected === yesOption
              ? "linear-gradient(180deg, hsl(160 70% 20% / 0.2) 0%, hsl(160 50% 10% / 0.1) 100%)"
              : "linear-gradient(180deg, hsl(160 30% 12% / 0.15) 0%, transparent 100%)",
          boxShadow:
            selected === yesOption
              ? "0 0 25px hsl(160 80% 50% / 0.15), inset 0 1px 0 hsl(160 80% 50% / 0.1)"
              : yesCorrect
                ? "0 0 25px hsl(185 100% 55% / 0.2)"
                : "none",
        }}
      >
        {/* Background glow */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            selected === yesOption ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(circle at 50% 30%, hsl(160 80% 50% / 0.08), transparent 70%)",
          }}
        />

        <ThumbsUp
          className={`relative h-8 w-8 transition-colors ${
            yesCorrect
              ? "text-neon-cyan"
              : selected === yesOption
                ? "text-emerald-400"
                : "text-emerald-400/40"
          }`}
        />
        <span
          className={`relative font-headline text-2xl md:text-3xl font-bold tracking-wider ${
            yesCorrect
              ? "text-neon-cyan"
              : selected === yesOption
                ? "text-emerald-300"
                : "text-emerald-400/60"
          }`}
        >
          YES
        </span>
        <span
          className={`relative font-headline text-3xl md:text-4xl font-bold tabular-nums leading-none ${
            yesCorrect
              ? "text-neon-cyan"
              : selected === yesOption
                ? "text-white"
                : "text-muted-foreground"
          }`}
        >
          {yesPct > 0 ? `${yesPct}%` : "\u2014"}
        </span>

        {yesCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2"
          >
            <Trophy className="h-5 w-5 text-neon-cyan" />
          </motion.div>
        )}
        {yesUserWrong && (
          <div className="absolute top-2 right-2">
            <X className="h-5 w-5 text-red-400" />
          </div>
        )}
      </motion.button>

      {/* NO Panel */}
      <motion.button
        onClick={() => onSelect(noOption)}
        disabled={isLocked}
        whileTap={!isLocked ? { scale: 0.96 } : undefined}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl p-5 min-h-[140px] transition-all overflow-hidden ${
          noCorrect
            ? "border-2 border-neon-cyan/60"
            : noUserWrong
              ? "border-2 border-red-500/60"
              : selected === noOption
                ? "border-2 border-red-400/50"
                : "border-2 border-white/[0.06] hover:border-red-400/30"
        } ${isLocked ? "cursor-default" : "cursor-pointer"}`}
        style={{
          background: noCorrect
            ? "linear-gradient(180deg, hsl(185 80% 20% / 0.2) 0%, hsl(185 60% 10% / 0.1) 100%)"
            : selected === noOption
              ? "linear-gradient(180deg, hsl(0 70% 20% / 0.2) 0%, hsl(0 50% 10% / 0.1) 100%)"
              : "linear-gradient(180deg, hsl(0 30% 12% / 0.15) 0%, transparent 100%)",
          boxShadow:
            selected === noOption
              ? "0 0 25px hsl(0 80% 50% / 0.15), inset 0 1px 0 hsl(0 80% 50% / 0.1)"
              : noCorrect
                ? "0 0 25px hsl(185 100% 55% / 0.2)"
                : "none",
        }}
      >
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${
            selected === noOption ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background:
              "radial-gradient(circle at 50% 30%, hsl(0 80% 50% / 0.08), transparent 70%)",
          }}
        />

        <ThumbsDown
          className={`relative h-8 w-8 transition-colors ${
            noCorrect
              ? "text-neon-cyan"
              : selected === noOption
                ? "text-red-400"
                : "text-red-400/40"
          }`}
        />
        <span
          className={`relative font-headline text-2xl md:text-3xl font-bold tracking-wider ${
            noCorrect
              ? "text-neon-cyan"
              : selected === noOption
                ? "text-red-300"
                : "text-red-400/60"
          }`}
        >
          NO
        </span>
        <span
          className={`relative font-headline text-3xl md:text-4xl font-bold tabular-nums leading-none ${
            noCorrect
              ? "text-neon-cyan"
              : selected === noOption
                ? "text-white"
                : "text-muted-foreground"
          }`}
        >
          {noPct > 0 ? `${noPct}%` : "\u2014"}
        </span>

        {noCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2"
          >
            <Trophy className="h-5 w-5 text-neon-cyan" />
          </motion.div>
        )}
        {noUserWrong && (
          <div className="absolute top-2 right-2">
            <X className="h-5 w-5 text-red-400" />
          </div>
        )}
      </motion.button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ── Broadcast Binary (2 contestant tiles side-by-side) ──────────────
// ═══════════════════════════════════════════════════════════════════════

function BroadcastBinary({
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

  return (
    <div className="px-4 pb-3">
      <div className="grid grid-cols-2 gap-3">
        {[a, b].map((option) => (
          <ContestantTile
            key={option}
            option={option}
            pct={communityPicks[option] || 0}
            image={contestantImages[option]}
            isSelected={selected === option}
            isCorrect={isResolved && correctOption === option}
            isUserWrong={
              isResolved &&
              userPick?.chosenOption === option &&
              !(userPick?.isCorrect ?? true)
            }
            isLocked={isLocked}
            isResolved={isResolved}
            accentColor={accentColor}
            onSelect={() => onSelect(option)}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// ── Broadcast Grid (3+ contestants in responsive grid) ──────────────
// ═══════════════════════════════════════════════════════════════════════

function BroadcastGrid({
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
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, 6);

  return (
    <div className="px-4 pb-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {visible.map((option) => (
          <ContestantTile
            key={option}
            option={option}
            pct={communityPicks[option] || 0}
            image={contestantImages[option]}
            isSelected={selected === option}
            isCorrect={isResolved && correctOption === option}
            isUserWrong={
              isResolved &&
              userPick?.chosenOption === option &&
              !(userPick?.isCorrect ?? true)
            }
            isLocked={isLocked}
            isResolved={isResolved}
            accentColor={accentColor}
            compact
            onSelect={() => onSelect(option)}
          />
        ))}
      </div>
      {options.length > 6 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-2.5 w-full py-2 rounded-xl text-xs font-headline uppercase tracking-wider text-muted-foreground hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
        >
          Show all {options.length} contestants
        </button>
      )}
    </div>
  );
}
