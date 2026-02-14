"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { type ShowInfo } from "@/lib/shows";

interface ShowTabsProps {
  shows: ShowInfo[];
  activeSlug: string;
  onSelect: (slug: string) => void;
}

export function ShowTabs({ shows, activeSlug, onSelect }: ShowTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={scrollRef}
      className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1 snap-x snap-mandatory"
    >
      {shows.map((show) => {
        const isActive = show.slug === activeSlug;
        return (
          <motion.button
            key={show.slug}
            onClick={() => onSelect(show.slug)}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
              relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium
              transition-colors duration-200 snap-start shrink-0
              ${
                isActive
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="show-tab-active"
                className="absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                style={{
                  background: `linear-gradient(135deg, ${show.accent}18, ${show.accent}08)`,
                  border: `1px solid ${show.accent}30`,
                  boxShadow: `0 0 24px ${show.accent}20, inset 0 1px 0 ${show.accent}10`,
                }}
              />
            )}
            <span className="relative text-base">{show.emoji}</span>
            <span className="relative">{show.shortName}</span>
            {isActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: show.accent }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
