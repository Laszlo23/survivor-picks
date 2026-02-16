"use client";

import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import { NeonButton } from "@/components/ui/neon-button";
import { ExternalLink, MessageCircle, Users, Tv } from "lucide-react";

const SOCIAL_LINKS = [
  {
    name: "Discord",
    desc: "Join the community",
    href: "https://discord.gg/Km7Tw6jHhk",
    icon: MessageCircle,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 hover:bg-indigo-500/20",
    border: "border-indigo-500/20",
  },
  {
    name: "Farcaster",
    desc: "Follow @realitypicks",
    href: "https://warpcast.com/0xlaszlo",
    icon: Users,
    color: "text-violet-400",
    bg: "bg-violet-500/10 hover:bg-violet-500/20",
    border: "border-violet-500/20",
  },
  {
    name: "X / Twitter",
    desc: "Follow @laszloleonardo",
    href: "https://x.com/laszloleonardo",
    icon: ExternalLink,
    color: "text-white/70",
    bg: "bg-white/[0.05] hover:bg-white/[0.08]",
    border: "border-white/[0.08]",
  },
];

const STATS = [
  { label: "Community", value: "Growing", icon: Users },
  { label: "Shows", value: "4", icon: Tv },
  { label: "Chain", value: "Base", icon: ExternalLink },
];

export function LandingCommunity() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="text-center mb-10">
          <LowerThird label="BUILT BY FANS" value="Join the OG Crew" />
          <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">
            We&apos;re building the future of reality TV entertainment on-chain.
            Early supporters who believed before launch — you&apos;re the foundation.
          </p>
        </div>
      </FadeIn>

      {/* Stats */}
      <FadeIn>
        <div className="grid grid-cols-3 gap-3 mb-8 max-w-md mx-auto">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center">
                <Icon className="h-4 w-4 text-neon-cyan mx-auto mb-1.5" />
                <p className="text-lg font-bold font-mono text-white">{stat.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </FadeIn>

      {/* Social Links */}
      <FadeIn>
        <div className="grid gap-3 sm:grid-cols-3 max-w-2xl mx-auto">
          {SOCIAL_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${link.bg} ${link.border}`}
              >
                <Icon className={`h-5 w-5 ${link.color} shrink-0`} />
                <div>
                  <p className="text-sm font-semibold text-white">{link.name}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
              </a>
            );
          })}
        </div>
      </FadeIn>
    </section>
  );
}
