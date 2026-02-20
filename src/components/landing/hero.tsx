"use client";

import Image from "next/image";
import { ArrowRight, Trophy } from "lucide-react";
import { FadeIn, ScaleIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import { NeonButton } from "@/components/ui/neon-button";

export function LandingHero({ seasonTitle }: { seasonTitle?: string }) {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center">
      {/* ── Video background — stays pinned while content scrolls over ── */}
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        {/* Video with poster fallback */}
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-stage.jpg"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Dark overlays for readability */}
        <div className="absolute inset-0 bg-studio-black/[0.75]" />
        <div className="absolute inset-0 bg-gradient-to-t from-studio-black via-studio-black/40 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_35%,transparent_0%,hsl(220_15%_4%/0.5)_70%,hsl(220_15%_4%/0.9)_100%)]" />
      </div>

      {/* Floating particles — CSS-only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="hero-particle hero-particle--cyan" style={{ left: "12%", animationDuration: "8s", animationDelay: "0s" }} />
        <div className="hero-particle hero-particle--cyan" style={{ left: "32%", animationDuration: "10s", animationDelay: "1.5s" }} />
        <div className="hero-particle hero-particle--cyan" style={{ left: "58%", animationDuration: "12s", animationDelay: "3s" }} />
        <div className="hero-particle hero-particle--cyan" style={{ left: "78%", animationDuration: "9s", animationDelay: "4.5s" }} />
        <div className="hero-particle hero-particle--magenta" style={{ left: "45%", animationDuration: "11s", animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-36 w-full">
        <div className="text-center">
          {/* Logo */}
          <ScaleIn>
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Image
                  src="/pickslogoicon.png"
                  alt="RealityPicks"
                  width={72}
                  height={72}
                  className="rounded-2xl relative z-10 drop-shadow-[0_0_20px_hsl(185_100%_55%/0.5)]"
                  style={{ mixBlendMode: "screen" }}
                  priority
                />
                <div className="absolute inset-0 rounded-2xl bg-neon-cyan/25 blur-2xl scale-[2]" />
              </div>
            </div>
          </ScaleIn>

          {/* ON AIR lower-third */}
          <FadeIn delay={0.15}>
            <div className="mb-6 flex justify-center">
              <LowerThird
                label="ON AIR"
                value={seasonTitle ? `3 Shows Live — ${seasonTitle}` : "3 Shows Ready for Predictions"}
              />
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={0.25}>
            <h1 className="font-headline text-4xl font-extrabold uppercase tracking-tight drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)] sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              Predict Reality.{" "}
              <span className="text-gradient-cyan drop-shadow-[0_0_30px_hsl(185_100%_55%/0.4)]">Win Glory.</span>
            </h1>
          </FadeIn>

          {/* 333 tagline */}
          <FadeIn delay={0.35}>
            <div className="mt-5 flex justify-center">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-neon-gold/[0.08] border border-neon-gold/20 backdrop-blur-sm">
                <span className="font-mono text-lg sm:text-xl font-bold text-neon-gold tracking-wider">333</span>
                <span className="h-4 w-px bg-neon-gold/30" />
                <span className="text-xs sm:text-sm text-white/70">
                  33,333 free $PICKS &bull; $0.00333 fair launch &bull; 333 supply model
                </span>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.45}>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base md:text-lg text-white/80 leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
              Pick winners, call eliminations, spot twists before they happen
              across Survivor, The Traitors, The Bachelor, and more. Earn
              points, build streaks, and climb the leaderboard.{" "}
              <span className="text-white font-semibold">Free to play.</span>
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={0.6}>
            <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:gap-4 sm:flex-row sm:justify-center">
              <NeonButton variant="primary" href="/dashboard" className="gap-2 text-base px-8 shadow-[0_0_30px_hsl(185_100%_55%/0.4)]">
                Cast Your Picks
                <ArrowRight className="h-4 w-4" />
              </NeonButton>
              <NeonButton variant="ghost" href="/leaderboard" className="gap-2 text-base px-8 backdrop-blur-sm bg-white/[0.06]">
                <Trophy className="h-4 w-4" />
                View Leaderboard
              </NeonButton>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
