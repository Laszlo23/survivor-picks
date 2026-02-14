"use client";

interface LivePillProps {
  status: "live" | "airing" | "premiere";
  label?: string;
}

export function LivePill({ status, label }: LivePillProps) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
        </span>
        LIVE
      </span>
    );
  }

  if (status === "airing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-sm border border-neon-cyan/40 bg-neon-cyan/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon-cyan">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-cyan opacity-50" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-neon-cyan" />
        </span>
        {label || "AIRING NOW"}
      </span>
    );
  }

  // premiere
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-neon-gold/40 bg-neon-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neon-gold">
      {label || "PREMIERE"}
    </span>
  );
}
