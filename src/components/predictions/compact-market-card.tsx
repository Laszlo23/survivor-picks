"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Clock, Lock, Hourglass, Zap, Users, ChevronRight } from "lucide-react";
import type { MarketData } from "@/app/play/play-client";

function formatTimeLeft(lockAt: string): string {
  const diff = new Date(lockAt).getTime() - Date.now();
  if (diff <= 0) return "Locked";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function LiveTimer({ lockAt }: { lockAt: string }) {
  const [time, setTime] = useState(() => formatTimeLeft(lockAt));
  useEffect(() => {
    const interval = setInterval(() => setTime(formatTimeLeft(lockAt)), 30_000);
    return () => clearInterval(interval);
  }, [lockAt]);
  return <span className="font-mono text-neon-cyan">{time}</span>;
}

function ContestantAvatar({
  name,
  imageUrl,
  accent,
  size = "md",
}: {
  name: string;
  imageUrl?: string;
  accent?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-12 w-12 text-sm",
  };

  if (imageUrl) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden shrink-0`}
        style={{ outline: `2px solid ${accent || "#444"}`, outlineOffset: "-1px" }}
      >
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{
        backgroundColor: (accent || "#666") + "25",
        color: accent || "#aaa",
        border: `2px solid ${accent || "#444"}`,
      }}
    >
      {name[0]?.toUpperCase() || "?"}
    </div>
  );
}

export function CompactMarketCard({ market }: { market: MarketData }) {
  const tq = market.topQuestion;
  const isLive = market.status === "live";
  const isLocked = market.status === "locked";
  const isClosed = market.status === "closed";
  const isClickable = isLive || isLocked || isClosed;
  const accent = market.showAccent || "#00e5ff";

  const isBinary = tq && tq.options.length === 2;
  const isMulti = tq && tq.options.length > 2;

  const content = (
    <div
      className={`relative rounded-xl border overflow-hidden transition-all duration-200 ${
        isLive
          ? "border-white/[0.12] hover:border-white/[0.2] hover:-translate-y-0.5"
          : isLocked
            ? "border-white/[0.06] opacity-70"
            : isClosed
              ? "border-white/[0.06] opacity-60"
              : "border-white/[0.08] hover:border-white/[0.15] hover:-translate-y-0.5"
      }`}
      style={{
        background: isLive
          ? `linear-gradient(135deg, ${accent}08, transparent 60%)`
          : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 text-[11px]">
          {isLive && (
            <span className="flex items-center gap-1 text-green-400 font-bold uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          )}
          {isLocked && (
            <span className="flex items-center gap-1 text-white/40 font-medium uppercase tracking-wider">
              <Hourglass className="h-3 w-3" />
              Awaiting
            </span>
          )}
          {isClosed && (
            <span className="text-white/30 font-medium uppercase tracking-wider">
              Resolved
            </span>
          )}
          {!isLive && !isLocked && !isClosed && (
            <span className="flex items-center gap-1 text-amber-400/80 font-medium uppercase tracking-wider">
              <Clock className="h-3 w-3" />
              Upcoming
            </span>
          )}
          <span className="text-white/20">·</span>
          <span className="text-muted-foreground">
            {market.showNetwork || market.showName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-muted-foreground">
            {market.episode}
          </span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: accent + "20",
              color: accent,
            }}
          >
            {market.emoji} {market.showName.split(/[:\s]/)[0]}
          </span>
        </div>
      </div>

      {/* Question prompt */}
      {tq && (
        <p className="px-4 text-[11px] text-muted-foreground mb-2 truncate">
          {tq.prompt}
        </p>
      )}

      {/* Binary layout: two contestants side by side */}
      {isBinary && (
        <BinaryLayout
          options={tq.options}
          communityPicks={tq.communityPicks}
          contestantImages={market.contestantImages || {}}
          accent={accent}
          correctOption={tq.correctOption}
        />
      )}

      {/* Multi-option layout */}
      {isMulti && (
        <MultiLayout
          options={tq.options}
          communityPicks={tq.communityPicks}
          contestantImages={market.contestantImages || {}}
          accent={accent}
          correctOption={tq.correctOption}
        />
      )}

      {/* No question fallback */}
      {!tq && (
        <div className="px-4 pb-3">
          <p className="text-sm font-semibold text-white mb-1">{market.episodeTitle}</p>
          <p className="text-xs text-muted-foreground">
            {market.questions} question{market.questions !== 1 ? "s" : ""} available
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {market.participants}
          </span>
          <span className="flex items-center gap-1">
            {isLive ? (
              <LiveTimer lockAt={market.lockAt} />
            ) : isLocked ? (
              <span>Awaiting results</span>
            ) : isClosed ? (
              <span>Ended</span>
            ) : (
              <span>{formatTimeLeft(market.lockAt)}</span>
            )}
          </span>
        </div>
        {market.questions > 1 && (
          <span className="text-[9px] text-white/30">
            +{market.questions - 1} more
          </span>
        )}
        {isClickable && (
          <ChevronRight className="h-3.5 w-3.5 text-white/20" />
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      {isClickable ? (
        <Link href={market.href} className="block group">
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}
    </motion.div>
  );
}

// ─── Binary Layout (2 options like a match) ───────────────────────────

function BinaryLayout({
  options,
  communityPicks,
  contestantImages,
  accent,
  correctOption,
}: {
  options: string[];
  communityPicks: Record<string, number>;
  contestantImages: Record<string, string>;
  accent: string;
  correctOption: string | null;
}) {
  const [optA, optB] = options;
  const pctA = communityPicks[optA] || 0;
  const pctB = communityPicks[optB] || 0;
  const hasPicks = pctA > 0 || pctB > 0;

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center justify-between gap-2">
        {/* Option A */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <ContestantAvatar
            name={optA}
            imageUrl={contestantImages[optA]}
            accent={accent}
            size="lg"
          />
          <div className="min-w-0">
            {hasPicks && (
              <p className="text-xl font-bold text-white leading-none mb-0.5">
                {pctA > 0 ? `${pctA.toFixed(1)}` : "—"}
                <span className="text-sm text-white/40">%</span>
              </p>
            )}
            <p className="text-xs text-white/70 truncate">{optA}</p>
            {correctOption === optA && (
              <span className="text-[9px] text-green-400 font-bold">CORRECT</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex flex-col items-center gap-0.5 shrink-0 px-1">
          {hasPicks ? (
            <span className="text-[9px] text-white/20 uppercase font-bold">vs</span>
          ) : (
            <span className="text-[10px] text-white/15 italic">vs</span>
          )}
        </div>

        {/* Option B */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end text-right">
          <div className="min-w-0">
            {hasPicks && (
              <p className="text-xl font-bold text-white leading-none mb-0.5">
                {pctB > 0 ? `${pctB.toFixed(1)}` : "—"}
                <span className="text-sm text-white/40">%</span>
              </p>
            )}
            <p className="text-xs text-white/70 truncate">{optB}</p>
            {correctOption === optB && (
              <span className="text-[9px] text-green-400 font-bold">CORRECT</span>
            )}
          </div>
          <ContestantAvatar
            name={optB}
            imageUrl={contestantImages[optB]}
            accent={accent}
            size="lg"
          />
        </div>
      </div>

      {/* Community bar */}
      {hasPicks && (
        <div className="mt-2.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden flex">
          <div
            className="h-full rounded-l-full transition-all duration-500"
            style={{ width: `${pctA}%`, backgroundColor: accent }}
          />
          <div
            className="h-full rounded-r-full transition-all duration-500 bg-white/[0.15]"
            style={{ width: `${pctB}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Multi Layout (3+ options) ────────────────────────────────────────

function MultiLayout({
  options,
  communityPicks,
  contestantImages,
  accent,
  correctOption,
}: {
  options: string[];
  communityPicks: Record<string, number>;
  contestantImages: Record<string, string>;
  accent: string;
  correctOption: string | null;
}) {
  const hasPicks = Object.values(communityPicks).some((v) => v > 0);
  const sorted = [...options].sort(
    (a, b) => (communityPicks[b] || 0) - (communityPicks[a] || 0)
  );
  const topTwo = sorted.slice(0, 2);
  const rest = sorted.slice(2);

  return (
    <div className="px-4 pb-3">
      {/* Top two as main matchup */}
      <div className="flex items-center justify-between gap-2 mb-2">
        {topTwo.map((opt, i) => (
          <div
            key={opt}
            className={`flex items-center gap-2 flex-1 min-w-0 ${
              i === 1 ? "justify-end text-right flex-row-reverse" : ""
            }`}
          >
            <ContestantAvatar
              name={opt}
              imageUrl={contestantImages[opt]}
              accent={accent}
              size="md"
            />
            <div className="min-w-0">
              {hasPicks && (
                <p className="text-lg font-bold text-white leading-none mb-0.5">
                  {communityPicks[opt] || 0}
                  <span className="text-[11px] text-white/40">%</span>
                </p>
              )}
              <p className="text-[11px] text-white/70 truncate">{opt}</p>
              {correctOption === opt && (
                <span className="text-[9px] text-green-400 font-bold">CORRECT</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Other options as compact row */}
      {rest.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-1.5">
          {rest.slice(0, 3).map((opt) => (
            <div key={opt} className="flex items-center gap-1.5 text-[10px]">
              <ContestantAvatar
                name={opt}
                imageUrl={contestantImages[opt]}
                accent={accent}
                size="sm"
              />
              <span className="text-white/50 truncate max-w-[60px]">{opt}</span>
              {hasPicks && (
                <span className="font-mono text-white/30">{communityPicks[opt] || 0}%</span>
              )}
            </div>
          ))}
          {rest.length > 3 && (
            <span className="text-[9px] text-white/20 ml-auto">+{rest.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}
