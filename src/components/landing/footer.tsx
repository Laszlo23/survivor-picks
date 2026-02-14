"use client";

import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/motion";

export function LandingFooter() {
  return (
    <FadeIn>
      <footer className="border-t border-neon-cyan/20 mt-16 relative">
        {/* Neon top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="RealityPicks"
                width={24}
                height={24}
                className="rounded"
                style={{ mixBlendMode: "screen" }}
              />
              <span>
                RealityPicks — A free prediction game. No real money involved.
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 text-[10px] font-mono font-bold uppercase tracking-widest text-neon-cyan/60">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan/50 animate-pulse" />
                LIVE ON BASE
              </span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/token"
                className="hover:text-neon-cyan transition-colors"
              >
                $PICKS
              </Link>
              <Link
                href="/leaderboard"
                className="hover:text-neon-cyan transition-colors"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </FadeIn>
  );
}
