"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Clock,
  TrendingUp,
  Filter,
  MessageSquare,
  ArrowRight,
  Lock,
  Flame,
  Zap,
  Timer,
  Sparkles,
  Trophy,
  ChevronRight,
  Hourglass,
  Crown,
} from "lucide-react";
import { FadeIn, AnimatedBar } from "@/components/motion";

// ─── Types ────────────────────────────────────────────────────────────

export type MarketStatus = "live" | "upcoming" | "locked" | "closed";

export interface MarketData {
  id: string;
  emoji: string;
  showName: string;
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

type FilterValue = "all" | MarketStatus;

// ─── Constants ────────────────────────────────────────────────────────

const FILTERS: { label: string; value: FilterValue; icon?: string }[] = [
  { label: "All", value: "all" },
  { label: "Live", value: "live", icon: "🔴" },
  { label: "Coming Soon", value: "upcoming", icon: "⏳" },
  { label: "Locked", value: "locked", icon: "🔒" },
  { label: "Finished", value: "closed", icon: "✔" },
];

const statusConfig: Record<
  MarketStatus,
  { text: string; className: string; icon?: typeof Lock }
> = {
  live: {
    text: "LIVE",
    className: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20",
  },
  upcoming: {
    text: "UPCOMING",
    className: "text-neon-gold bg-neon-gold/10 border-neon-gold/20",
  },
  locked: {
    text: "AWAITING",
    className: "text-white/40 bg-white/[0.04] border-white/[0.08]",
    icon: Hourglass,
  },
  closed: {
    text: "RESOLVED",
    className: "text-white/40 bg-white/[0.04] border-white/[0.08]",
  },
};

const STATUS_ORDER: MarketStatus[] = ["live", "upcoming", "locked", "closed"];

const SECTION_META: Record<
  MarketStatus,
  { label: string; icon: string }
> = {
  live: { label: "Live", icon: "🔴" },
  upcoming: { label: "Coming Soon", icon: "⏳" },
  locked: { label: "Locked", icon: "🔒" },
  closed: { label: "Finished", icon: "✔" },
};

const MAX_RESOLVED_IN_ALL = 2;

// ─── Helpers ──────────────────────────────────────────────────────────

function formatTimeLeft(lockAt: string): string {
  const diff = new Date(lockAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function participantLabel(count: number): string {
  if (count === 0) return "Just opened";
  if (count < 5) return "New pick round";
  return count === 1 ? "1 player has picked" : `${count} players have picked`;
}

// ─── Competitive Context Bar ──────────────────────────────────────────

function CompetitiveBar({
  competitive,
}: {
  competitive: CompetitiveContext | null;
}) {
  if (!competitive || competitive.leaderPoints === 0) return null;

  return (
    <FadeIn>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 mb-4">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-muted-foreground">#1</span>
          <span className="text-xs font-semibold text-white">
            {competitive.leaderName}
          </span>
          <span className="text-xs font-mono font-bold text-amber-400">
            {competitive.leaderPoints.toLocaleString("en-US")} pts
          </span>
        </div>

        {competitive.userRank && competitive.userPoints !== null && (
          <>
            <div className="h-4 w-px bg-white/[0.08] hidden sm:block" />
            <div className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-neon-cyan" />
              <span className="text-xs text-muted-foreground">
                You: #{competitive.userRank}
              </span>
              <span className="text-xs font-mono text-white/70">
                {competitive.userPoints.toLocaleString("en-US")} pts
              </span>
              {competitive.pointsToNextRank &&
                competitive.pointsToNextRank > 0 && (
                  <span className="text-[10px] font-mono text-neon-cyan/70 bg-neon-cyan/5 border border-neon-cyan/10 px-1.5 py-0.5 rounded">
                    {competitive.pointsToNextRank.toLocaleString("en-US")} to
                    next rank
                  </span>
                )}
            </div>
          </>
        )}
      </div>
    </FadeIn>
  );
}

// ─── Season Progress ──────────────────────────────────────────────────

function SeasonProgressBar({
  contexts,
}: {
  contexts: SeasonContext[];
}) {
  if (contexts.length === 0) return null;
  const ctx = contexts[0];
  const progressPct =
    ctx.totalEpisodes > 0
      ? (ctx.resolvedEpisodes / ctx.totalEpisodes) * 100
      : 0;

  return (
    <FadeIn>
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4">
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
  const [filter, setFilter] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");

  const filtered = markets.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (
      search &&
      !m.episodeTitle.toLowerCase().includes(search.toLowerCase()) &&
      !m.showName.toLowerCase().includes(search.toLowerCase()) &&
      !m.episode.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const liveCounts: Record<FilterValue, number> = {
    all: markets.length,
    live: markets.filter((m) => m.status === "live").length,
    upcoming: markets.filter((m) => m.status === "upcoming").length,
    locked: markets.filter((m) => m.status === "locked").length,
    closed: markets.filter((m) => m.status === "closed").length,
  };

  const buildSections = () => {
    return STATUS_ORDER.map((status) => {
      let sectionMarkets = filtered.filter((m) => m.status === status);

      if (filter === "all" && status === "locked") {
        return { status, markets: [], totalCount: sectionMarkets.length };
      }

      const totalCount = sectionMarkets.length;

      if (filter === "all" && status === "closed") {
        sectionMarkets = sectionMarkets.slice(0, MAX_RESOLVED_IN_ALL);
      }

      return { status, markets: sectionMarkets, totalCount };
    }).filter((g) => g.markets.length > 0 || (g.status === "closed" && g.totalCount > 0));
  };

  const sections = buildSections();
  const showSections = filter === "all";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <FadeIn>
        <h1 className="font-headline text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-2">
          Arena
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Pick rounds across all live and upcoming shows.
        </p>
      </FadeIn>

      {/* Season Progress */}
      <SeasonProgressBar contexts={seasonContexts} />

      {/* Competitive Context */}
      <CompetitiveBar competitive={competitive ?? null} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shows or episodes..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-neon-cyan/30 focus:ring-1 focus:ring-neon-cyan/15 transition-all"
          />
        </div>

        {/* Animated Pill Tabs */}
        <div className="relative flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => {
            const isActive = filter === f.value;
            const count = liveCounts[f.value];
            const showCount = count >= 5 || (f.value === "live" && count > 0);
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap z-10 ${
                  isActive
                    ? "text-white"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="play-tab-active"
                    className={`absolute inset-0 rounded-lg -z-10 ${
                      f.value === "live"
                        ? "bg-neon-cyan/15 shadow-[0_0_12px_hsl(185_100%_55%/0.12)]"
                        : "bg-white/[0.08]"
                    }`}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
                {f.icon && <span className="text-[10px]">{f.icon}</span>}
                {f.label}
                {showCount && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/[0.12] text-white"
                        : "bg-white/[0.04] text-muted-foreground/60"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sectioned Grid */}
      {showSections ? (
        <div className="space-y-8">
          {sections.map(({ status, markets: sectionMarkets, totalCount }) => (
            <MarketSection
              key={status}
              status={status}
              markets={sectionMarkets}
              totalCount={totalCount}
            />
          ))}
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            filter === "live"
              ? "sm:grid-cols-1 lg:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                isLarge={market.status === "live"}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Filter className="h-10 w-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No pick rounds match your filter.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Market Section ───────────────────────────────────────────────────

function MarketSection({
  status,
  markets,
  totalCount,
}: {
  status: MarketStatus;
  markets: MarketData[];
  totalCount: number;
}) {
  const meta = SECTION_META[status];
  const isLive = status === "live";
  const isResolved = status === "closed";
  const hiddenCount = totalCount - markets.length;

  if (markets.length === 0 && hiddenCount <= 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">{meta.icon}</span>
        <h2 className="text-sm font-display font-semibold uppercase tracking-wider text-muted-foreground">
          {meta.label}
        </h2>
        <span className="text-[10px] text-muted-foreground/50 font-mono">
          {totalCount}
        </span>
        {isLive && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-neon-cyan font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />
            Active
          </span>
        )}
      </div>

      {markets.length > 0 && (
        <div
          className={`grid gap-4 ${
            isLive
              ? "sm:grid-cols-1 lg:grid-cols-2"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          <AnimatePresence mode="popLayout">
            {markets.map((market) => (
              <MarketCard
                key={market.id}
                market={market}
                isLarge={isLive}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {isResolved && hiddenCount > 0 && (
        <Link
          href="/leaderboard"
          className="flex items-center justify-center gap-1.5 mt-3 py-2.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-white bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] transition-colors"
        >
          View Season History
          <ChevronRight className="h-3 w-3" />
        </Link>
      )}
    </section>
  );
}

// ─── Market Card ──────────────────────────────────────────────────────

function MarketCard({
  market,
  isLarge = false,
}: {
  market: MarketData;
  isLarge?: boolean;
}) {
  const badge = statusConfig[market.status];
  const BadgeIcon = badge.icon;
  const isClickable =
    market.status === "live" || market.status === "locked";
  const closingSoon =
    market.status === "live" &&
    market.hoursUntilLock > 0 &&
    market.hoursUntilLock <= 24;
  const isLocked = market.status === "locked";
  const timeLeft =
    market.status === "closed"
      ? "Ended"
      : isLocked
        ? "Awaiting results"
        : formatTimeLeft(market.lockAt);

  const content = (
    <div
      className={`relative rounded-xl border bg-white/[0.02] transition-all duration-200 h-full flex flex-col overflow-hidden ${
        isLarge ? "p-6" : "p-5"
      } ${
        market.status === "live"
          ? "border-neon-cyan/20 hover:border-neon-cyan/40 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_hsl(185_100%_55%/0.08)]"
          : isLocked
            ? "border-white/[0.06] opacity-60 grayscale-[20%]"
            : market.status === "upcoming"
              ? "border-neon-gold/10 hover:border-neon-gold/20 hover:bg-white/[0.04] hover:-translate-y-0.5"
              : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
    >
      {/* Live glow effect */}
      {market.status === "live" && (
        <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-b from-neon-cyan/[0.04] to-transparent" />
      )}

      {/* Header */}
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={isLarge ? "text-2xl" : "text-xl"}>
            {market.emoji}
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">
              {market.showName}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              {market.episode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {closingSoon && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 border-orange-400/20 animate-pulse">
              <Zap className="h-2.5 w-2.5" />
              Closing Soon
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${badge.className} ${
              market.status === "live"
                ? "shadow-[0_0_10px_hsl(185_100%_55%/0.15)]"
                : ""
            }`}
          >
            {market.status === "live" && (
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />
            )}
            {BadgeIcon && <BadgeIcon className="h-2.5 w-2.5" />}
            {badge.text}
          </span>
        </div>
      </div>

      {/* Episode title */}
      <h3
        className={`font-semibold text-white mb-1 flex-1 group-hover:text-neon-cyan transition-colors ${
          isLarge ? "text-base" : "text-sm"
        }`}
      >
        {market.episodeTitle}
      </h3>

      {/* Question count + tags */}
      <div className="flex items-center gap-2 mb-4">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          {market.questions} question{market.questions !== 1 ? "s" : ""} available
        </p>
        {market.status === "live" && market.predictions > 10 && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 border border-orange-400/20 px-1.5 py-0.5 rounded-full">
            <Flame className="h-2.5 w-2.5" />
            Hot
          </span>
        )}
        {market.status === "upcoming" && market.participants === 0 && (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-violet-400 bg-violet-400/10 border border-violet-400/20 px-1.5 py-0.5 rounded-full">
            <Sparkles className="h-2.5 w-2.5" />
            New
          </span>
        )}
      </div>

      {/* Reward preview for live markets */}
      {market.status === "live" && market.predictions > 0 && (
        <div className="flex items-center gap-3 mb-3 text-[10px]">
          <span className="flex items-center gap-1 text-neon-gold/70">
            🏆 Token rewards (optional)
          </span>
          {market.participants >= 5 && (
            <>
              <span className="text-white/10">|</span>
              <span className="flex items-center gap-1 text-orange-400/70">
                🔥 {market.participants} competing
              </span>
            </>
          )}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/[0.06] pt-3">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          {participantLabel(market.participants)}
        </span>
        <span className="flex items-center gap-1">
          {isLocked ? (
            <Hourglass className="h-3 w-3" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          {market.status === "live" ? (
            <LiveCountdown lockAt={market.lockAt} />
          ) : (
            timeLeft
          )}
        </span>
        {market.predictions > 0 && (
          <span className="flex items-center gap-1 text-neon-cyan font-bold">
            <TrendingUp className="h-3 w-3" />
            {market.predictions}
          </span>
        )}
      </div>

      {/* CTA for live markets */}
      {market.status === "live" && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <span
            className={`flex items-center justify-center gap-2 font-bold text-neon-cyan uppercase tracking-wider rounded-lg py-2.5 bg-neon-cyan/5 border border-neon-cyan/15 hover:bg-neon-cyan/10 transition-all hover:shadow-[0_0_15px_hsl(185_100%_55%/0.1)] ${
              isLarge ? "text-sm" : "text-xs"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            Make your pick
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      )}
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      {isClickable ? (
        <Link href={market.href} className="block group h-full">
          {content}
        </Link>
      ) : (
        <div className="h-full opacity-80">{content}</div>
      )}
    </motion.div>
  );
}

// ─── Live Countdown ───────────────────────────────────────────────────

function LiveCountdown({ lockAt }: { lockAt: string }) {
  const [time, setTime] = useState(() => formatTimeLeft(lockAt));

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(formatTimeLeft(lockAt));
    }, 30_000);
    return () => clearInterval(interval);
  }, [lockAt]);

  return <span className="font-mono font-bold text-neon-cyan">{time}</span>;
}
