"use client";

import { useState } from "react";
import { FadeIn } from "@/components/motion";
import { NeonButton } from "@/components/ui/neon-button";
import {
  ArrowRight,
  Flame,
  Users,
  Coins,
  Target,
  Map,
  User,
  ExternalLink,
  ChevronUp,
  Tv,
  CreditCard,
  Sparkles,
  Zap,
  Radio,
} from "lucide-react";

const CHAPTERS = [
  { id: "origin", num: "01", title: "The Origin", icon: Flame },
  { id: "333", num: "02", title: "The 333", icon: Sparkles },
  { id: "vision", num: "03", title: "The Vision", icon: Target },
  { id: "stripe", num: "04", title: "The Stripe", icon: CreditCard },
  { id: "token", num: "05", title: "The Token", icon: Coins },
  { id: "engine", num: "06", title: "The Engine", icon: Zap },
  { id: "community", num: "07", title: "The Community", icon: Users },
  { id: "live", num: "08", title: "The Live", icon: Radio },
  { id: "roadmap", num: "09", title: "The Roadmap", icon: Map },
  { id: "founders", num: "10", title: "The Founders", icon: Users },
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
              Whitepaper v2.0 — February 2026
            </p>
            <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
              The Story of{" "}
              <span className="text-gradient-cyan">RealityPicks</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              A whitepaper written not in spreadsheets, but in stories. How three builders
              who were always in the office, the power of 333, and one shared obsession with
              reality TV created the first decentralized prediction platform for entertainment
              — with Stripe at its heart.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> By Laszlo, Aiman &amp; Emilio
              </span>
              <span className="w-px h-3 bg-white/20" />
              <span>staffone.site</span>
              <span className="w-px h-3 bg-white/20" />
              <span>333 Philosophy</span>
              <span className="w-px h-3 bg-white/20" />
              <span>Stripe Powered</span>
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

          {/* Chapter 01: The Origin */}
          <FadeIn>
            <section id="origin" className="scroll-mt-32">
              <ChapterHeader num="01" title="The Origin" subtitle="Three Who Refused to Sit Still" />
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
                  But the real spark didn&apos;t come from a whiteboard or a pitch deck. It came from the office.
                  Three people — always the same three — who were always the first to arrive and the last to leave.
                  <strong className="text-white"> Laszlo Bihary</strong>,{" "}
                  <strong className="text-neon-cyan">Aiman El Boujamai</strong>, and{" "}
                  <strong className="text-neon-magenta">Emilio Dimitri Dik</strong>. Late nights turning into early mornings.
                  Coffee turning into code. Ideas scribbled on whiteboards turning into shipped products.
                </p>
                <p>
                  They didn&apos;t plan to build RealityPicks. They were just vibing — talking about what was broken
                  in entertainment, in crypto, in how people interact with the shows they love. Aiman brought
                  the operational discipline. Emilio brought the creative fire. Laszlo brought the two decades
                  of building and the Web3 conviction. Together, under the banner of{" "}
                  <a href="https://staffone.site" target="_blank" rel="noopener noreferrer" className="text-neon-gold hover:text-neon-gold/80 font-bold transition-colors">
                    staffone.site
                  </a>
                  , they were already a team — fully committed, fully aligned, fully in the zone.
                </p>
                <p>
                  After 20 years of shipping products across Web2 and Web3, contributing to guilds on
                  Guild.xyz, participating in DAO governance on Snapshot and Tally, minting on Zora and
                  BasePaint, and nurturing communities on Farcaster and Lens — one obsession remained:
                  <em className="text-neon-cyan"> how do we make prediction markets fun, fair, and accessible to everyone?</em>
                </p>
                <p>That obsession — born in the late-night sessions of those three always in the office — became <strong className="text-white">RealityPicks</strong>.</p>
                <p>
                  But this time, it wouldn&apos;t just be built differently. It would be built on a philosophy —
                  a number that kept appearing at every turning point, in every alignment, in every sign that
                  said <em className="text-neon-gold">&ldquo;keep going.&rdquo;</em> And it would be built by three.
                  Because of course it would.
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 02: The 333 */}
          <FadeIn>
            <section id="333" className="scroll-mt-32">
              <ChapterHeader num="02" title="The 333" subtitle="Alignment, Architecture, and a Sacred Number" />
              <div className="prose-section">
                <p>
                  <strong className="text-neon-gold font-headline text-lg">333</strong> isn&apos;t just a number.
                  It&apos;s the architecture of everything we build. In numerology, 333 represents creative expression,
                  growth, and the courage to manifest what you envision. For RealityPicks, it became the DNA of the
                  entire protocol.
                </p>
                <p>
                  Three pillars. Three tiers. Three layers. Everything in threes — because the best stories
                  have three acts, the best games have three phases, and the best communities are built on three
                  core values: <strong className="text-neon-cyan">transparency</strong>,{" "}
                  <strong className="text-neon-magenta">participation</strong>, and{" "}
                  <strong className="text-neon-gold">reward</strong>.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { num: "3", title: "Pillars", desc: "Predict, Play, Earn — the three actions that define every user journey.", color: "border-l-neon-cyan/50" },
                    { num: "33", title: "Shows by Year 2", desc: "33 reality TV shows across global markets — from Survivor to Love Island to Big Brother.", color: "border-l-neon-magenta/50" },
                    { num: "333", title: "The Alignment", desc: "The sacred number that guides our tokenomics, our milestones, and our community thresholds.", color: "border-l-neon-gold/50" },
                  ].map((item) => (
                    <div key={item.title} className={`p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] border-l-[3px] ${item.color}`}>
                      <span className="font-headline text-2xl font-extrabold text-white/10">{item.num}</span>
                      <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-6">
                  The first milestone is <strong className="text-neon-gold">1,333.33</strong> — the seed capital
                  that triggers the full smart contract redeployment. Not a random number. A deliberate alignment
                  that says: <em>we build when the universe says build.</em> Every major protocol threshold
                  follows the 333 pattern: 3,333 community members unlocks governance. 33,333 $PICKS staked
                  unlocks the highest prediction multiplier. 333,333 total predictions triggers the first
                  community airdrop.
                </p>
                <p>
                  This isn&apos;t superstition. It&apos;s <strong className="text-white">intentional design</strong>.
                  When your architecture follows a pattern, your community recognizes it. They feel it. They become
                  part of it. And that&apos;s when a protocol becomes a movement.
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 03: The Vision */}
          <FadeIn>
            <section id="vision" className="scroll-mt-32">
              <ChapterHeader num="03" title="The Vision" subtitle="Reality TV Meets the Future" />
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
                  But we&apos;re not just building for crypto natives. We&apos;re building for the <strong className="text-white">1.7 billion
                  Smart TV devices</strong> in living rooms worldwide. We&apos;re building for the grandmother in Istanbul
                  who votes for her favourite Survivor contestant every week. We&apos;re building for the college student
                  in Lagos watching Love Island on their phone. We&apos;re building for <em className="text-neon-cyan">everyone</em>.
                </p>
                <p>
                  That&apos;s why we integrated <strong className="text-white">Stripe</strong>. That&apos;s why we made predictions free to start.
                  That&apos;s why the first thing you see isn&apos;t a wallet connect button — it&apos;s a show, a question,
                  and a big shiny button that says <em className="text-neon-gold">&ldquo;Make Your Pick.&rdquo;</em>
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 04: The Stripe */}
          <FadeIn>
            <section id="stripe" className="scroll-mt-32">
              <ChapterHeader num="04" title="The Stripe" subtitle="Where Web2 Meets Web3" />
              <div className="prose-section">
                <p>
                  Most crypto projects fail at onboarding. They ask users to install MetaMask, buy ETH on
                  an exchange, bridge to L2, approve a token, and <em>then</em> interact with the product.
                  That&apos;s not onboarding. That&apos;s an obstacle course.
                </p>
                <p>
                  RealityPicks takes the opposite approach. <strong className="text-neon-cyan">Stripe</strong> is our
                  bridge between the world people know and the world we&apos;re building. Credit card. Apple Pay.
                  Google Pay. Bank transfer. If you can buy something on Amazon, you can buy $PICKS. No seed
                  phrases required.
                </p>
                <p>
                  Stripe handles the fiat on-ramp — converting EUR, USD, GBP, and 135+ currencies directly
                  into $PICKS tokens deposited into a custodial wallet. Users who want full self-custody can
                  connect their own wallet anytime. Users who just want to predict can stay in the simple flow.
                  <strong className="text-white"> Both paths are first-class citizens.</strong>
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {[
                    { title: "Fiat On-Ramp", desc: "Buy $PICKS with credit card, Apple Pay, Google Pay, or bank transfer via Stripe.", color: "text-neon-cyan" },
                    { title: "Season Pass", desc: "Purchase Season Passes for premium markets and boosted multipliers — paid in EUR or crypto.", color: "text-neon-magenta" },
                    { title: "Instant Payout", desc: "Cash out winnings to your bank account via Stripe Connect. No exchange needed.", color: "text-neon-gold" },
                  ].map((item) => (
                    <div key={item.title} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <h4 className={`text-sm font-bold ${item.color} mb-1`}>{item.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="mt-6">
                  And then there&apos;s the <strong className="text-neon-gold">Stripe NFT</strong>. Minted on Farcaster as
                  the first artifact of this philosophy — a collectible that represents the bridge itself.
                  The Stripe NFT is a statement: <em>we believe the future of finance is invisible</em>. The best
                  payment experience is the one you don&apos;t notice. Just like the best prediction platform is the
                  one where you forget you&apos;re using blockchain and just enjoy the game.
                </p>
                <p>
                  The Stripe NFT holders receive permanent perks: reduced platform fees (2% instead of 3%),
                  early access to new show markets, and voting rights on which payment methods to integrate next.
                  It&apos;s not just art — it&apos;s <strong className="text-white">a key to the kingdom</strong>.
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 05: The Token */}
          <FadeIn>
            <section id="token" className="scroll-mt-32">
              <ChapterHeader num="05" title="The Token" subtitle="$PICKS — Redesigned for 333" />
              <div className="prose-section">
                <p>
                  At the heart of the ecosystem sits <strong className="text-neon-cyan">$PICKS</strong> — an ERC-20 token
                  on the Base network. The token is being <strong className="text-white">redeployed</strong> with a new
                  architecture built around the 333 philosophy. New contracts. New distribution. Same community-first ethos.
                </p>
                <p>
                  The redeployment triggers at <strong className="text-neon-gold">1,333.33</strong> in seed capital — a
                  deliberate milestone that aligns with our core number. When that threshold is crossed, the full
                  smart contract suite goes live: prediction engine, staking vault, season pass, badge NFTs, and the
                  Stripe payment bridge.
                </p>

                <div className="mt-6 space-y-3">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">New Token Allocation</h4>
                  <div className="flex h-8 rounded-full overflow-hidden border border-white/[0.06]">
                    {[
                      { pct: 33.3, color: "bg-neon-cyan", label: "Liquidity" },
                      { pct: 33.3, color: "bg-violet-500", label: "Community" },
                      { pct: 33.3, color: "bg-neon-gold", label: "Ecosystem" },
                    ].map((a) => (
                      <div
                        key={a.label}
                        className={`${a.color} relative group transition-all`}
                        style={{ width: `${a.pct}%` }}
                        title={`${a.label}: ${a.pct}%`}
                      >
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                          {a.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Liquidity Pool", pct: "33.3%", amount: "~333M", desc: "DEX liquidity on Uniswap V4 — deep, permanent, community-owned.", color: "text-neon-cyan", dot: "bg-neon-cyan" },
                      { label: "Community & Rewards", pct: "33.3%", amount: "~333M", desc: "Prediction rewards, airdrops, guild tournaments, streak bonuses, and the 333,333 prediction airdrop.", color: "text-violet-400", dot: "bg-violet-500" },
                      { label: "Ecosystem & Team", pct: "33.3%", amount: "~333M", desc: "Development, partnerships, Stripe integration costs, Smart TV apps, and team vesting (3-year linear).", color: "text-neon-gold", dot: "bg-neon-gold" },
                    ].map((a) => (
                      <div key={a.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`h-2.5 w-2.5 rounded-full ${a.dot}`} />
                          <span className={`text-sm font-bold ${a.color}`}>{a.label} — {a.pct}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-1">{a.amount} tokens</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-6">
                  The deflationary mechanics remain: a portion of every 3% platform fee (2% for Stripe NFT holders)
                  is used for buyback-and-burn. Season Pass purchases burn tokens. Staking vaults lock supply while
                  rewarding holders with boosted prediction multipliers up to <strong className="text-neon-gold">3.33x</strong>.
                </p>
                <p>
                  Total supply: <span className="font-mono text-white">999,999,999</span> — because even the supply
                  follows the rule of threes.
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 06: The Engine */}
          <FadeIn>
            <section id="engine" className="scroll-mt-32">
              <ChapterHeader num="06" title="The Engine" subtitle="Predict, Play, Earn" />
              <div className="prose-section">
                <p>
                  The game is elegantly simple. Pick a show. Make your prediction. If you&apos;re
                  right, you earn points and climb the leaderboard. If you&apos;re wrong, you learn and come back harder.
                  No wallet required to start — just a show and an opinion.
                </p>
                <p>
                  But simplicity doesn&apos;t mean shallow. Dynamic odds adjust based on community predictions — early
                  conviction gets better prices. <strong className="text-neon-gold">Streak bonuses</strong> multiply your rewards for
                  consecutive correct predictions. <strong className="text-neon-magenta">Risk Bets</strong> offer higher multipliers for harder calls.
                  <strong className="text-neon-cyan"> Immunity Jokers</strong> — limited to 3 per season (of course) — let you survive a wrong pick
                  and still earn base points.
                </p>
                <p>
                  The <strong className="text-white">Daily Pick Challenge</strong> keeps users engaged between episodes —
                  a new question every day, streak bonuses that compound, and leaderboard races that never sleep. Miss
                  a day? Your streak resets. It&apos;s addictive by design and fair by architecture.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Base correct pick", value: "100 pts", color: "text-neon-cyan" },
                    { label: "Odds multiplier", value: "up to 3.33x", color: "text-neon-cyan" },
                    { label: "Risk Bet bonus", value: "1.5x", color: "text-neon-magenta" },
                    { label: "Joker saves per season", value: "3", color: "text-neon-gold" },
                    { label: "Daily streak bonus", value: "+33 pts/day", color: "text-neon-gold" },
                    { label: "Max staking boost", value: "3.33x", color: "text-violet-400" },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                      <span className="text-sm text-white/70">{item.label}</span>
                      <span className={`font-mono text-sm font-bold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-6">
                  And for users who enter through Stripe — buying $PICKS with their credit card — the experience
                  is seamless. Their tokens are deposited, their first prediction is one tap away, and they&apos;re
                  competing on the same leaderboard as the crypto-native degens. <strong className="text-white">Same game.
                  Same rewards. Zero friction.</strong>
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 07: The Community */}
          <FadeIn>
            <section id="community" className="scroll-mt-32">
              <ChapterHeader num="07" title="The Community" subtitle="Guilds, Tribes, and the 3,333 Threshold" />
              <div className="prose-section">
                <p>
                  RealityPicks isn&apos;t built by a faceless corporation. It&apos;s built by a community of dreamers,
                  builders, and reality TV addicts who believe the future of entertainment is participatory.
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
                  At <strong className="text-neon-gold">3,333 community members</strong>, full governance unlocks.
                  Token holders vote on new show additions, platform fee adjustments, partnership decisions,
                  and even which Stripe payment methods to prioritize in new markets. It&apos;s not &ldquo;community
                  governance&rdquo; as a buzzword — it&apos;s community governance as the actual product.
                </p>
                <p>
                  The guild system, powered by onchain reputation and $PICKS staking tiers, creates a meritocracy where skill and
                  community loyalty are rewarded — not just capital. The top 3 guilds each season split a{" "}
                  <strong className="text-neon-gold">333,333 $PICKS</strong> prize pool.
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 08: The Live */}
          <FadeIn>
            <section id="live" className="scroll-mt-32">
              <ChapterHeader num="08" title="The Live" subtitle="AI-Powered Real-Time Predictions" />
              <div className="prose-section">
                <p>
                  This is where RealityPicks becomes something no one has ever built before.
                </p>
                <p>
                  <strong className="text-white">Live Betting.</strong> While the episode airs, our AI — powered by
                  Google Gemini 2.0 — watches the live stream alongside you. It analyzes facial expressions,
                  tribal council dynamics, challenge performances, and drama cues in near real-time. Then it
                  generates <strong className="text-neon-magenta">flash bets</strong> with dynamic odds that shift
                  as the community bets.
                </p>
                <p>
                  &ldquo;Will Keremcem win this immunity challenge?&rdquo; — <em>odds flash on screen, 15-second
                  window, the crowd bets, the odds shift, the answer comes live.</em> It&apos;s the Las Vegas
                  sportsbook experience, but for reality TV, powered by AI, accessible via YouTube Live.
                </p>
                <p>
                  The parimutuel pool system means odds are driven by the crowd. Early conviction is rewarded.
                  The total pool grows in real-time. Payouts are calculated the moment a bet resolves —
                  and your winnings are in your wallet before the commercial break ends.
                </p>
                <p>
                  This feature is <strong className="text-neon-gold">currently in development</strong>. The architecture
                  is built. The AI pipeline works. The Vegas-style UI is ready. We&apos;re starting with YouTube Live
                  streams and expanding to native Smart TV integration — predictions overlaid directly on your
                  television screen while you watch.
                </p>
                <p>
                  Pay for live bets with $PICKS or with your credit card via Stripe. Same experience. Same rush.
                  The payment method is invisible. The thrill is not.
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 09: The Roadmap */}
          <FadeIn>
            <section id="roadmap" className="scroll-mt-32">
              <ChapterHeader num="09" title="The Roadmap" subtitle="Three Phases to World Domination" />
              <div className="prose-section">
                <div className="space-y-6">
                  {[
                    {
                      phase: "Phase 1 — Ignite",
                      label: "NOW",
                      color: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
                      items: [
                        "Survivor 2026: All Star predictions live on Base",
                        "Stripe integration for fiat on-ramp (credit card, Apple Pay, Google Pay)",
                        "Stripe NFT minted on Farcaster — holder perks active",
                        "Daily Pick Challenge with streak bonuses",
                        "AI live betting architecture built (in development)",
                        "Farcaster Mini App live on Base",
                        "Reach 1,333.33 seed capital → trigger smart contract redeployment",
                      ],
                    },
                    {
                      phase: "Phase 2 — Expand",
                      label: "Q2-Q3 2026",
                      color: "bg-violet-500/20 text-violet-400 border-violet-500/30",
                      items: [
                        "Multi-show expansion to 33 reality TV shows globally",
                        "Smart TV app beta (Samsung Tizen, LG webOS)",
                        "AI live betting public launch with YouTube Live",
                        "Guild system with seasonal tournaments (333,333 $PICKS prize pool)",
                        "Stripe Connect payouts — cash out winnings to bank account",
                        "Reach 3,333 community members → unlock full governance",
                        "iOS & Android native apps",
                      ],
                    },
                    {
                      phase: "Phase 3 — Dominate",
                      label: "2027",
                      color: "bg-neon-gold/20 text-neon-gold border-neon-gold/30",
                      items: [
                        "Smart TV multi-platform (Apple TV, Android TV, Fire TV)",
                        "Predictions as native TV overlay — second screen built into the first",
                        "Creator tools for fan-made prediction markets",
                        "Brand partnerships with TV networks and streaming platforms",
                        "333,333 total predictions → first community airdrop",
                        "Decentralized governance via $PICKS voting",
                        "Protocol licensing for third-party entertainment platforms",
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

                <p className="mt-6">
                  Three phases. Not four. Not five. <strong className="text-neon-gold">Three.</strong> Because 333
                  doesn&apos;t just guide the tokenomics — it guides the tempo. Each phase is a complete act.
                  Each act builds on the last. And when the third phase completes, RealityPicks isn&apos;t a
                  project anymore — it&apos;s infrastructure.
                </p>
              </div>
            </section>
          </FadeIn>

          {/* Chapter 10: The Founders */}
          <FadeIn>
            <section id="founders" className="scroll-mt-32">
              <ChapterHeader num="10" title="The Founders" subtitle="The Three Who Were Always in the Office" />
              <div className="prose-section">
                <p>
                  RealityPicks wasn&apos;t born from a slide deck or a VC pitch. It was born from the energy
                  of three people who kept showing up — for each other, for the work, for the obsession.
                  Working together as{" "}
                  <a href="https://staffone.site" target="_blank" rel="noopener noreferrer" className="text-neon-gold hover:text-neon-gold/80 font-bold transition-colors">
                    staffone.site
                  </a>
                  , they are fully committed to building the future of entertainment predictions.
                </p>

                <div className="mt-8 grid gap-5 sm:grid-cols-3">
                  {/* Laszlo */}
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] border-t-[3px] border-t-neon-cyan/50">
                    <p className="text-xs font-mono text-neon-cyan/60 mb-1">FOUNDER & BUILDER</p>
                    <h4 className="text-base font-bold text-white mb-1">Laszlo Bihary</h4>
                    <p className="text-xs text-neon-cyan font-bold mb-3">0xlaszlo</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Two decades at the frontier of technology and community. From early internet startups
                      to Web3 protocols — Farcaster, Guild.xyz, DAO governance, Zora, BasePaint, Lens.
                      The one who minted the Stripe NFT on Farcaster. The quiet builder in a noisy space.
                      His wallet tells the story no resume can.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href="https://web3.bio/0xa82082380585489b0456e15343c23809bc334709"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-neon-cyan hover:text-neon-cyan/80 transition-colors"
                      >
                        Onchain <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                      <a
                        href="https://warpcast.com/0xlaszlo"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors"
                      >
                        Farcaster <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>

                  {/* Aiman */}
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] border-t-[3px] border-t-neon-magenta/50">
                    <p className="text-xs font-mono text-neon-magenta/60 mb-1">CO-FOUNDER & OPERATIONS</p>
                    <h4 className="text-base font-bold text-white mb-1">Aiman El Boujamai</h4>
                    <p className="text-xs text-neon-magenta font-bold mb-3">staffone.site</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The operational backbone. Aiman brings structure to chaos and execution to vision.
                      Always the first to challenge an idea and the first to ship the solution. His
                      discipline turns late-night brainstorms into production-ready systems. Without him,
                      the vibes stay vibes — with him, they become products.
                    </p>
                  </div>

                  {/* Emilio */}
                  <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] border-t-[3px] border-t-neon-gold/50">
                    <p className="text-xs font-mono text-neon-gold/60 mb-1">CO-FOUNDER & CREATIVE</p>
                    <h4 className="text-base font-bold text-white mb-1">Emilio Dimitri Dik</h4>
                    <p className="text-xs text-neon-gold font-bold mb-3">staffone.site</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The creative spark. Emilio sees what others miss — the angle, the story, the moment
                      that turns a feature into an experience. His instinct for what feels right drives
                      the product forward. The energy in the room when he starts riffing on an idea is
                      the reason the other two never left the office.
                    </p>
                  </div>
                </div>

                <p className="mt-6">
                  Three founders. Three skill sets. Three reasons to stay late. It&apos;s not a coincidence
                  that the number <strong className="text-neon-gold">333</strong> found them — or maybe they found it.
                  Either way, the alignment was unmistakable. Three people, one office, one obsession — and the
                  rest is being written, one prediction at a time.
                </p>

                <div className="mt-6 p-4 rounded-xl bg-neon-gold/5 border border-neon-gold/15 text-center">
                  <p className="text-sm font-bold text-neon-gold mb-1">staffone.site</p>
                  <p className="text-xs text-muted-foreground">
                    The team behind RealityPicks. Fully committed. Building together.
                  </p>
                </div>
              </div>
            </section>
          </FadeIn>

        </div>

        {/* Bottom CTA */}
        <FadeIn>
          <div className="mt-20 text-center p-8 rounded-2xl bg-gradient-to-br from-violet-950/40 to-fuchsia-950/40 border border-violet-500/20">
            <p className="font-mono text-5xl font-black text-neon-gold/20 mb-2">333</p>
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
              <NeonButton variant="secondary" href="/invest" className="gap-2">
                Investors & Partners <ArrowRight className="h-4 w-4" />
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
