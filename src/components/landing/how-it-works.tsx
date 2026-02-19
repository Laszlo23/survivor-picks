"use client";

import { Tv, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";

const neonBorders = [
  "border-l-neon-cyan",
  "border-l-neon-magenta",
  "border-l-neon-gold",
];

const steps = [
  {
    icon: Tv,
    title: "Pick Your Show",
    desc: "Browse live and upcoming reality TV prediction markets — no wallet needed to start.",
    color: "text-neon-cyan",
    accent: "hsl(185 100% 55%)",
  },
  {
    icon: Target,
    title: "Make Your Prediction",
    desc: "Choose your pick for who wins, who stays, and who goes home.",
    color: "text-neon-magenta",
    accent: "hsl(320 100% 60%)",
  },
  {
    icon: Trophy,
    title: "Win and Earn More",
    desc: "Correct predictions earn you a share of the pool and climb the leaderboard.",
    color: "text-neon-gold",
    accent: "hsl(45 100% 55%)",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="mb-3">
          <LowerThird label="THE GAME" value="How It Works" />
        </div>
        <p className="text-sm text-muted-foreground mb-10">
          Three simple steps to start predicting reality TV outcomes.
        </p>
      </FadeIn>

      <div className="grid gap-4 sm:gap-5 sm:grid-cols-3">
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
