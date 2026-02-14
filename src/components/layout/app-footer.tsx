"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export function AppFooter() {
  const pathname = usePathname();
  const { status } = useSession();

  // Only show on authenticated app pages, hidden on landing and auth pages
  if (status !== "authenticated") return null;
  if (pathname === "/" || pathname.startsWith("/auth") || pathname.startsWith("/admin")) return null;

  return (
    <footer className="hidden md:block border-t border-white/[0.06] mt-12">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="RealityPicks"
              width={20}
              height={20}
              className="rounded"
              style={{ mixBlendMode: "screen" }}
            />
            <span>
              RealityPicks — Free prediction game. No real money involved.
            </span>
            <span className="inline-flex items-center gap-1.5 ml-2 text-[10px] font-mono font-bold uppercase tracking-widest text-neon-cyan/60">
              <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan/50 animate-pulse" />
              LIVE ON BASE
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/token" className="hover:text-neon-cyan transition-colors">
              $PICKS
            </Link>
            <Link href="/nfts" className="hover:text-neon-cyan transition-colors">
              NFTs
            </Link>
            <Link href="/leaderboard" className="hover:text-neon-cyan transition-colors">
              Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
