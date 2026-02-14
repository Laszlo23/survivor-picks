"use client";

import { Target, TrendingUp, Shield, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";

const neonBorders = [
  "border-l-neon-cyan",
  "border-l-neon-magenta",
  "border-l-neon-gold",
  "border-l-neon-cyan",
];

const steps = [
  {
    icon: Target,
    title: "Make Picks",
    desc: "Choose a show and predict outcomes — winners, eliminations, twists, and more.",
    color: "text-neon-cyan",
    accent: "hsl(185 100% 55%)",
  },
  {
    icon: TrendingUp,
    title: "Earn Points",
    desc: "Harder predictions pay more. Use Risk Bets for a 1.5x multiplier.",
    color: "text-neon-magenta",
    accent: "hsl(320 100% 60%)",
  },
  {
    icon: Shield,
    title: "Immunity Joker",
    desc: "3 per season. Protect a wrong pick and still earn base points.",
    color: "text-neon-gold",
    accent: "hsl(45 100% 55%)",
  },
  {
    icon: Trophy,
    title: "Climb Ranks",
    desc: "Build streaks for bonus points. Unlock badges. Top the leaderboard.",
    color: "text-neon-cyan",
    accent: "hsl(185 100% 55%)",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="mb-10">
          <LowerThird label="THE GAME" value="How It Works" />
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className={`relative rounded-xl border border-white/[0.06] bg-studio-dark/60 backdrop-blur-sm overflow-hidden border-l-[3px] ${neonBorders[i]} hover:bg-white/[0.04] transition-colors duration-200`}
          >
            <div className="p-5 sm:p-6">
              {/* Counter + Icon row */}
              <div className="flex items-center gap-3 mb-4">
                <span
                  className="font-headline text-3xl font-bold opacity-20"
                  style={{ color: item.accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: `${item.accent}15`, border: `1px solid ${item.accent}25` }}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
              </div>

              <h3 className="font-headline text-lg font-bold uppercase tracking-wide mb-2 text-white">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
