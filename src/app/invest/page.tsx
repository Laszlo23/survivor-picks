"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, AnimatedCounter } from "@/components/motion";
import { NeonButton } from "@/components/ui/neon-button";
import {
  ArrowRight,
  TrendingUp,
  Users,
  Tv,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Rocket,
  Mail,
  ExternalLink,
  ChevronDown,
  Coins,
  Target,
  Sparkles,
  Building2,
  Handshake,
  Crown,
} from "lucide-react";

const TRACTION = [
  { label: "Community Members", value: 3200, suffix: "+", icon: Users, color: "text-neon-cyan", accent: "hsl(185 100% 55%)" },
  { label: "Predictions Made", value: 18400, suffix: "+", icon: Target, color: "text-neon-magenta", accent: "hsl(320 100% 60%)" },
  { label: "Shows Covered", value: 12, suffix: "", icon: Tv, color: "text-neon-gold", accent: "hsl(45 100% 55%)" },
  { label: "Countries Reached", value: 47, suffix: "+", icon: Globe, color: "text-violet-400", accent: "hsl(270 80% 65%)" },
];

const MARKET_POINTS = [
  {
    stat: "$850B+",
    label: "Global Reality TV & Entertainment Market",
    desc: "Reality TV alone generates $20B+ annually — yet prediction markets for entertainment remain untapped.",
  },
  {
    stat: "500M+",
    label: "Weekly Reality TV Viewers Worldwide",
    desc: "From Survivor to The Bachelor, Love Island to Big Brother — a massive global audience with no native prediction product.",
  },
  {
    stat: "$3.2T",
    label: "Projected Prediction Market Size by 2030",
    desc: "Polymarket proved demand. RealityPicks captures a vertical no one else is building for.",
  },
];

const REVENUE_STREAMS = [
  { icon: BarChart3, title: "Platform Fee (3%)", desc: "Applied to every prediction pool payout — sustainable, recurring revenue from day one." },
  { icon: Coins, title: "Season Pass Sales", desc: "Premium access tiers unlock exclusive markets, boosted multipliers, and early access to new shows." },
  { icon: Zap, title: "Live Betting (In Dev)", desc: "AI-powered real-time betting during live episodes — high engagement, high volume." },
  { icon: Sparkles, title: "NFT Collections", desc: "Tiered collectible badges and prediction achievement NFTs with secondary market royalties." },
  { icon: Building2, title: "Brand Partnerships", desc: "Co-branded prediction markets with networks and streaming platforms." },
  { icon: TrendingUp, title: "Smart TV Distribution", desc: "Native apps for Smart TV platforms — bringing predictions directly to the second screen." },
];

const PARTNER_TIERS = [
  {
    tier: "Strategic Partner",
    color: "border-neon-cyan/30",
    accent: "text-neon-cyan",
    bg: "from-neon-cyan/5 to-transparent",
    features: [
      "Co-branded prediction markets",
      "Custom show integration",
      "Revenue sharing model",
      "Joint marketing campaigns",
      "API access for data feeds",
    ],
  },
  {
    tier: "Investor",
    color: "border-neon-gold/30",
    accent: "text-neon-gold",
    bg: "from-neon-gold/5 to-transparent",
    features: [
      "Token allocation at preferential terms",
      "Board advisory role",
      "Quarterly performance reports",
      "Early access to new verticals",
      "Network introductions",
    ],
  },
  {
    tier: "Media & Network",
    color: "border-neon-magenta/30",
    accent: "text-neon-magenta",
    bg: "from-neon-magenta/5 to-transparent",
    features: [
      "Licensed prediction markets for your shows",
      "Viewer engagement analytics",
      "White-label integration option",
      "Cross-promotion to 3K+ community",
      "Smart TV app distribution",
    ],
  },
];

const FAQ = [
  {
    q: "What stage is RealityPicks at?",
    a: "We're live on Base mainnet with Survivor 2026 predictions active. The platform has 3,200+ community members, a live token ($PICKS), and an AI-powered live betting feature in development. We're pre-Series A, seeking strategic partners and investors to scale to multi-show, multi-platform.",
  },
  {
    q: "What is the token situation?",
    a: "$PICKS is an ERC-20 token fair-launched via Clanker on Base. Total supply: 1B. 45% in Uniswap V4 LP, 50% vaulted for team/community, 5% airdrop. No VC pre-sale. Deflationary via buyback-and-burn mechanics from the 3% platform fee.",
  },
  {
    q: "How does RealityPicks make money?",
    a: "Primary revenue comes from the 3% platform fee on prediction pool payouts. Secondary streams include Season Pass sales, NFT royalties, brand partnerships, and upcoming Smart TV app distribution. All revenue is on-chain and verifiable.",
  },
  {
    q: "What's the competitive moat?",
    a: "First-mover in entertainment prediction markets. Purpose-built for reality TV (not a Polymarket fork). AI-powered live betting creates a real-time engagement layer no competitor has. Community-driven with onchain reputation. Smart TV distribution strategy targets 1.7B connected TV devices.",
  },
  {
    q: "What's the Smart TV strategy?",
    a: "We're building native apps for Smart TV platforms (Samsung Tizen, LG webOS, Android TV, Apple TV). Predictions appear as an overlay while watching — turning every viewer into a player without leaving their couch. This is the ultimate second-screen experience, built into the first screen.",
  },
  {
    q: "Who is the team?",
    a: "Founded by 0xlaszlo (Laszlo Bihary), a 20-year veteran of internet startups, Web3 protocols, and community building. Active across Farcaster, Lens, Guild.xyz, and the broader onchain ecosystem. Read the full story in our Whitepaper.",
  },
];

export default function InvestPage() {
  return (
    <div className="min-h-screen bg-studio-black pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-gold/[0.04] via-studio-black to-studio-black" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-neon-gold/8 rounded-full blur-[120px]" />
        <div className="absolute top-20 right-1/4 w-[300px] h-[200px] bg-violet-500/5 rounded-full blur-[80px]" />

        <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-14 text-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 rounded-full bg-neon-gold/10 border border-neon-gold/20 px-4 py-1.5 mb-6">
              <Handshake className="h-3.5 w-3.5 text-neon-gold" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-neon-gold">
                Investor & Partner Relations
              </span>
            </div>

            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight mb-5">
              Build the Future of{" "}
              <span className="text-gradient-cyan block sm:inline">
                Entertainment Predictions
              </span>
            </h1>

            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
              RealityPicks is the first decentralized prediction platform for reality TV —
              live on Base, powered by AI, targeting the $850B entertainment market and
              1.7B Smart TV devices worldwide.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <NeonButton variant="primary" href="#contact" className="gap-2 px-8">
                Get In Touch <ArrowRight className="h-4 w-4" />
              </NeonButton>
              <NeonButton variant="ghost" href="/whitepaper" className="gap-2 px-8">
                Read Whitepaper <ExternalLink className="h-4 w-4" />
              </NeonButton>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* Traction */}
        <FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12">
            {TRACTION.map((t) => (
              <div
                key={t.label}
                className="relative p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${t.accent}, transparent 70%)` }}
                  aria-hidden
                />
                <t.icon className={`h-5 w-5 mx-auto mb-2 ${t.color}`} />
                <AnimatedCounter
                  value={t.value}
                  suffix={t.suffix}
                  duration={1.4}
                  className={`font-headline text-2xl sm:text-3xl font-extrabold ${t.color}`}
                />
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                  {t.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Market Opportunity */}
        <FadeIn>
          <section className="mt-20">
            <SectionTitle icon={TrendingUp} title="Market Opportunity" />
            <div className="grid gap-4 sm:grid-cols-3 mt-8">
              {MARKET_POINTS.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                >
                  <p className="font-headline text-2xl sm:text-3xl font-extrabold text-neon-cyan mb-1">
                    {m.stat}
                  </p>
                  <p className="text-sm font-bold text-white mb-2">{m.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {m.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Revenue Model */}
        <FadeIn>
          <section className="mt-20">
            <SectionTitle icon={Coins} title="Revenue Streams" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-8">
              {REVENUE_STREAMS.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                >
                  <r.icon className="h-5 w-5 text-neon-gold mb-3" />
                  <h3 className="text-sm font-bold text-white mb-1">{r.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {r.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Competitive Edge */}
        <FadeIn>
          <section className="mt-20">
            <SectionTitle icon={Shield} title="Why RealityPicks" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                { title: "First Mover", desc: "No one is building prediction markets specifically for entertainment and reality TV. We own the category.", accent: "border-l-neon-cyan/50" },
                { title: "AI-Powered Live Betting", desc: "Gemini AI analyzes live video feeds to generate real-time bets with dynamic odds — a technology moat.", accent: "border-l-neon-magenta/50" },
                { title: "Smart TV Strategy", desc: "Targeting 1.7B connected TV devices. Predictions as a native overlay — second screen built into the first screen.", accent: "border-l-neon-gold/50" },
                { title: "Onchain & Transparent", desc: "Built on Base. Every prediction, payout, and fee is verifiable onchain. Trust through transparency.", accent: "border-l-violet-500/50" },
                { title: "Community-First Growth", desc: "3,200+ members across Discord, Farcaster, and X. Organic, passionate, and growing through engagement — not ad spend.", accent: "border-l-neon-cyan/50" },
                { title: "Deflationary Tokenomics", desc: "Buyback-and-burn, staking locks, and season pass burns create sustained deflationary pressure on $PICKS.", accent: "border-l-neon-magenta/50" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -16 : 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className={`p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] border-l-[3px] ${item.accent}`}
                >
                  <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Roadmap */}
        <FadeIn>
          <section className="mt-20">
            <SectionTitle icon={Rocket} title="Growth Roadmap" />
            <div className="mt-8 relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/40 via-neon-magenta/40 to-neon-gold/40 hidden sm:block" />
              <div className="space-y-6">
                {[
                  { phase: "Now", label: "LIVE", color: "bg-neon-cyan text-studio-black", items: ["Survivor 2026 predictions active", "$PICKS token live on Base", "3,200+ community members", "NFT collection launched"] },
                  { phase: "Q2 2026", label: "SCALE", color: "bg-violet-500 text-white", items: ["Multi-show expansion (Survivor US, Traitors, Bachelor)", "Smart TV app beta (Samsung Tizen)", "AI live betting public launch", "Farcaster Mini App distribution"] },
                  { phase: "Q3 2026", label: "GROW", color: "bg-neon-magenta text-white", items: ["iOS & Android native apps", "Brand partnership launches", "Guild tournament system", "Creator tools for fan-made markets"] },
                  { phase: "2027", label: "DOMINATE", color: "bg-neon-gold text-studio-black", items: ["Smart TV multi-platform (LG, Apple TV, Android TV)", "International show expansion", "Decentralized governance via $PICKS", "Protocol licensing to third parties"] },
                ].map((phase, i) => (
                  <motion.div
                    key={phase.phase}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="sm:pl-10 relative"
                  >
                    <div className="hidden sm:flex absolute left-0 top-5 h-8 w-8 items-center justify-center rounded-full bg-studio-dark border-2 border-white/10 z-10">
                      <span className="text-[10px] font-bold text-white/60">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-headline text-lg font-bold text-white">{phase.phase}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${phase.color}`}>
                          {phase.label}
                        </span>
                      </div>
                      <ul className="grid gap-1.5 sm:grid-cols-2">
                        {phase.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-xs text-white/70">
                            <span className="text-neon-cyan mt-0.5 shrink-0">-</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Partnership Tiers */}
        <FadeIn>
          <section className="mt-20">
            <SectionTitle icon={Handshake} title="Partnership Tiers" />
            <div className="grid gap-4 sm:grid-cols-3 mt-8">
              {PARTNER_TIERS.map((p, i) => (
                <motion.div
                  key={p.tier}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`relative rounded-xl border ${p.color} bg-gradient-to-b ${p.bg} overflow-hidden`}
                >
                  <div className="p-5">
                    <h3 className={`font-headline text-lg font-bold uppercase tracking-wide mb-4 ${p.accent}`}>
                      {p.tier}
                    </h3>
                    <ul className="space-y-2.5">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-white/70">
                          <span className={`mt-0.5 shrink-0 ${p.accent}`}>+</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* FAQ */}
        <FadeIn>
          <section className="mt-20">
            <SectionTitle icon={Crown} title="Investor FAQ" />
            <div className="mt-8 space-y-2">
              {FAQ.map((item) => (
                <FAQItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </section>
        </FadeIn>

        {/* Contact CTA */}
        <FadeIn>
          <section id="contact" className="mt-20 scroll-mt-20">
            <div className="relative p-8 sm:p-10 rounded-2xl bg-gradient-to-br from-neon-gold/[0.06] via-studio-dark to-violet-950/20 border border-neon-gold/20 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-gold/5 rounded-full blur-[80px] pointer-events-none" aria-hidden />

              <div className="relative text-center">
                <div className="flex justify-center mb-5">
                  <div className="h-14 w-14 rounded-full bg-neon-gold/10 border border-neon-gold/20 flex items-center justify-center">
                    <Mail className="h-7 w-7 text-neon-gold" />
                  </div>
                </div>

                <h2 className="font-headline text-2xl sm:text-3xl font-extrabold uppercase tracking-tight mb-3">
                  Let&apos;s Build{" "}
                  <span className="text-gradient-cyan">Together</span>
                </h2>
                <p className="text-sm text-muted-foreground max-w-lg mx-auto mb-8">
                  Whether you&apos;re an investor, a TV network, a streaming platform,
                  or a brand looking to engage entertainment audiences — we want to hear from you.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <NeonButton
                    variant="primary"
                    className="gap-2 px-8"
                    onClick={() => {
                      window.location.href = "mailto:winning@realitypicks.net?subject=Partnership%20Inquiry%20-%20RealityPicks";
                    }}
                  >
                    <Mail className="h-4 w-4" /> Email Us
                  </NeonButton>
                  <NeonButton variant="secondary" href="https://warpcast.com/0xlaszlo" className="gap-2 px-8">
                    Farcaster <ExternalLink className="h-4 w-4" />
                  </NeonButton>
                  <NeonButton variant="ghost" href="https://x.com/laszloleonardo" className="gap-2 px-8">
                    X / Twitter <ExternalLink className="h-4 w-4" />
                  </NeonButton>
                </div>

                <p className="text-[11px] text-muted-foreground mt-6">
                  winning@realitypicks.net — Response within 24 hours
                </p>
              </div>
            </div>
          </section>
        </FadeIn>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof TrendingUp; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.08]">
        <Icon className="h-4.5 w-4.5 text-neon-cyan" />
      </div>
      <h2 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
        {title}
      </h2>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-sm font-medium text-white">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-white/[0.04] pt-3">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
