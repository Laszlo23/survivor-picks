"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Coins, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import { NeonButton } from "@/components/ui/neon-button";
import { BuyPicksModal } from "@/components/wallet/buy-picks-modal";

export function LandingTokenSale() {
  const [buyOpen, setBuyOpen] = useState(false);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <FadeIn>
          <div className="mb-3 flex items-center gap-3">
            <LowerThird label="FAIR LAUNCH" value="$PICKS Token" />
            <span className="font-mono text-2xl sm:text-3xl font-bold text-neon-gold/30 tracking-widest">333</span>
          </div>
          <p className="text-sm text-muted-foreground mb-10 max-w-xl">
            The 333 model — every number matters. Buy $PICKS with your credit card,
            no wallet required. Tokens convert 1:1 on-chain at fair launch.
          </p>
        </FadeIn>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl border border-white/[0.08] bg-studio-dark/80 backdrop-blur-sm overflow-hidden"
        >
          {/* Glow accent */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-neon-cyan/5 blur-[80px] pointer-events-none" />

          <div className="relative p-6 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              {/* Left: pricing + CTA */}
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-gold/10 border border-neon-gold/20">
                  <Sparkles className="h-3.5 w-3.5 text-neon-gold" />
                  <span className="text-xs font-bold text-neon-gold">
                    The 333 Fair Launch
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-bold font-mono text-white">
                      $0.00<span className="text-neon-gold">333</span>
                    </span>
                    <span className="text-lg text-muted-foreground">/ $PICKS</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sign up free — get{" "}
                    <span className="text-neon-cyan font-bold">33,333 $PICKS</span>{" "}
                    instantly. Buy more anytime with Stripe. Every 3 matters.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <NeonButton
                    variant="primary"
                    href="/auth/signin"
                    className="gap-2 px-8 py-3 text-base"
                  >
                    Sign Up Free
                    <ArrowRight className="h-4 w-4" />
                  </NeonButton>
                  <button
                    onClick={() => setBuyOpen(true)}
                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 text-neon-cyan text-sm font-bold hover:bg-neon-cyan/10 transition-colors"
                  >
                    <CreditCard className="h-4 w-4" />
                    Buy $PICKS
                  </button>
                </div>
              </div>

              {/* Right: benefits */}
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: CreditCard,
                    title: "Pay with Card",
                    desc: "Stripe-powered checkout. Visa, Mastercard, Apple Pay.",
                  },
                  {
                    icon: Coins,
                    title: "Internal Wallet",
                    desc: "Tokens credited instantly. No gas fees, no seed phrases.",
                  },
                  {
                    icon: Shield,
                    title: "1:1 On-Chain",
                    desc: "Every internal $PICKS converts to on-chain tokens at launch.",
                  },
                  {
                    icon: Zap,
                    title: "Use Immediately",
                    desc: "Stake on predictions, earn rewards, climb the leaderboard.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 + i * 0.08 }}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                  >
                    <item.icon className="h-5 w-5 text-neon-cyan mb-2" />
                    <p className="text-sm font-bold text-white mb-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <BuyPicksModal open={buyOpen} onClose={() => setBuyOpen(false)} />
    </>
  );
}
