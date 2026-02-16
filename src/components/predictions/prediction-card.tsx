"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { parseEther, type Address } from "viem";
import { createPrediction } from "@/lib/actions/predictions";
import { convertOddsToMultiplier } from "@/lib/scoring";
import { type ShowInfo } from "@/lib/shows";
import {
  usePicksBalance,
  usePicksAllowance,
  useApprovePicksToken,
  useMakePrediction,
  toBytes32,
  formatPicks,
  useIsContractsReady,
} from "@/lib/web3/hooks";
import { getContractAddress, isContractDeployed } from "@/lib/web3/contracts";
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
  const [isStaking, setIsStaking] = useState(false);

  // Web3 hooks
  const { address } = useAccount();
  const contractsReady = useIsContractsReady();
  const predictionEngineDeployed = isContractDeployed("PredictionEngine");

  let engineAddress: Address = "0x0" as Address;
  try {
    if (predictionEngineDeployed) engineAddress = getContractAddress("PredictionEngine");
  } catch {}

  const { data: balance } = usePicksBalance(address);
  const { data: allowance } = usePicksAllowance(address, engineAddress);
  const {
    approve,
    isPending: isApproving,
    isConfirming: isApproveConfirming,
  } = useApprovePicksToken();
  const {
    predict,
    hash: predictionTxHash,
    isPending: isPredicting,
    isConfirming: isPredictConfirming,
    isSuccess: isPredictSuccess,
  } = useMakePrediction();

  const stakeAmount = stakeInput ? parseEther(stakeInput) : 0n;
  const needsApproval =
    allowance !== undefined &&
    stakeAmount > 0n &&
    (allowance as bigint) < stakeAmount;
  const isOnChainProcessing =
    isApproving || isApproveConfirming || isPredicting || isPredictConfirming;

  const isLocked =
    question.status === "LOCKED" ||
    question.status === "RESOLVED" ||
    new Date() >= new Date(question.lockAt);
  const isResolved = question.status === "RESOLVED";
  const multiplier = convertOddsToMultiplier(question.odds);
  const potentialPts = Math.round(100 * multiplier * (isRisk ? 1.5 : 1));

  const handleSelect = (option: string) => {
    if (isLocked || isPending || isOnChainProcessing) return;
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

  const handlePick = () => {
    if (!selected || isLocked || isPending || isOnChainProcessing) return;

    // If user has stakeAmount and contracts are ready, do on-chain first
    if (stakeAmount > 0n && contractsReady && predictionEngineDeployed && address) {
      setIsStaking(true);

      if (needsApproval) {
        approve(engineAddress, stakeAmount);
        toast.info("Approve $PICKS spending in your wallet...");
        return;
      }

      // Get option index (1-based for contract)
      const optionIndex = question.options.indexOf(selected) + 1;
      const qId = toBytes32(question.id);
      predict(qId, optionIndex, stakeAmount, isRisk);
      toast.info("Confirm prediction in your wallet...");
      return;
    }

    // Save to database (free pick or no wallet connected)
    savePredictionToDb();
  };

  const savePredictionToDb = (txHash?: string) => {
    startTransition(async () => {
      const result = await createPrediction({
        questionId: question.id,
        chosenOption: selected,
        isRisk,
        useJoker,
        stakeAmount: stakeAmount > 0n ? stakeInput : undefined,
        txHash,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        setSaved(true);
        setIsStaking(false);
        const msg = stakeAmount > 0n
          ? `Pick locked with ${stakeInput} $PICKS!`
          : "Pick saved!";
        toast.success(msg, { duration: 2000 });
      }
    });
  };

  // When on-chain prediction succeeds, save to DB with tx hash
  if (isPredictSuccess && isStaking && predictionTxHash) {
    savePredictionToDb(predictionTxHash);
  }

  // Determine card variant
  const yesNo = isYesNoQuestion(question.options);
  const binary = isBinaryQuestion(question.options);

  // Card border color when resolved
  const resolvedBorder = isResolved && question.userPick
    ? question.userPick.isCorrect
      ? "border-neon-cyan/40"
      : "border-red-500/40"
    : "";

  const accentColor = show?.accent || "#a78bfa";
  const { isInMiniApp, composeCast } = useFarcaster();

  const handleShareOnFarcaster = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz";
    const showSlug = show?.slug || "survivor-2026";
    const resultText = isResolved && question.userPick
      ? question.userPick.isCorrect
        ? `I got it right on ${show?.shortName || "RealityPicks"}! +${question.userPick.pointsAwarded} pts`
        : `Tough break on ${show?.shortName || "RealityPicks"}, but I'm still in the game!`
      : `I just made my prediction on ${show?.shortName || "RealityPicks"}!`;
    await composeCast(
      `${resultText}\n\nMake your picks:`,
      [`${baseUrl}/frame/${showSlug}`]
    );
  };

  const canPick = selected && !isLocked && !isPending && !isOnChainProcessing && !saved;
  const hasStake = stakeAmount > 0n;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      className={`rounded-xl border bg-card/60 backdrop-blur-sm overflow-hidden transition-shadow duration-300 ${resolvedBorder || "border-white/[0.06]"} ${
        isResolved && question.userPick?.isCorrect
          ? "shadow-[0_0_20px_hsl(185_100%_55%/0.15)]"
          : ""
      }`}
    >
      {/* ── Show-colored accent bar at top of card ────────────────── */}
      {show && (
        <div
          className={`h-[3px] w-full bg-gradient-to-r ${show.headerGradient}`}
        />
      )}

      {/* ── Card Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {show && <span>{show.emoji}</span>}
          <span className="font-medium" style={{ color: show?.accent }}>
            {show?.shortName}
          </span>
          <span className="text-border">·</span>
          <span>Ep. {question.episodeNumber}</span>
          <span className="text-border">·</span>
          <span className="capitalize">
            {question.type.replace(/_/g, " ").toLowerCase()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {(isPending || isOnChainProcessing) && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          {saved && !isPending && !isResolved && (
            <Check className="h-3.5 w-3.5 text-neon-cyan" />
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

      {/* ── Staking Section (only when not locked/resolved and option selected) ── */}
      {!isLocked && !isResolved && !saved && selected && (
        <div className="px-4 pb-3">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {/* Stake Amount Input */}
              {address && contractsReady && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      Stake $PICKS
                    </span>
                    <span className="font-mono text-muted-foreground">
                      Bal: {formatPicks(balance as bigint | undefined)}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={stakeInput}
                      onChange={(e) => setStakeInput(e.target.value)}
                      placeholder="0"
                      min="0"
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-neon-cyan/40 focus:border-neon-cyan/30 transition-all font-mono"
                    />
                    <button
                      onClick={() => {
                        const bal = formatPicks(balance as bigint | undefined);
                        if (bal !== "0") setStakeInput(bal.replace(/,/g, ""));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neon-cyan/70 hover:text-neon-cyan transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  {/* Quick amount buttons */}
                  <div className="flex gap-1.5">
                    {QUICK_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setStakeInput(amt)}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all ${
                          stakeInput === amt
                            ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                            : "bg-white/[0.03] text-muted-foreground border border-white/[0.06] hover:bg-white/[0.06]"
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                  {!stakeInput && (
                    <p className="text-[10px] text-muted-foreground/60 text-center">
                      Optional — pick for free or stake $PICKS for on-chain rewards
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── Footer: Risk/Joker toggles + PICK button ──────────────── */}
      <div className="px-4 py-3 border-t border-white/[0.04]">
        {isResolved && question.userPick ? (
          /* Resolved footer */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              {question.userPick.isCorrect ? (
                <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30 text-xs">
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
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm">
                {question.userPick.pointsAwarded !== null
                  ? `+${question.userPick.pointsAwarded}`
                  : "—"}{" "}
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
          /* Already picked footer */
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20 text-xs">
                <Check className="h-3 w-3 mr-1" />
                Picked
              </Badge>
              {isRisk && (
                <Badge variant="outline" className="text-accent border-accent/30 text-xs">
                  Risk
                </Badge>
              )}
              {useJoker && (
                <Badge variant="outline" className="text-primary border-primary/30 text-xs">
                  Joker
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold" style={{ color: accentColor }}>
                {potentialPts} pts
              </span>
              {!isLocked && (
                <button
                  onClick={() => setSaved(false)}
                  className="text-[10px] text-muted-foreground hover:text-white transition-colors underline"
                >
                  Change
                </button>
              )}
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
        ) : (
          /* Active footer — PICK button */
          <div className="space-y-3">
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

            {/* ── PICK Button ─────────────────────────────────── */}
            <motion.button
              onClick={handlePick}
              disabled={!canPick}
              whileTap={canPick ? { scale: 0.97 } : undefined}
              className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                !selected
                  ? "bg-white/[0.03] text-muted-foreground/40 border border-white/[0.04] cursor-not-allowed"
                  : isOnChainProcessing || isPending
                  ? "bg-white/[0.06] text-muted-foreground cursor-wait border border-white/[0.08]"
                  : needsApproval && hasStake
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 active:bg-amber-500/40"
                  : hasStake
                  ? "bg-gradient-to-r from-neon-cyan/20 to-violet-500/20 text-white border border-neon-cyan/30 hover:from-neon-cyan/30 hover:to-violet-500/30 shadow-[0_0_20px_hsl(185_100%_55%/0.15)]"
                  : "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 hover:bg-neon-cyan/20 hover:border-neon-cyan/30"
              }`}
            >
              {isOnChainProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isApproving || isApproveConfirming
                    ? "Approving..."
                    : "Confirming on-chain..."}
                </>
              ) : isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : !selected ? (
                "Select an option above"
              ) : needsApproval && hasStake ? (
                <>
                  <Coins className="h-4 w-4" />
                  Approve {stakeInput} $PICKS
                </>
              ) : hasStake ? (
                <>
                  <Zap className="h-4 w-4" />
                  PICK &middot; Stake {stakeInput} $PICKS
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  PICK
                </>
              )}
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
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
        accentColor="#22d3ee"
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
                  ? "border border-neon-cyan/50 bg-neon-cyan/10"
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
            {/* Background percentage bar (animated) */}
            <motion.div
              className="absolute inset-y-0 left-0 rounded-lg"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.max((pct / Math.max(maxPct, 1)) * 100, 0)}%`,
              }}
              transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              style={{
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
                <Check className="h-4 w-4 text-neon-cyan" />
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
            ? "border-2 border-neon-cyan/60 bg-neon-cyan/10"
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
          <Check className="h-4 w-4 text-neon-cyan" />
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
