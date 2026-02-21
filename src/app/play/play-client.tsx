"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Clock,
  TrendingUp,
  Filter,
  Lock,
  Zap,
  Timer,
  Trophy,
  ChevronRight,
  Hourglass,
} from "lucide-react";
import { FadeIn, AnimatedBar } from "@/components/motion";
import { CompactMarketCard } from "@/components/predictions/compact-market-card";

// ─── Types ────────────────────────────────────────────────────────────

export type MarketStatus = "live" | "upcoming" | "locked" | "closed";

export interface MarketData {
  id: string;
  emoji: string;
  showName: string;
  showSlug?: string;
  showNetwork?: string;
  showAccent?: string;
  episode: string;
  episodeTitle: string;
  questions: number;
  participants: number;
  predictions: number;
  lockAt: string;
  airAt: string;
  hoursUntilLock: number;
  status: MarketStatus;
  href: string;
  seasonId?: string;
  topQuestion?: {
    prompt: string;
    type: string;
    options: string[];
    communityPicks: Record<string, number>;
    correctOption: string | null;
  };
  contestantImages?: Record<string, string>;
}

export interface SeasonContext {
  id: string;
  title: string;
  emoji: string;
  totalEpisodes: number;
  resolvedEpisodes: number;
  nextEpisodeAirAt: string | null;
  nextEpisodeLockAt: string | null;
  nextEpisodeNumber: number | null;
}

export interface CompetitiveContext {
  leaderName: string;
  leaderPoints: number;
  userRank: number | null;
  userPoints: number | null;
  pointsToNextRank: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatTimeLeft(lockAt: string): string {
  const diff = new Date(lockAt).getTime() - Date.now();
  if (diff <= 0) return "Locked";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── Filter types ─────────────────────────────────────────────────────

interface ShowFilter {
  value: string;
  label: string;
  emoji?: string;
}

// ─── Season Progress ──────────────────────────────────────────────────

function SeasonProgressBar({ contexts }: { contexts: SeasonContext[] }) {
  if (contexts.length === 0) return null;
  return (
    <div className="space-y-3 mb-6">
      {contexts.map((ctx) => {
        const progressPct =
          ctx.totalEpisodes > 0
            ? (ctx.resolvedEpisodes / ctx.totalEpisodes) * 100
            : 0;
        return (
          <FadeIn key={ctx.id}>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ctx.emoji}</span>
                  <span className="text-sm font-display font-semibold">
                    {ctx.title}
                  </span>
                </div>
                {ctx.nextEpisodeNumber && ctx.nextEpisodeLockAt && (
                  <NextEpisodeCountdown
                    lockAt={ctx.nextEpisodeLockAt}
                    episodeNumber={ctx.nextEpisodeNumber}
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    Episode {ctx.resolvedEpisodes} of {ctx.totalEpisodes} resolved
                  </span>
                  <span>{Math.round(progressPct)}%</span>
                </div>
                <div className="h-1.5 rounded-full">
                  <AnimatedBar
                    percentage={progressPct}
                    color="bg-neon-cyan"
                    className="h-1.5"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}

function NextEpisodeCountdown({
  lockAt,
  episodeNumber,
}: {
  lockAt: string;
  episodeNumber: number;
}) {
  const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(lockAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(formatTimeLeft(lockAt));
    }, 60_000);
    return () => clearInterval(interval);
  }, [lockAt]);

  return (
    <span className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-md">
      <Timer className="h-3 w-3 text-neon-cyan" />
      EP{episodeNumber} locks in {timeLeft}
    </span>
  );
}

// ─── Competitive Bar ──────────────────────────────────────────────────

function CompetitiveBar({ competitive }: { competitive: CompetitiveContext | null }) {
  if (!competitive) return null;
  return (
    <FadeIn>
      <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-6 text-xs">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span className="text-muted-foreground">Leader:</span>
          <span className="font-semibold text-white">{competitive.leaderName}</span>
          <span className="font-mono text-amber-400">{competitive.leaderPoints}pts</span>
        </div>
        {competitive.userRank && (
          <>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">You:</span>
              <span className="font-mono text-neon-cyan">#{competitive.userRank}</span>
              <span className="font-mono text-muted-foreground">{competitive.userPoints}pts</span>
            </div>
          </>
        )}
      </div>
    </FadeIn>
  );
}

// ─── Main Component ───────────────────────────────────────────────────

export function PlayClient({
  markets,
  seasonContexts,
  competitive,
}: {
  markets: MarketData[];
  seasonContexts: SeasonContext[];
  competitive?: CompetitiveContext | null;
}) {
  const [showFilter, setShowFilter] = useState("all");
  const [search, setSearch] = useState("");

  const showFilters: ShowFilter[] = useMemo(() => {
    const uniqueShows = new Map<string, ShowFilter>();
    for (const m of markets) {
      const key = m.showSlug || m.showName;
      if (!uniqueShows.has(key)) {
        uniqueShows.set(key, {
          value: key,
          label: m.showName.replace(/\s*\d{4}.*$/, "").replace(/:\s*.*$/, "").trim() || m.showName,
          emoji: m.emoji,
        });
      }
    }
    return [{ value: "all", label: "All" }, ...uniqueShows.values()];
  }, [markets]);

  const filtered = markets.filter((m) => {
    if (showFilter !== "all") {
      const key = m.showSlug || m.showName;
      if (key !== showFilter) return false;
    }
    if (
      search &&
      !m.episodeTitle.toLowerCase().includes(search.toLowerCase()) &&
      !m.showName.toLowerCase().includes(search.toLowerCase()) &&
      !m.episode.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const liveMarkets = filtered.filter((m) => m.status === "live");
  const upcomingMarkets = filtered.filter((m) => m.status === "upcoming");
  const lockedMarkets = filtered.filter((m) => m.status === "locked");
  const closedMarkets = filtered.filter((m) => m.status === "closed").slice(0, 5);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <FadeIn>
        <h1 className="font-headline text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mb-1">
          Markets
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          Predict outcomes across live reality TV shows.
        </p>
      </FadeIn>

      {/* Season Progress */}
      <SeasonProgressBar contexts={seasonContexts} />

      {/* Competitive Context */}
      <CompetitiveBar competitive={competitive ?? null} />

      {/* Show Filter Pills (Bracky-style) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
        {showFilters.map((f) => {
          const isActive = showFilter === f.value;
          const count = f.value === "all"
            ? markets.length
            : markets.filter((m) => (m.showSlug || m.showName) === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setShowFilter(f.value)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? "text-white bg-white/[0.12] border border-white/[0.2] shadow-[0_0_12px_rgba(255,255,255,0.06)]"
                  : "text-muted-foreground bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              {f.emoji && <span className="text-sm">{f.emoji}</span>}
              {f.label}
              {count > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ml-0.5 ${
                  isActive ? "bg-white/[0.15]" : "bg-white/[0.06]"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shows or episodes..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-neon-cyan/30 focus:ring-1 focus:ring-neon-cyan/15 transition-all"
        />
      </div>

      {/* Market Cards */}
      <div className="space-y-3">
        {liveMarkets.length > 0 && (
          <MarketSection label="Live" count={liveMarkets.length} isLive>
            {liveMarkets.map((m) => (
              <CompactMarketCard key={m.id} market={m} />
            ))}
          </MarketSection>
        )}

        {upcomingMarkets.length > 0 && (
          <MarketSection label="Upcoming" count={upcomingMarkets.length}>
            {upcomingMarkets.map((m) => (
              <CompactMarketCard key={m.id} market={m} />
            ))}
          </MarketSection>
        )}

        {lockedMarkets.length > 0 && (
          <MarketSection label="Awaiting Results" count={lockedMarkets.length}>
            {lockedMarkets.map((m) => (
              <CompactMarketCard key={m.id} market={m} />
            ))}
          </MarketSection>
        )}

        {closedMarkets.length > 0 && (
          <MarketSection label="Resolved" count={closedMarkets.length}>
            {closedMarkets.map((m) => (
              <CompactMarketCard key={m.id} market={m} />
            ))}
          </MarketSection>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Filter className="h-10 w-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No markets match your filter.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Market Section ───────────────────────────────────────────────────

function MarketSection({
  label,
  count,
  isLive = false,
  children,
}: {
  label: string;
  count: number;
  isLive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        {isLive && (
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        )}
        <h2 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </h2>
        <span className="text-[10px] text-muted-foreground/50 font-mono">
          {count}
        </span>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </section>
  );
}
