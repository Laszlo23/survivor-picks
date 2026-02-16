"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ShowInfo } from "@/lib/shows";
import { LivePill } from "./live-pill";
import { NetworkBadge } from "./network-badge";
import { NeonButton } from "./neon-button";

interface ShowPosterCardProps {
  show: ShowInfo;
  index?: number;
}

function getStatus(show: ShowInfo): "live" | "airing" | "premiere" {
  const s = show.status.toLowerCase();
  if (s.includes("airing") || s.includes("live")) return "airing";
  if (s.includes("premiere")) return "premiere";
  return "premiere";
}

export function ShowPosterCard({ show, index = 0 }: ShowPosterCardProps) {
  const status = getStatus(show);
  const comingSoon = !show.hasData;

  const Wrapper = comingSoon ? "div" : Link;
  const wrapperProps = comingSoon ? {} : { href: "/dashboard" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={comingSoon ? {} : { scale: 1.03, y: -4 }}
      className={`group relative ${comingSoon ? "opacity-70" : ""}`}
    >
      <Wrapper {...(wrapperProps as any)} className="block">
        {/* Poster body */}
        <div
          className={`relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b ${show.landingGradient} transition-shadow duration-300 ${comingSoon ? "" : "group-hover:shadow-neon-cyan"}`}
        >
          {/* Glow backdrop behind emoji */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`h-32 w-32 rounded-full blur-3xl transition-opacity duration-300 ${comingSoon ? "opacity-15" : "opacity-30 group-hover:opacity-50"}`}
              style={{ background: show.accent }}
            />
          </div>

          {/* Emoji focal point */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-7xl sm:text-8xl drop-shadow-lg transition-transform duration-300 ${comingSoon ? "grayscale-[30%]" : "group-hover:scale-110"}`}>
              {show.emoji}
            </span>
          </div>

          {/* Coming Soon overlay */}
          {comingSoon && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
              <div className="rounded-lg bg-white/10 border border-white/20 px-4 py-2 backdrop-blur-md">
                <p className="text-sm font-bold uppercase tracking-wider text-white">Coming Soon</p>
              </div>
            </div>
          )}

          {/* Top bar: status + network */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <LivePill status={comingSoon ? "premiere" : status} label={comingSoon ? "Coming Soon" : (status === "premiere" ? show.status : undefined)} />
            <NetworkBadge network={show.network} />
          </div>

          {/* Bottom content overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-16">
            {/* Show title */}
            <h3 className="font-headline text-xl font-bold uppercase tracking-wide text-white mb-1 sm:text-2xl">
              {show.name}
            </h3>

            {/* Tagline */}
            <p className="text-xs text-white/60 mb-3 line-clamp-2">
              {show.tagline}
            </p>

            {/* Category tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {show.categories.slice(0, 4).map((cat) => (
                <span
                  key={cat}
                  className="rounded-sm bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/70"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* CTA */}
            {comingSoon ? (
              <div className="w-full py-2 text-center text-xs font-medium text-white/50 border border-white/10 rounded-lg bg-white/5">
                PREDICTIONS OPENING SOON
              </div>
            ) : (
              <NeonButton variant="primary" fullWidth className="text-xs py-2">
                CAST YOUR PICKS
              </NeonButton>
            )}
          </div>
        </div>
      </Wrapper>
    </motion.div>
  );
}
