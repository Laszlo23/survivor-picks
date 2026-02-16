"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import { NeonButton } from "@/components/ui/neon-button";
import {
  ArrowRight,
  BookOpen,
  Flame,
  Users,
  Coins,
  Target,
  Map,
  User,
  ExternalLink,
  ChevronUp,
} from "lucide-react";

const CHAPTERS = [
  { id: "origin", num: "01", title: "The Origin", icon: Flame },
  { id: "vision", num: "02", title: "The Vision", icon: Target },
  { id: "community", num: "03", title: "The Community", icon: Users },
  { id: "token", num: "04", title: "The Token", icon: Coins },
  { id: "mechanics", num: "05", title: "The Mechanics", icon: Target },
  { id: "roadmap", num: "06", title: "The Roadmap", icon: Map },
  { id: "founder", num: "07", title: "The Founder", icon: User },
] as const;

export default function WhitepaperPage() {
  const [activeChapter, setActiveChapter] = useState("origin");

  return (
    <div className="min-h-screen bg-studio-black pb-24">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/30 via-studio-black to-studio-black" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/10 rounded-full blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-4 pt-20 pb-12 text-center">
          <FadeIn>
            <p className="text-xs font-mono uppercase tracking-[0.3em] text-violet-400 mb-4">
              Whitepaper v1.0 — February 2026
            </p>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
              The Story of{" "}
              <span className="text-gradient-cyan">RealityPicks</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              A whitepaper written not in spreadsheets, but in stories. How two decades
              of building, countless communities, and one obsession with reality TV
              created the first decentralized prediction platform for entertainment.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> By 0xlaszlo
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span>Base Network</span>
              <span className="w-px h-3 bg-white/20" />
              <span>Fair Launch</span>
            </div>
          </FadeIn>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 mt-8">
        {/* Chapter Nav */}
        <FadeIn>
          <nav className="sticky top-16 z-20 mb-12 p-3 rounded-xl bg-studio-dark/80 backdrop-blur-xl border border-white/[0.06] overflow-x-auto">
            <div className="flex gap-1 min-w-max">
              {CHAPTERS.map((ch) => (
                <a
                  key={ch.id}
                  href={`#${ch.id}`}
                  onClick={() => setActiveChapter(ch.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeChapter === ch.id
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                      : "text-muted-foreground hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-50">{ch.num}</span>
                  {ch.title}
                </a>
              ))}
            </div>
          </nav>
        </FadeIn>

        {/* Chapters */}
        <div className="space-y-20">
          {/* Chapter 01 */}
          <FadeIn>
            <section id="origin" className="scroll-mt-32">
              <ChapterHeader num="01" title="The Origin" subtitle="Two Decades of Building" />
              <div className="prose-section">
                <p>
                  Every revolution starts with someone who refuses to accept the status quo.
                  For Laszlo Bihary — known across the decentralized web as <strong className="text-white">0xlaszlo</strong> — that refusal
                  started over two decades ago, long before Ethereum existed, long before NFTs were a noun.
                </p>
                <p>
                  From the early days of the internet — building communities, shipping products,
                  breaking things and rebuilding them better — Laszlo watched the world slowly
                  wake up to the power of trustless systems. He was there when the first DAOs formed.
                  He minted when minting meant something. He built when building meant nobody was watching.
                </p>
                <p>
                  After 20 years of shipping products across Web2 and Web3, contributing to guilds on
                  Guild.xyz, participating in DAO governance on Snapshot and Tally, minting on Zora and
                  BasePaint, and nurturing communities on Farcaster and Lens — one obsession remained:
                  <em className="text-neon-cyan"> how do we make prediction markets fun, fair, and accessible to everyone?</em>
                </p>
                <p>That obsession became <strong className="text-white">RealityPicks</strong>.</p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 02 */}
          <FadeIn>
            <section id="vision" className="scroll-mt-32">
              <ChapterHeader num="02" title="The Vision" subtitle="Reality TV Meets DeFi" />
              <div className="prose-section">
                <p>
                  Reality TV is the world&apos;s most-watched entertainment format. Billions tune in weekly to
                  scream at their screens — &ldquo;She&apos;s getting eliminated!&rdquo; &ldquo;He&apos;s winning immunity!&rdquo;
                  &ldquo;That alliance is doomed!&rdquo; — yet there&apos;s never been a way to put real conviction behind those calls.
                </p>
                <p>
                  <strong className="text-white">Until now.</strong> RealityPicks is the first decentralized prediction platform
                  purpose-built for reality television. Not another generic betting platform. Not a fork of Polymarket
                  with a TV skin. A ground-up, community-driven protocol designed around the drama, the twists,
                  the tribal councils, the rose ceremonies.
                </p>
                <p>
                  We&apos;re building at the intersection of entertainment and decentralized finance — where every
                  episode is a market, every prediction is a position, and every viewer becomes a player.
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 03 */}
          <FadeIn>
            <section id="community" className="scroll-mt-32">
              <ChapterHeader num="03" title="The Community" subtitle="Guilds, DAOs and Tribes" />
              <div className="prose-section">
                <p>
                  RealityPicks isn&apos;t built by a faceless corporation. It&apos;s built by a community of degens, dreamers,
                  and reality TV addicts who believe the future of entertainment is participatory.
                </p>
                <p>
                  Our roots run deep in Web3&apos;s most vibrant communities. From Guild.xyz memberships to Farcaster
                  channels, from Lens protocol conversations to DAO governance participation — the RealityPicks
                  community was forged in the same decentralized fire that built the rest of the onchain world.
                </p>
                <p>
                  We believe in <strong className="text-neon-magenta">tribes</strong>. Season-based guilds where members compete together,
                  share strategies, and earn collective rewards. Think of it as Survivor alliances — but for
                  prediction markets. Every season, new guilds form, compete for the leaderboard crown, and
                  dissolve only to reform stronger.
                </p>
                <p>
                  Our Discord is already home to hundreds of reality TV prediction enthusiasts. The guild system,
                  powered by onchain reputation and $PICKS staking tiers, creates a meritocracy where skill and
                  community loyalty are rewarded — not just capital.
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 04 */}
          <FadeIn>
            <section id="token" className="scroll-mt-32">
              <ChapterHeader num="04" title="The Token" subtitle="$PICKS on Base" />
              <div className="prose-section">
                <p>
                  At the heart of the ecosystem sits <strong className="text-neon-cyan">$PICKS</strong> — an ERC-20 token
                  launched via Clanker on the Base network. Total supply:{" "}
                  <span className="font-mono text-white">1,000,000,000</span>. No VC allocation. No insider pre-sale.
                  Fair launch, community first.
                </p>
                <p>
                  45% flows directly into Uniswap V4 LP — the lifeblood of liquidity. 50% is vaulted for the team
                  and community, unlocked on a transparent schedule. The remaining 5% is reserved for airdrop to
                  early supporters who believed before launch.
                </p>
                <p>
                  The deflationary mechanics are built into the DNA: a portion of every 3% platform fee is used
                  for buyback-and-burn, permanently reducing supply. Season Pass purchases burn tokens. Staking
                  vaults lock supply while rewarding holders with boosted prediction multipliers up to 1.5x.
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 05 */}
          <FadeIn>
            <section id="mechanics" className="scroll-mt-32">
              <ChapterHeader num="05" title="The Mechanics" subtitle="Predict, Stake, Win" />
              <div className="prose-section">
                <p>
                  The game is elegantly simple. Connect your wallet. Pick a show. Make your prediction. If you&apos;re
                  right, you earn points and climb the leaderboard. If you&apos;re wrong, you learn and come back harder.
                </p>
                <p>
                  But simplicity doesn&apos;t mean shallow. Dynamic odds adjust based on community predictions — early
                  conviction gets better prices. <strong className="text-neon-gold">Streak bonuses</strong> multiply your rewards for
                  consecutive correct predictions. <strong className="text-neon-magenta">Risk Bets</strong> offer higher multipliers for harder calls.
                  <strong className="text-neon-cyan"> Immunity Jokers</strong> — limited per season — let you survive a wrong pick and still
                  earn base points.
                </p>
                <p>
                  Every mechanic is designed to reward skill, consistency, and bold conviction. This isn&apos;t gambling — it&apos;s a
                  skill-based prediction game where knowledge of the shows genuinely matters.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Base correct pick", value: "100 pts", color: "text-neon-cyan" },
                    { label: "Odds multiplier", value: "up to 3x", color: "text-neon-cyan" },
                    { label: "Risk Bet bonus", value: "1.5x", color: "text-neon-magenta" },
                    { label: "Joker save", value: "100 pts", color: "text-neon-gold" },
                    { label: "Streak bonus", value: "+25 pts/ep", color: "text-neon-gold" },
                    { label: "Staking boost", value: "up to 1.5x", color: "text-violet-400" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-sm text-white/70">{item.label}</span>
                      <span className={`font-mono text-sm font-bold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 06 */}
          <FadeIn>
            <section id="roadmap" className="scroll-mt-32">
              <ChapterHeader num="06" title="The Roadmap" subtitle="Where We're Going" />
              <div className="prose-section">
                <div className="space-y-6">
                  {[
                    {
                      phase: "Phase 1",
                      label: "LIVE",
                      color: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
                      items: [
                        "Survivor 2026: All Star predictions live on TV8",
                        "Global leaderboard tracking best predictors",
                        "NFT collection — Early Supporter to Legend tier",
                        "$PICKS token on Base via Clanker",
                        "Staking vault with tier-based multipliers",
                      ],
                    },
                    {
                      phase: "Phase 2",
                      label: "NEXT",
                      color: "bg-violet-500/20 text-violet-400 border-violet-500/30",
                      items: [
                        "Multi-show expansion (Survivor US, Traitors, Bachelor)",
                        "Mobile-first PWA for instant access",
                        "Guild system with seasonal tournaments",
                        "Farcaster Mini App integration",
                      ],
                    },
                    {
                      phase: "Phase 3",
                      label: "FUTURE",
                      color: "bg-neon-magenta/20 text-neon-magenta border-neon-magenta/30",
                      items: [
                        "Creator tools for fan-made prediction markets",
                        "Influencer partnerships and co-branded shows",
                        "Cross-chain expansion beyond Base",
                      ],
                    },
                    {
                      phase: "Phase 4",
                      label: "ENDGAME",
                      color: "bg-neon-gold/20 text-neon-gold border-neon-gold/30",
                      items: [
                        "Fully decentralized governance via $PICKS voting",
                        "Community-owned protocol",
                        "On-chain show scheduling and resolution",
                      ],
                    },
                  ].map((phase) => (
                    <div key={phase.phase} className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-headline font-bold text-white">{phase.phase}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${phase.color}`}>
                          {phase.label}
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {phase.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                            <span className="text-neon-cyan mt-1 shrink-0">-</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 07 */}
          <FadeIn>
            <section id="founder" className="scroll-mt-32">
              <ChapterHeader num="07" title="The Founder" subtitle="0xlaszlo" />
              <div className="prose-section">
                <p>
                  Laszlo Bihary has spent two decades at the frontier of technology and community. From
                  early internet startups to Web3 protocols, his journey spans the entire evolution of the digital age.
                </p>
                <p>
                  Active on Farcaster as <strong className="text-neon-cyan">0xlaszlo</strong>, on Lens as poker4me.lens,
                  on X as laszloleonardo — verified across platforms. A quiet builder in a noisy space.
                </p>
                <p>
                  His wallet — <code className="text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">
                  0xa820...4709</code> — tells a story that no resume can: years of minting, voting, staking,
                  governing, and building across the decentralized web. Every transaction is a chapter.
                  Every smart contract interaction is a paragraph in a story that led, inevitably, to RealityPicks.
                </p>
                <div className="mt-6">
                  <a
                    href="https://web3.bio/0xa82082380585489b0456e15343c23809bc334709"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                  >
                    View Onchain Identity <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </section>
          </FadeIn>
        </div>

        {/* Bottom CTA */}
        <FadeIn>
          <div className="mt-20 text-center p-8 rounded-2xl bg-gradient-to-br from-violet-950/40 to-fuchsia-950/40 border border-violet-500/20">
            <h3 className="font-headline text-2xl font-bold uppercase mb-2">
              Ready to Write Your Own Chapter?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Join the community. Make your first prediction. Become part of the story.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <NeonButton variant="primary" href="/dashboard" className="gap-2">
                Start Predicting <ArrowRight className="h-4 w-4" />
              </NeonButton>
              <NeonButton variant="ghost" href="https://discord.gg/Km7Tw6jHhk" className="gap-2">
                Join Discord <ExternalLink className="h-4 w-4" />
              </NeonButton>
            </div>
          </div>
        </FadeIn>

        {/* Back to top */}
        <div className="mt-8 text-center">
          <a href="#" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors">
            <ChevronUp className="h-3.5 w-3.5" /> Back to top
          </a>
        </div>
      </div>

      <style jsx>{`
        .prose-section {
          margin-top: 1.5rem;
        }
        .prose-section p {
          color: hsl(220 15% 70%);
          font-size: 0.9375rem;
          line-height: 1.8;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
}

function ChapterHeader({ num, title, subtitle }: { num: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-4 pb-4 border-b border-white/[0.06]">
      <span className="font-mono text-5xl font-black text-white/[0.06]">{num}</span>
      <div>
        <h2 className="font-headline text-2xl sm:text-3xl font-bold uppercase tracking-wide text-white">
          {title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
