"use client";

import Link from "next/link";
import Image from "next/image";
import { FadeIn } from "@/components/motion";

const footerLinks = {
  Product: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "NFTs", href: "/nfts" },
    { label: "$PICKS Token", href: "/token" },
    { label: "Staking", href: "/staking" },
  ],
  Learn: [
    { label: "Whitepaper", href: "/whitepaper" },
    { label: "Tokenomics", href: "/tokenomics" },
    { label: "Contracts", href: "/contracts" },
    { label: "Investors & Partners", href: "/invest" },
    { label: "Blog", href: "/blog" },
  ],
  Community: [
    { label: "Discord", href: "https://discord.gg/Km7Tw6jHhk", external: true },
    { label: "Farcaster", href: "https://warpcast.com/0xlaszlo", external: true },
    { label: "X / Twitter", href: "https://x.com/laszloleonardo", external: true },
  ],
};

export function LandingFooter() {
  return (
    <FadeIn>
      <footer className="border-t border-neon-cyan/20 mt-16 relative">
        {/* Neon top glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/40 to-transparent" />

        <div className="mx-auto max-w-7xl px-4 py-10">
          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            {/* Brand column */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <Image
                  src="/pickslogoicon.png"
                  alt="RealityPicks"
                  width={28}
                  height={28}
                  className="rounded-lg"
                  style={{ mixBlendMode: "screen" }}
                />
                <span className="text-sm font-display font-bold tracking-tight text-white">
                  Reality<span className="text-neon-cyan">Picks</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The first decentralized prediction platform for reality TV. Free to play. Built on Base.
              </p>
              <span className="inline-flex items-center gap-1.5 mt-3 text-[10px] font-mono font-bold uppercase tracking-widest text-neon-cyan/60">
                <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan/50 animate-pulse" />
                LIVE ON BASE
              </span>
            </div>

            {/* Link groups */}
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-bold">
                  {group}
                </p>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      {"external" in link && link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-neon-cyan transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-xs text-muted-foreground hover:text-neon-cyan transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>&copy; {new Date().getFullYear()} RealityPicks. A free prediction game.</span>
            <span className="text-[10px]">No real money involved. Not financial advice.</span>
          </div>
        </div>
      </footer>
    </FadeIn>
  );
}
