"use client";

import { Coins, Target, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion";
import Link from "next/link";
import { NeonButton } from "@/components/ui/neon-button";

const SIGNUP_BONUS = 33_333;
const PICKS_PRICE_USD = 0.00333;

export function LandingWalletExplainer() {
  const usdValue = (SIGNUP_BONUS * PICKS_PRICE_USD).toFixed(2);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="rounded-2xl border border-white/[0.08] bg-studio-dark/60 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: Wallet preview */}
            <div className="p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-white/[0.06]">
              <p className="text-[10px] uppercase tracking-widest text-neon-cyan/70 font-bold mb-3">
                Your $PICKS Wallet
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
                  <Coins className="h-7 w-7 text-neon-cyan" />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-mono font-bold text-white">
                    {SIGNUP_BONUS.toLocaleString()}
                    <span className="text-sm text-muted-foreground ml-1 font-normal">$PICKS</span>
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    ≈ ${usdValue} USD · Sign-up bonus
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Every new player gets <strong className="text-neon-cyan">33,333 $PICKS</strong> free.
                Use them to stake on predictions for extra rewards — or play for free with points only.
              </p>
            </div>

            {/* Right: How to use */}
            <div className="p-6 sm:p-8">
              <p className="text-[10px] uppercase tracking-widest text-neon-gold/70 font-bold mb-4">
                Use $PICKS for predicting
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Target,
                    title: "Stake on picks",
                    desc: "Lock $PICKS when making a prediction. Correct picks earn proportional payouts from the pool.",
                  },
                  {
                    icon: Zap,
                    title: "Live betting",
                    desc: "Use $PICKS in live sessions — bet on flash outcomes as the show airs. Min 333 $PICKS per bet.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neon-gold/10 border border-neon-gold/20">
                      <item.icon className="h-4 w-4 text-neon-gold" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Link href="/auth/signin" className="inline-block mt-4">
                <NeonButton variant="primary" className="gap-2 text-sm">
                  Get your 33,333 $PICKS free
                  <Coins className="h-3.5 w-3.5" />
                </NeonButton>
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
