"use client";

import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Tv } from "lucide-react";

interface LiveLayoutProps {
  video: ReactNode;
  bettingPanel: ReactNode;
  ticker?: ReactNode;
  statsBar?: ReactNode;
}

export function LiveLayout({
  video,
  bettingPanel,
  ticker,
  statsBar,
}: LiveLayoutProps) {
  const [videoCollapsed, setVideoCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#050508] overflow-hidden">
      {/* ── Desktop: side-by-side / Mobile: stacked ──────────────────── */}
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        {/* ── Video panel ────────────────────────────────────────────── */}
        <div
          className={`
            lg:w-[60%] lg:min-h-0 lg:flex lg:flex-col
            ${videoCollapsed ? "h-12" : ""}
            transition-all duration-300
          `}
        >
          {/* Mobile collapse toggle */}
          <button
            onClick={() => setVideoCollapsed(!videoCollapsed)}
            className="lg:hidden flex items-center justify-between w-full px-4 py-2 bg-black/80 border-b border-white/5 z-20"
          >
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Tv className="h-3.5 w-3.5" />
              <span className="font-medium">
                {videoCollapsed ? "Show stream" : "Minimize stream"}
              </span>
            </div>
            {videoCollapsed ? (
              <ChevronDown className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronUp className="h-4 w-4 text-white/40" />
            )}
          </button>

          <AnimatePresence>
            {!videoCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:flex-1 lg:min-h-0 lg:p-4 p-2 overflow-hidden"
              >
                {video}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Betting panel ──────────────────────────────────────────── */}
        <div className="flex-1 min-h-0 lg:w-[40%] lg:border-l border-white/5 flex flex-col">
          {/* Stats bar */}
          {statsBar && (
            <div className="shrink-0 border-b border-white/5">{statsBar}</div>
          )}

          {/* Scrollable bets */}
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-3 lg:p-4 space-y-3">
            {bettingPanel}
          </div>
        </div>
      </div>

      {/* ── Bottom ticker ────────────────────────────────────────────── */}
      {ticker && (
        <div className="shrink-0 border-t border-white/5 bg-black/80 backdrop-blur-sm">
          {ticker}
        </div>
      )}
    </div>
  );
}
