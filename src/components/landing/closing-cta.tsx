"use client";

import { FadeIn } from "@/components/motion";
import { NeonButton } from "@/components/ui/neon-button";
import { ArrowRight, Zap } from "lucide-react";

export function LandingClosingCTA() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20">
      {/* Atmospheric background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div className="w-[600px] h-[300px] bg-neon-cyan/5 rounded-full blur-[100px]" />
        <div className="absolute w-[400px] h-[200px] bg-violet-500/5 rounded-full blur-[80px] translate-x-20 translate-y-10" />
      </div>

      <FadeIn>
        <div className="relative text-center">
          <div className="flex justify-center mb-6">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-neon-cyan/20 to-violet-500/20 flex items-center justify-center border border-neon-cyan/20">
              <Zap className="h-7 w-7 text-neon-cyan" />
            </div>
          </div>

          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
            The Stage Is Set.{" "}
            <span className="block sm:inline text-gradient-cyan">Are You Ready?</span>
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-4">
            Every episode is a market. Every prediction is a position.
            Every viewer becomes a player. The game starts now.
          </p>

          <p className="text-xs text-neon-gold/70 font-mono mb-8">
            33,333 $PICKS free &bull; $0.00333 per token &bull; The power of 333
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <NeonButton
              variant="primary"
              href="/dashboard"
              className="gap-2 text-base px-10 py-3 shadow-[0_0_40px_hsl(185_100%_55%/0.3)]"
            >
              Start Predicting Now <ArrowRight className="h-4 w-4" />
            </NeonButton>
            <NeonButton variant="ghost" href="/whitepaper" className="gap-2 text-base px-8 py-3">
              Read the Whitepaper
            </NeonButton>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
