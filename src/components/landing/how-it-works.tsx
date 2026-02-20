"use client";

import { UserPlus, Target, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion";

const neonBorders = [
  "border-l-neon-cyan",
  "border-l-neon-magenta",
  "border-l-neon-gold",
];

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up Free",
    desc: "Email sign-up, no wallet needed. Start predicting in under 30 seconds.",
    color: "text-neon-cyan",
    accent: "hsl(185 100% 55%)",
  },
  {
    icon: Target,
    title: "Make Your Picks",
    desc: "Predict winners, eliminations, and twists across live reality TV shows.",
    color: "text-neon-magenta",
    accent: "hsl(320 100% 60%)",
  },
  {
    icon: Trophy,
    title: "Climb the Board",
    desc: "Correct picks earn points. Build streaks, unlock perks, and compete for the top.",
    color: "text-neon-gold",
    accent: "hsl(45 100% 55%)",
  },
];

export function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 mx-auto max-w-4xl px-4 py-16">
      <FadeIn>
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-widest text-neon-cyan/60 font-bold mb-2">HOW IT WORKS</p>
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold uppercase text-white">
            Three steps to glory
          </h2>
        </div>
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
