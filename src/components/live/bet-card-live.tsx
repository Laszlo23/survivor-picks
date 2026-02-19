"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Zap,
  Lock,
  Trophy,
  Coins,
  Check,
  X,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LiveBetData {
  id: string;
  prompt: string;
  category: string;
  options: string[];
  odds: Record<string, number>;
  status: string;
  correctOption: string | null;
  opensAt: string;
  locksAt: string;
  resolvedAt: string | null;
  multiplier: number;
  totalPool: string;
  placements: Array<{
    userId: string;
    chosenOption: string;
    stakeAmount: string;
  }>;
}

interface BetCardLiveProps {
  bet: LiveBetData;
  userId: string;
  onPlaceBet: (betId: string, option: string, amount: string) => void;
}

// ─── Category config ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  string,
  { label: string; icon: typeof Zap; color: string; glow: string }
> = {
  flash: {
    label: "FLASH",
    icon: Zap,
    color: "text-amber-400",
    glow: "shadow-[0_0_15px_hsl(45_100%_55%/0.4)]",
  },
  challenge: {
    label: "CHALLENGE",
    icon: Trophy,
    color: "text-neon-cyan",
    glow: "shadow-[0_0_15px_hsl(185_100%_55%/0.3)]",
  },
  elimination: {
    label: "ELIMINATION",
    icon: X,
    color: "text-red-400",
    glow: "shadow-[0_0_15px_hsl(0_80%_55%/0.3)]",
  },
  drama: {
    label: "DRAMA",
    icon: Zap,
    color: "text-pink-400",
    glow: "shadow-[0_0_15px_hsl(320_100%_60%/0.3)]",
  },
  prop: {
    label: "PROP BET",
    icon: Coins,
    color: "text-emerald-400",
    glow: "shadow-[0_0_15px_hsl(160_80%_55%/0.3)]",
  },
};

// ─── Countdown hook ──────────────────────────────────────────────────────────

function useCountdown(targetDate: string) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(diff / 1000)));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  return {
    remaining,
    display: remaining > 60 ? `${mins}m ${secs}s` : `${secs}s`,
    progress:
      remaining > 0
        ? remaining /
          ((new Date(targetDate).getTime() - new Date().getTime()) / 1000 +
            remaining)
        : 0,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BetCardLive({ bet, userId, onPlaceBet }: BetCardLiveProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState("100");
  const [showStake, setShowStake] = useState(false);

  const countdown = useCountdown(bet.locksAt);
  const catConfig = CATEGORY_CONFIG[bet.category] || CATEGORY_CONFIG.prop;
  const CatIcon = catConfig.icon;

  const isResolved = bet.status === "resolved";
  const isLocked = bet.status === "locked" || countdown.remaining === 0;
  const isOpen = bet.status === "open" && countdown.remaining > 0;

  // User's placement
  const userPlacement = bet.placements.find((p) => p.userId === userId);
  const hasPlaced = !!userPlacement;

  // Pool distribution for progress bars
  const totalPool = parseFloat(bet.totalPool) || 0;
  const optionShares = useMemo(() => {
    const shares: Record<string, number> = {};
    for (const opt of bet.options) {
      const optPool = bet.placements
        .filter((p) => p.chosenOption === opt)
        .reduce((s, p) => s + (parseFloat(p.stakeAmount) || 0), 0);
      shares[opt] = totalPool > 0 ? optPool / totalPool : 1 / bet.options.length;
    }
    return shares;
  }, [bet.options, bet.placements, totalPool]);

  const handleOptionClick = (option: string) => {
    if (!isOpen || hasPlaced) return;
    setSelectedOption(option);
    setShowStake(true);
  };

  const handlePlace = () => {
    if (!selectedOption) return;
    onPlaceBet(bet.id, selectedOption, stakeAmount);
    setShowStake(false);
  };

  const stakePresets = ["50", "100", "500", "1000"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`
        relative rounded-xl overflow-hidden
        bg-gradient-to-br from-[#0c0c14] to-[#08080e]
        border border-white/[0.06]
        ${bet.category === "flash" ? "animate-pulse-neon" : ""}
        ${catConfig.glow}
      `}
    >
      {/* ── Header bar ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <CatIcon className={`h-3.5 w-3.5 ${catConfig.color}`} />
          <span
            className={`text-[10px] font-bold font-headline uppercase tracking-widest ${catConfig.color}`}
          >
            {catConfig.label}
          </span>
          {bet.multiplier > 1 && (
            <span className="text-[10px] font-bold text-neon-gold bg-neon-gold/10 rounded px-1.5 py-0.5">
              {bet.multiplier}x MULTI
            </span>
          )}
        </div>

        {/* Countdown / Status */}
        {isOpen && (
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-white/40" />
            <span
              className={`text-xs font-headline font-bold tabular-nums ${
                countdown.remaining < 15
                  ? "text-red-400 animate-pulse"
                  : "text-white/60"
              }`}
            >
              {countdown.display}
            </span>
          </div>
        )}
        {isLocked && !isResolved && (
          <div className="flex items-center gap-1 text-white/30">
            <Lock className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase">Locked</span>
          </div>
        )}
        {isResolved && (
          <div className="flex items-center gap-1 text-emerald-400">
            <Check className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase">Resolved</span>
          </div>
        )}
      </div>

      {/* ── Prompt ────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-sm md:text-base font-headline font-semibold text-white/90 leading-tight">
          {bet.prompt}
        </p>
      </div>

      {/* ── Options ───────────────────────────────────────────────── */}
      <div className="px-4 pb-3 space-y-2">
        {bet.options.map((option) => {
          const odds = bet.odds[option] || 2;
          const share = optionShares[option] || 0;
          const isSelected = selectedOption === option;
          const isUserPick = userPlacement?.chosenOption === option;
          const isCorrect = isResolved && bet.correctOption === option;
          const isWrong =
            isResolved && isUserPick && bet.correctOption !== option;

          return (
            <motion.button
              key={option}
              onClick={() => handleOptionClick(option)}
              disabled={!isOpen || hasPlaced}
              whileTap={isOpen && !hasPlaced ? { scale: 0.98 } : {}}
              className={`
                relative w-full flex items-center justify-between rounded-lg px-4 py-3
                transition-all duration-200 overflow-hidden
                ${
                  isCorrect
                    ? "border-2 border-emerald-400/50 bg-emerald-500/10"
                    : isWrong
                    ? "border-2 border-red-400/30 bg-red-500/5"
                    : isSelected
                    ? "border-2 border-neon-cyan/50 bg-neon-cyan/5"
                    : isUserPick
                    ? "border-2 border-neon-gold/30 bg-neon-gold/5"
                    : "border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }
                ${!isOpen || hasPlaced ? "cursor-default" : "cursor-pointer"}
              `}
            >
              {/* Pool distribution bar */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                  isCorrect
                    ? "bg-emerald-500/10"
                    : isSelected
                    ? "bg-neon-cyan/5"
                    : "bg-white/[0.02]"
                }`}
                style={{ width: `${share * 100}%` }}
              />

              {/* Option label */}
              <div className="relative flex items-center gap-2 z-10">
                {isCorrect && (
                  <Trophy className="h-4 w-4 text-emerald-400" />
                )}
                {isWrong && <X className="h-4 w-4 text-red-400" />}
                {isUserPick && !isResolved && (
                  <Check className="h-3.5 w-3.5 text-neon-gold" />
                )}
                <span
                  className={`text-sm font-semibold ${
                    isCorrect
                      ? "text-emerald-300"
                      : isWrong
                      ? "text-red-300/60"
                      : "text-white/80"
                  }`}
                >
                  {option}
                </span>
              </div>

              {/* Odds display */}
              <div className="relative z-10 flex items-center gap-3">
                <span className="text-[10px] text-white/30">
                  {(share * 100).toFixed(0)}%
                </span>
                <motion.span
                  key={odds.toFixed(2)}
                  initial={{ scale: 1.3, color: "#FFD700" }}
                  animate={{ scale: 1, color: "#fff" }}
                  className="text-lg font-headline font-bold tabular-nums"
                >
                  {odds.toFixed(1)}x
                </motion.span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* ── Stake input (shown after selecting option) ────────────── */}
      <AnimatePresence>
        {showStake && selectedOption && isOpen && !hasPlaced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/[0.04] overflow-hidden"
          >
            <div className="px-4 py-3 space-y-3">
              {/* Quick amount chips */}
              <div className="flex items-center gap-2">
                {stakePresets.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setStakeAmount(amt)}
                    className={`
                      text-xs font-headline font-bold rounded-lg px-3 py-1.5 transition-all
                      ${
                        stakeAmount === amt
                          ? "bg-neon-gold/20 text-neon-gold border border-neon-gold/30"
                          : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                      }
                    `}
                  >
                    {parseInt(amt).toLocaleString()}
                  </button>
                ))}
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="flex-1 text-xs font-headline bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5 text-white/80 outline-none focus:border-neon-cyan/40"
                  min="0"
                  placeholder="Custom"
                />
              </div>

              {/* Potential payout */}
              <div className="flex items-center justify-between text-xs text-white/40">
                <span>Potential payout:</span>
                <span className="font-headline font-bold text-neon-gold">
                  {(
                    parseFloat(stakeAmount || "0") *
                    (bet.odds[selectedOption] || 2) *
                    bet.multiplier
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  $PICKS
                </span>
              </div>

              {/* Place bet button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handlePlace}
                className="w-full py-3 rounded-lg font-headline font-bold text-sm uppercase tracking-wider
                  bg-gradient-to-r from-amber-500 to-orange-500 text-black
                  shadow-[0_0_20px_hsl(45_100%_55%/0.3)] hover:shadow-[0_0_30px_hsl(45_100%_55%/0.5)]
                  transition-shadow"
              >
                <div className="flex items-center justify-center gap-2">
                  <Coins className="h-4 w-4" />
                  LOCK IN — {selectedOption}
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User's placed bet summary ─────────────────────────────── */}
      {hasPlaced && !isResolved && (
        <div className="px-4 py-2 border-t border-white/[0.04] bg-neon-gold/[0.03]">
          <p className="text-[10px] text-neon-gold/60">
            You picked{" "}
            <span className="font-bold text-neon-gold">
              {userPlacement.chosenOption}
            </span>{" "}
            with{" "}
            <span className="font-bold">
              {parseFloat(userPlacement.stakeAmount).toLocaleString()} $PICKS
            </span>
          </p>
        </div>
      )}

      {/* Pool info */}
      {totalPool > 0 && (
        <div className="px-4 py-1.5 border-t border-white/[0.04] flex items-center justify-between">
          <span className="text-[10px] text-white/20">Total pool</span>
          <span className="text-[10px] font-bold text-white/30">
            {Math.floor(totalPool).toLocaleString()} $PICKS
          </span>
        </div>
      )}
    </motion.div>
  );
}
