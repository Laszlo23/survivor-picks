"use client";

import { useState, useEffect } from "react";
import { Flame, Clock, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion";
import { NeonButton } from "@/components/ui/neon-button";

function useCountdownToMidnight() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    function calc() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      return {
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      };
    }
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1_000);
    return () => clearInterval(id);
  }, []);

  return timeLeft;
}

export function LandingDailyChallenge() {
  const { h, m, s } = useCountdownToMidnight();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <FadeIn>
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-neon-gold/20 bg-gradient-to-br from-studio-dark via-studio-dark/95 to-neon-gold/[0.04]"
          whileHover={{ scale: 1.005 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Decorative corner glow */}
          <div
            className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-neon-gold/10 blur-[80px] pointer-events-none"
            aria-hidden
          />

          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10 p-6 sm:p-8 md:p-10">
            {/* Left: Icon + Title */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon-gold/15 border border-neon-gold/25">
                  <Flame className="h-5 w-5 text-neon-gold" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon-gold">
                  Daily Challenge
                </span>
              </div>

              <h3 className="font-headline text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white mb-2">
                Daily Pick Challenge
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Make your pick every day. Build your streak, earn bonus XP, and
                climb the leaderboard faster than anyone else.
              </p>

              {/* Streak badge */}
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1.5 rounded-full bg-neon-gold/10 border border-neon-gold/20 px-3 py-1">
                  <Zap className="h-3.5 w-3.5 text-neon-gold" />
                  <span className="text-xs font-bold text-neon-gold">
                    +333 $PICKS Streak Bonus
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Countdown + CTA */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Clock className="h-3.5 w-3.5" />
                <span>Resets in</span>
              </div>

              <div className="flex gap-2">
                {[
                  { v: h, l: "HRS" },
                  { v: m, l: "MIN" },
                  { v: s, l: "SEC" },
                ].map((unit) => (
                  <div
                    key={unit.l}
                    className="flex flex-col items-center rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 py-2 min-w-[52px]"
                  >
                    <span className="font-headline text-2xl font-bold text-white tabular-nums">
                      {String(unit.v).padStart(2, "0")}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {unit.l}
                    </span>
                  </div>
                ))}
              </div>

              <NeonButton
                variant="primary"
                href="/dashboard"
                className="gap-1.5 text-sm px-8 mt-1"
              >
                Play Now <ChevronRight className="h-4 w-4" />
              </NeonButton>
            </div>
          </div>
        </motion.div>
      </FadeIn>
    </section>
  );
}
