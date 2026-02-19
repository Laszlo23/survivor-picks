"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BetCardLive } from "./bet-card-live";
import { Flame, History, Zap } from "lucide-react";
import { toast } from "sonner";

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

interface LiveOddsBoardProps {
  bets: LiveBetData[];
  userId: string;
  sessionId: string;
  showTitle: string;
  episodeTitle: string;
}

type Tab = "live" | "resolved";

export function LiveOddsBoard({
  bets,
  userId,
  sessionId,
  showTitle,
  episodeTitle,
}: LiveOddsBoardProps) {
  const [tab, setTab] = useState<Tab>("live");

  const liveBets = bets.filter(
    (b) => b.status === "open" || b.status === "locked"
  );
  const resolvedBets = bets.filter((b) => b.status === "resolved");

  const handlePlaceBet = useCallback(
    async (betId: string, option: string, amount: string) => {
      try {
        const res = await fetch("/api/live/bet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "place",
            liveBetId: betId,
            chosenOption: option,
            stakeAmount: amount,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to place bet");
        }

        toast.success("Bet locked in!", {
          description: `${option} — ${parseInt(amount).toLocaleString()} $PICKS`,
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to place bet");
      }
    },
    []
  );

  const currentBets = tab === "live" ? liveBets : resolvedBets;

  return (
    <div className="space-y-3">
      {/* ── Show header ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-headline font-bold text-white/40 uppercase tracking-widest">
            {showTitle}
          </h2>
          <p className="text-[10px] text-white/20">{episodeTitle}</p>
        </div>
        <div className="flex items-center gap-1 text-neon-cyan">
          <Zap className="h-3.5 w-3.5" />
          <span className="text-xs font-bold font-headline">
            {liveBets.length} LIVE
          </span>
        </div>
      </div>

      {/* ── Tab switcher ─────────────────────────────────────────── */}
      <div className="flex gap-1 bg-white/[0.03] rounded-lg p-0.5">
        <button
          onClick={() => setTab("live")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${
            tab === "live"
              ? "bg-white/[0.08] text-white"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          <Flame className="h-3 w-3" />
          Live ({liveBets.length})
        </button>
        <button
          onClick={() => setTab("resolved")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${
            tab === "resolved"
              ? "bg-white/[0.08] text-white"
              : "text-white/30 hover:text-white/50"
          }`}
        >
          <History className="h-3 w-3" />
          Resolved ({resolvedBets.length})
        </button>
      </div>

      {/* ── Bet cards ─────────────────────────────────────────────── */}
      <AnimatePresence mode="popLayout">
        {currentBets.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <Zap className="h-8 w-8 text-white/10 mx-auto mb-2" />
            <p className="text-sm text-white/20">
              {tab === "live"
                ? "Waiting for the next bet..."
                : "No resolved bets yet"}
            </p>
            {tab === "live" && (
              <p className="text-[10px] text-white/10 mt-1">
                AI is watching the stream and will create bets automatically
              </p>
            )}
          </motion.div>
        ) : (
          currentBets.map((bet) => (
            <BetCardLive
              key={bet.id}
              bet={bet}
              userId={userId}
              onPlaceBet={handlePlaceBet}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
