"use client";

import { useState } from "react";
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
} from "lucide-react";
import { FadeIn } from "@/components/motion";

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
  timeLeft: string;
  airAt: string;
  status: MarketStatus;
  href: string;
}

type FilterValue = "all" | MarketStatus;

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Live", value: "live" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Locked", value: "locked" },
  { label: "Closed", value: "closed" },
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
    text: "LOCKED",
    className: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    icon: Lock,
  },
  closed: {
    text: "CLOSED",
    className: "text-white/40 bg-white/[0.04] border-white/[0.08]",
  },
};

export function PlayClient({ markets }: { markets: MarketData[] }) {
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

  const liveCounts = {
    all: markets.length,
    live: markets.filter((m) => m.status === "live").length,
    upcoming: markets.filter((m) => m.status === "upcoming").length,
    locked: markets.filter((m) => m.status === "locked").length,
    closed: markets.filter((m) => m.status === "closed").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <FadeIn>
        <h1 className="font-headline text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-white mb-2">
          Markets
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Browse prediction markets across all live and upcoming shows.
        </p>
      </FadeIn>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
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
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === f.value
                  ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                  : "text-muted-foreground hover:text-white border border-transparent"
              }`}
            >
              {f.label}
              {liveCounts[f.value] > 0 && (
                <span className="ml-1 text-[10px] opacity-60">
                  {liveCounts[f.value]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </AnimatePresence>
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

function MarketCard({ market }: { market: MarketData }) {
  const badge = statusConfig[market.status];
  const BadgeIcon = badge.icon;
  const isClickable = market.status === "live" || market.status === "locked";

  const content = (
    <div
      className={`p-5 rounded-xl border bg-white/[0.02] transition-all h-full flex flex-col ${
        market.status === "live"
          ? "border-neon-cyan/15 hover:border-neon-cyan/30 hover:bg-white/[0.04]"
          : market.status === "locked"
            ? "border-orange-400/10 hover:border-orange-400/20 hover:bg-white/[0.04]"
            : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{market.emoji}</span>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground leading-tight">
              {market.showName}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              {market.episode}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${badge.className}`}
        >
          {market.status === "live" && (
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />
          )}
          {BadgeIcon && <BadgeIcon className="h-2.5 w-2.5" />}
          {badge.text}
        </span>
      </div>

      {/* Episode title */}
      <h3 className="text-sm font-semibold text-white mb-1 flex-1 group-hover:text-neon-cyan transition-colors">
        {market.episodeTitle}
      </h3>

      {/* Question count */}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
        <MessageSquare className="h-3 w-3" />
        {market.questions} prediction{market.questions !== 1 ? "s" : ""}{" "}
        available
      </p>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/[0.06] pt-3">
        <span className="flex items-center gap-1">
          <Users className="h-3 w-3" /> {market.participants} player
          {market.participants !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" /> {market.timeLeft}
        </span>
        <span className="flex items-center gap-1 text-neon-cyan font-bold">
          <TrendingUp className="h-3 w-3" />
          {market.predictions}
        </span>
      </div>

      {/* CTA for live markets */}
      {market.status === "live" && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <span className="flex items-center justify-center gap-1.5 text-xs font-bold text-neon-cyan uppercase tracking-wider">
            Predict Now <ArrowRight className="h-3 w-3" />
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
