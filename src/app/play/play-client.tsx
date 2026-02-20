"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Users, Clock, TrendingUp, Filter } from "lucide-react";
import { FadeIn } from "@/components/motion";

type MarketStatus = "all" | "live" | "upcoming" | "closed";

interface Market {
  id: string;
  emoji: string;
  showName: string;
  episode: string;
  question: string;
  participants: number;
  timeLeft: string;
  pool: number;
  status: "live" | "upcoming" | "closed";
  href: string;
}

const MARKETS: Market[] = [
  {
    id: "1",
    emoji: "🏝️",
    showName: "Survivor",
    episode: "S47 · EP7",
    question: "Who Gets Voted Off Episode 7?",
    participants: 18,
    timeLeft: "2h 15m",
    pool: 1250,
    status: "live",
    href: "/dashboard",
  },
  {
    id: "2",
    emoji: "🌹",
    showName: "The Bachelor",
    episode: "Finale",
    question: "Final Rose Winner Prediction",
    participants: 12,
    timeLeft: "1d 6h",
    pool: 840,
    status: "upcoming",
    href: "/dashboard",
  },
  {
    id: "3",
    emoji: "💕",
    showName: "Love Island",
    episode: "EP12",
    question: "Next Couple Eliminated",
    participants: 9,
    timeLeft: "5h 30m",
    pool: 620,
    status: "live",
    href: "/dashboard",
  },
  {
    id: "4",
    emoji: "🏠",
    showName: "Big Brother",
    episode: "Week 8",
    question: "Who Wins Head of Household?",
    participants: 7,
    timeLeft: "3d 12h",
    pool: 380,
    status: "upcoming",
    href: "/dashboard",
  },
  {
    id: "5",
    emoji: "🏝️",
    showName: "Survivor",
    episode: "S47 · EP6",
    question: "Who Was Eliminated in Episode 6?",
    participants: 24,
    timeLeft: "Ended",
    pool: 1800,
    status: "closed",
    href: "/dashboard",
  },
  {
    id: "6",
    emoji: "🎭",
    showName: "The Traitors",
    episode: "S3 · EP4",
    question: "Who Gets Murdered Next?",
    participants: 15,
    timeLeft: "8h 45m",
    pool: 920,
    status: "live",
    href: "/dashboard",
  },
  {
    id: "7",
    emoji: "🌹",
    showName: "The Bachelor",
    episode: "EP8",
    question: "Who Gets the Group Date Rose?",
    participants: 6,
    timeLeft: "2d 3h",
    pool: 440,
    status: "upcoming",
    href: "/dashboard",
  },
  {
    id: "8",
    emoji: "💕",
    showName: "Love Island",
    episode: "EP11",
    question: "Casa Amor: Who Stays Loyal?",
    participants: 31,
    timeLeft: "Ended",
    pool: 2100,
    status: "closed",
    href: "/dashboard",
  },
];

const FILTERS: { label: string; value: MarketStatus }[] = [
  { label: "All", value: "all" },
  { label: "Live", value: "live" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Closed", value: "closed" },
];

const statusBadge: Record<Market["status"], { text: string; className: string }> = {
  live: { text: "LIVE", className: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20" },
  upcoming: { text: "UPCOMING", className: "text-neon-gold bg-neon-gold/10 border-neon-gold/20" },
  closed: { text: "CLOSED", className: "text-white/40 bg-white/[0.04] border-white/[0.08]" },
};

export function PlayClient() {
  const [filter, setFilter] = useState<MarketStatus>("all");
  const [search, setSearch] = useState("");

  const filtered = MARKETS.filter((m) => {
    if (filter !== "all" && m.status !== filter) return false;
    if (search && !m.question.toLowerCase().includes(search.toLowerCase()) && !m.showName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
            placeholder="Search markets..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-neon-cyan/30 focus:ring-1 focus:ring-neon-cyan/15 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                filter === f.value
                  ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                  : "text-muted-foreground hover:text-white border border-transparent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((market) => {
            const badge = statusBadge[market.status];
            return (
              <motion.div
                key={market.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
              >
                <Link href={market.href} className="block group h-full">
                  <div className={`p-5 rounded-xl border bg-white/[0.02] hover:bg-white/[0.04] transition-all h-full flex flex-col ${
                    market.status === "live" ? "border-neon-cyan/15 hover:border-neon-cyan/30" : "border-white/[0.06] hover:border-white/[0.12]"
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{market.emoji}</span>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {market.showName} · {market.episode}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${badge.className}`}>
                        {market.status === "live" && <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse" />}
                        {badge.text}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white mb-4 flex-1 group-hover:text-neon-cyan transition-colors">
                      {market.question}
                    </h3>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {market.participants}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {market.timeLeft}
                      </span>
                      <span className="flex items-center gap-1 text-neon-cyan font-bold">
                        <TrendingUp className="h-3 w-3" />
                        {market.pool.toLocaleString("en-US")}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Filter className="h-10 w-10 text-white/10 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No markets match your filter.</p>
        </div>
      )}
    </div>
  );
}
