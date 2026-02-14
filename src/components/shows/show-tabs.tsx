"use client";

import { useRef } from "react";
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
          <button
            key={show.slug}
            onClick={() => onSelect(show.slug)}
            className={`
              flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium
              transition-all duration-200 snap-start shrink-0
              ${
                isActive
                  ? "bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5"
                  : "bg-white/[0.03] text-muted-foreground border border-transparent hover:bg-white/[0.06] hover:text-foreground"
              }
            `}
          >
            <span className="text-base">{show.emoji}</span>
            <span>{show.shortName}</span>
            {isActive && (
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: show.accent }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
