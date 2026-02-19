"use client";

import { FadeIn } from "@/components/motion";
import { NeonButton } from "@/components/ui/neon-button";
import { ArrowRight, Rocket, Shield, ExternalLink } from "lucide-react";

export default function ContractsPage() {
  return (
    <div className="min-h-screen bg-studio-black pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-studio-black to-studio-black" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-neon-cyan/5 rounded-full blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-4 pt-20 pb-12 text-center">
          <FadeIn>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
              Smart{" "}
              <span className="text-gradient-cyan">Contracts</span>
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Our smart contracts are being redesigned and will be redeployed
              on Base. Stay tuned for the new architecture.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 mt-12">
        <FadeIn>
          <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 sm:p-12 text-center overflow-hidden">
            {/* Decorative glow */}
            <div
              className="absolute -top-16 -right-16 w-48 h-48 bg-neon-cyan/5 rounded-full blur-[80px] pointer-events-none"
              aria-hidden
            />

            <div className="relative">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
                  <Rocket className="h-8 w-8 text-neon-cyan" />
                </div>
              </div>

              <h2 className="font-headline text-2xl sm:text-3xl font-extrabold uppercase tracking-tight mb-3 text-white">
                New Contracts Coming Soon
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto mb-4">
                We&apos;re rebuilding our entire smart contract suite from the
                ground up — optimized for gas efficiency, security, and the
                full RealityPicks prediction engine.
              </p>

              <div className="grid gap-3 sm:grid-cols-3 mt-8 mb-8">
                {[
                  {
                    icon: Shield,
                    title: "Audited",
                    desc: "Full security audit before deployment",
                  },
                  {
                    icon: Rocket,
                    title: "Optimized",
                    desc: "Gas-efficient design on Base L2",
                  },
                  {
                    icon: Shield,
                    title: "Verified",
                    desc: "Open source & verified on BaseScan",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
                  >
                    <item.icon className="h-5 w-5 text-neon-cyan mx-auto mb-2" />
                    <p className="text-xs font-bold text-white mb-0.5">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <NeonButton variant="primary" href="/invest" className="gap-2">
                  Investor Info <ArrowRight className="h-4 w-4" />
                </NeonButton>
                <NeonButton variant="ghost" href="/tokenomics" className="gap-2">
                  View Tokenomics <ExternalLink className="h-4 w-4" />
                </NeonButton>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
