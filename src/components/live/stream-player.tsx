"use client";

import { useMemo } from "react";
import { Radio } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractTwitchChannel(url: string): string | null {
  const m = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
  return m ? m[1] : null;
}

function detectStreamType(
  url: string,
  hint?: string
): "youtube" | "twitch" | "custom" {
  if (hint === "youtube" || hint === "twitch" || hint === "custom")
    return hint as "youtube" | "twitch" | "custom";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("twitch.tv")) return "twitch";
  return "custom";
}

// ─── Component ───────────────────────────────────────────────────────────────

interface StreamPlayerProps {
  streamUrl: string;
  streamType?: string;
  isLive?: boolean;
  viewerCount?: number;
  className?: string;
}

export function StreamPlayer({
  streamUrl,
  streamType,
  isLive = true,
  viewerCount,
  className = "",
}: StreamPlayerProps) {
  const type = detectStreamType(streamUrl, streamType);

  const embedUrl = useMemo(() => {
    switch (type) {
      case "youtube": {
        const id = extractYouTubeId(streamUrl);
        if (!id) return streamUrl;
        return `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&rel=0&modestbranding=1`;
      }
      case "twitch": {
        const channel = extractTwitchChannel(streamUrl);
        if (!channel) return streamUrl;
        const parent =
          typeof window !== "undefined" ? window.location.hostname : "localhost";
        return `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=false`;
      }
      default:
        return streamUrl;
    }
  }, [streamUrl, type]);

  return (
    <div className={`relative overflow-hidden rounded-xl bg-black ${className}`}>
      {/* 16:9 responsive container */}
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 h-full w-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          frameBorder="0"
        />
      </div>

      {/* Live overlay badge */}
      {isLive && (
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          <div className="flex items-center gap-1.5 rounded-full bg-red-600/90 backdrop-blur-sm px-3 py-1 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Live
            </span>
          </div>

          {typeof viewerCount === "number" && viewerCount > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1">
              <Radio className="h-3 w-3 text-red-400" />
              <span className="text-xs font-medium text-white">
                {viewerCount.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Subtle neon border */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border border-white/5" />
      <div
        className="absolute inset-0 rounded-xl pointer-events-none opacity-30"
        style={{
          boxShadow:
            "inset 0 0 30px hsl(185 100% 55% / 0.05), 0 0 20px hsl(185 100% 55% / 0.05)",
        }}
      />
    </div>
  );
}
