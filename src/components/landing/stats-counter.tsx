"use client";

import { Users, Radio, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/motion";

const stats = [
  {
    icon: Users,
    value: 3333,
    suffix: "+",
    label: "Early Supporters",
    color: "text-neon-cyan",
    accent: "hsl(185 100% 55%)",
  },
  {
    icon: Radio,
    value: 33,
    suffix: "",
    label: "Shows & Markets",
    color: "text-neon-magenta",
    accent: "hsl(320 100% 60%)",
  },
  {
    icon: Trophy,
    value: 333333,
    prefix: "",
    suffix: "",
    label: "$PICKS in Pools",
    color: "text-neon-gold",
    accent: "hsl(45 100% 55%)",
  },
];

export function LandingStatsCounter() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative flex items-center gap-4 rounded-xl border border-white/[0.06] bg-studio-dark/60 backdrop-blur-sm px-5 py-5 overflow-hidden"
          >
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                background: `radial-gradient(circle at 30% 50%, ${stat.accent}, transparent 70%)`,
              }}
              aria-hidden
            />
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: `${stat.accent}15`,
                border: `1px solid ${stat.accent}25`,
              }}
            >
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="relative min-w-0">
              <AnimatedCounter
                value={stat.value}
                prefix={stat.prefix || ""}
                suffix={stat.suffix}
                duration={1.6}
                className={`font-headline text-2xl sm:text-3xl font-extrabold ${stat.color}`}
              />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
