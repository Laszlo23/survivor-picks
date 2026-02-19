"use client";

import { useState, useCallback } from "react";
import { StreamPlayer } from "@/components/live/stream-player";
import { LiveLayout } from "@/components/live/live-layout";
import { LiveOddsBoard } from "@/components/live/live-odds-board";
import { LiveTicker } from "@/components/live/live-ticker";
import { LiveStatsBar } from "@/components/live/live-stats-bar";
import { FlashBetAlert } from "@/components/live/flash-bet-alert";
import { WinCelebration } from "@/components/live/win-celebration";
import {
  useAblyChannelAll,
  useAblyPresence,
} from "@/lib/realtime/use-ably";

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

interface LiveSessionData {
  id: string;
  streamUrl: string;
  streamType: string;
  status: string;
  viewerCount: number;
  episode: {
    number: number;
    title: string;
    season: {
      title: string;
      contestants: Array<{ name: string; imageUrl: string | null }>;
    };
  };
  bets: LiveBetData[];
}

interface TickerEntry {
  id: string;
  userName: string;
  option: string;
  amount: string;
  odds: number;
  timestamp: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LiveSessionClient({
  session: initialSession,
  userId,
}: {
  session: LiveSessionData;
  userId: string;
}) {
  const [bets, setBets] = useState<LiveBetData[]>(initialSession.bets);
  const [tickerEntries, setTickerEntries] = useState<TickerEntry[]>([]);
  const [flashBet, setFlashBet] = useState<LiveBetData | null>(null);
  const [winData, setWinData] = useState<{
    amount: string;
    betPrompt: string;
  } | null>(null);

  const viewerCount = useAblyPresence(
    initialSession.status === "live" ? `live:${initialSession.id}` : null
  );

  // Handle all Ably messages for this live session
  const handleMessage = useCallback(
    (msg: { name?: string; data?: unknown }) => {
      if (!msg.name) return;
      const data = msg.data as Record<string, unknown>;

      switch (msg.name) {
        case "bet:new": {
          const newBet = data as unknown as LiveBetData;
          setBets((prev) => [newBet, ...prev]);
          break;
        }

        case "bet:flash": {
          const fb = data as unknown as LiveBetData;
          setBets((prev) => [fb, ...prev]);
          setFlashBet(fb);
          setTimeout(() => setFlashBet(null), 8000);
          break;
        }

        case "odds:update": {
          const { betId, odds, totalPool } = data as {
            betId: string;
            odds: Record<string, number>;
            totalPool: string;
          };
          setBets((prev) =>
            prev.map((b) =>
              b.id === betId ? { ...b, odds, totalPool } : b
            )
          );
          break;
        }

        case "bet:resolved": {
          const { betId, correctOption, payouts } = data as {
            betId: string;
            correctOption: string;
            payouts: Array<{ userId: string; amount: string }>;
          };
          setBets((prev) =>
            prev.map((b) =>
              b.id === betId
                ? { ...b, status: "resolved", correctOption }
                : b
            )
          );
          // Check if current user won
          const userPayout = payouts?.find((p) => p.userId === userId);
          if (userPayout) {
            const bet = bets.find((b) => b.id === betId);
            setWinData({
              amount: userPayout.amount,
              betPrompt: bet?.prompt || "Live Bet",
            });
            setTimeout(() => setWinData(null), 4000);
          }
          break;
        }

        case "bet:placement": {
          const entry = data as unknown as TickerEntry;
          setTickerEntries((prev) => [entry, ...prev].slice(0, 50));
          break;
        }
      }
    },
    [userId, bets]
  );

  useAblyChannelAll(
    initialSession.status === "live" ? `live:${initialSession.id}` : null,
    handleMessage
  );

  // Separate bets by status
  const openBets = bets.filter((b) => b.status === "open");
  const resolvedBets = bets.filter((b) => b.status === "resolved");
  const userSessionPnL = resolvedBets.reduce((sum, b) => {
    const placement = b.placements.find((p) => p.userId === userId);
    if (!placement) return sum;
    if (placement.chosenOption === b.correctOption) {
      const odds = b.odds[placement.chosenOption] || 1;
      return sum + parseFloat(placement.stakeAmount) * odds;
    }
    return sum - parseFloat(placement.stakeAmount);
  }, 0);

  return (
    <>
      <LiveLayout
        video={
          <StreamPlayer
            streamUrl={initialSession.streamUrl}
            streamType={initialSession.streamType}
            isLive={initialSession.status === "live"}
            viewerCount={viewerCount}
          />
        }
        bettingPanel={
          <LiveOddsBoard
            bets={bets}
            userId={userId}
            sessionId={initialSession.id}
            showTitle={initialSession.episode.season.title}
            episodeTitle={`Ep ${initialSession.episode.number}: ${initialSession.episode.title}`}
          />
        }
        ticker={<LiveTicker entries={tickerEntries} />}
        statsBar={
          <LiveStatsBar
            viewerCount={viewerCount}
            totalPool={bets.reduce(
              (s, b) => s + parseFloat(b.totalPool || "0"),
              0
            )}
            sessionPnL={userSessionPnL}
            activeBets={openBets.length}
          />
        }
      />

      {/* Flash bet alert overlay */}
      {flashBet && (
        <FlashBetAlert
          bet={flashBet}
          onDismiss={() => setFlashBet(null)}
        />
      )}

      {/* Win celebration overlay */}
      {winData && (
        <WinCelebration
          amount={winData.amount}
          betPrompt={winData.betPrompt}
          onDismiss={() => setWinData(null)}
        />
      )}
    </>
  );
}
