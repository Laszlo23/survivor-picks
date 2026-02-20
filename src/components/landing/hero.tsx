"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { FadeIn, ScaleIn } from "@/components/motion";
import { NeonButton } from "@/components/ui/neon-button";

const TICKER_ITEMS = [
  "Sarah predicted the tribal blindside — 320 pts",
  "Survivor EP7 pool hits 1,250 $PICKS",
  "@DannyBets takes #1 on the leaderboard",
  "Bachelor finale: 840 predictions locked",
  "Love Island recoupling market now live",
  "Team Alpha hit a 5x multiplier streak",
];

function useCountdown(targetDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, expired: true });

  useEffect(() => {
    if (!targetDate) return;

    const target = new Date(targetDate).getTime();

    function tick() {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ h: 0, m: 0, s: 0, expired: true });
        return;
      }
      setTimeLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
        expired: false,
      });
    }

    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface LandingHeroProps {
  seasonTitle?: string;
  nextEpisodeAt?: string | null;
}

export function LandingHero({ seasonTitle, nextEpisodeAt }: LandingHeroProps) {
  const countdown = useCountdown(nextEpisodeAt ?? null);

  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex flex-col">
      {/* ── CSS animated background ── */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-studio-black" />
        <div className="hero-gradient-red" />
        <div className="hero-gradient-blue" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,transparent_0%,hsl(220_15%_4%/0.6)_70%,hsl(220_15%_4%/0.95)_100%)]" />
      </div>

      {/* ── Floating particles ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="hero-particle hero-particle--cyan" style={{ left: "12%", animationDuration: "8s", animationDelay: "0s" }} />
        <div className="hero-particle hero-particle--cyan" style={{ left: "32%", animationDuration: "10s", animationDelay: "1.5s" }} />
        <div className="hero-particle hero-particle--cyan" style={{ left: "58%", animationDuration: "12s", animationDelay: "3s" }} />
        <div className="hero-particle hero-particle--magenta" style={{ left: "45%", animationDuration: "11s", animationDelay: "2s" }} />
      </div>

      {/* ── Live ticker ── */}
      <LiveTicker />

      {/* ── Main content ── */}
      <div className="relative flex-1 flex items-center">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:py-32 w-full">
          <div className="text-center">
            {/* Logo */}
            <ScaleIn>
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <Image
                    src="/pickslogoicon.png"
                    alt="RealityPicks"
                    width={48}
                    height={48}
                    className="rounded-xl relative z-10 drop-shadow-[0_0_16px_hsl(185_100%_55%/0.5)]"
                    style={{ mixBlendMode: "screen" }}
                    priority
                  />
                  <div className="absolute inset-0 rounded-xl bg-neon-cyan/20 blur-2xl scale-[2]" />
                </div>
              </div>
            </ScaleIn>

            {/* ON AIR label */}
            <FadeIn delay={0.05}>
              <div className="mb-4 flex justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                    ON AIR
                  </span>
                  <span className="h-3 w-px bg-white/10" />
                  <span className="text-[10px] uppercase tracking-wider text-white/40">
                    {seasonTitle || "Survivor"} · Tribal Council
                  </span>
                </div>
              </div>
            </FadeIn>

            {/* Countdown timer */}
            {!countdown.expired && (
              <FadeIn delay={0.1}>
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.04] border border-neon-cyan/20 backdrop-blur-sm animate-glow-pulse">
                    <span className="text-[10px] uppercase tracking-widest text-white/40">
                      Next elimination
                    </span>
                    <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-neon-cyan drop-shadow-[0_0_12px_hsl(185_100%_55%/0.6)]">
                      {pad(countdown.h)}:{pad(countdown.m)}:{pad(countdown.s)}
                    </span>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Headline — tight */}
            <FadeIn delay={0.2}>
              <h1 className="font-headline text-4xl font-extrabold uppercase tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                Predict Reality.{" "}
                <span className="text-gradient-cyan drop-shadow-[0_0_30px_hsl(185_100%_55%/0.4)]">
                  Win Glory.
                </span>
              </h1>
            </FadeIn>

            {/* Subheadline — single line */}
            <FadeIn delay={0.3}>
              <p className="mx-auto mt-4 max-w-lg text-sm sm:text-base text-white/70 leading-relaxed">
                Call eliminations, predict twists, and climb the leaderboard.{" "}
                <span className="text-white font-semibold">Free to play.</span>
              </p>
            </FadeIn>

            {/* CTAs */}
            <FadeIn delay={0.45}>
              <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-center">
                <NeonButton
                  variant="primary"
                  href="/auth/signin"
                  className="gap-2 text-base px-10 py-3 w-full sm:w-auto shadow-[0_0_30px_hsl(185_100%_55%/0.4)]"
                >
                  Start Predicting Free
                  <ArrowRight className="h-4 w-4" />
                </NeonButton>
                <NeonButton
                  variant="ghost"
                  href="/live-demo"
                  className="gap-2 text-base px-8 py-3 backdrop-blur-sm bg-white/[0.06] border border-white/[0.1]"
                >
                  <Play className="h-4 w-4" />
                  Watch Live Demo
                </NeonButton>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

function LiveTicker() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const halfWidth = el.scrollWidth / 2;
    let raf: number;
    let pos = 0;
    const speed = 0.4;

    function step() {
      pos += speed;
      if (pos >= halfWidth) pos = 0;
      setOffset(pos);
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const items = TICKER_ITEMS.map((item, i) => (
    <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap px-5 text-white/50">
      <span className="h-1 w-1 rounded-full bg-neon-cyan/50 shrink-0" />
      <span>{item}</span>
    </span>
  ));

  return (
    <div className="relative z-10 w-full overflow-hidden border-b border-white/[0.06] bg-studio-black/60 backdrop-blur-sm">
      <div className="flex items-center">
        <span className="shrink-0 flex items-center gap-1.5 px-3 py-2 border-r border-white/[0.06] bg-white/[0.02]">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
            Live Feed
          </span>
        </span>
        <div className="overflow-hidden flex-1">
          <div
            ref={trackRef}
            className="flex text-[11px] py-2 will-change-transform"
            style={{ transform: `translateX(-${offset}px)` }}
          >
            {items}
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}
