import Link from "next/link";
import { ArrowRight, HelpCircle } from "lucide-react";
import { GLOSSARY } from "@/lib/glossary";
import { FadeIn } from "@/components/motion";

export const metadata = {
  title: "Help & Glossary | RealityPicks",
  description: "Plain-language definitions and FAQ for RealityPicks.",
};

export default function HelpPage() {
  const entries = Object.entries(GLOSSARY);

  return (
    <div className="min-h-screen bg-studio-black">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <FadeIn>
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
              <HelpCircle className="h-6 w-6 text-neon-cyan" />
            </div>
            <div>
              <h1 className="font-headline text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
                Help & Glossary
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Plain-language definitions for everything in RealityPicks
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neon-cyan/80 mb-4">
              Quick FAQ
            </h2>
            <div className="space-y-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Is it free to play?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Yes. You can play without buying anything. Tokens are optional rewards (like loyalty points).
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  What are tokens?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Optional rewards you can earn by playing. You can buy more with a card if you want, but it&apos;s not required.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  How do I make a pick?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Go to Play, choose a pick round, tap to choose your answer, then lock it in before the episode airs.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  What happens if I&apos;m right?
                </h3>
                <p className="text-sm text-muted-foreground">
                  You earn points. Correct picks in a row (win streak) multiply your score. Top players earn token rewards.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold uppercase tracking-wider text-neon-cyan/80 mb-4">
              Glossary
            </h2>
            <div className="space-y-3">
              {entries.map(([key, { label, tooltip }]) => (
                <div
                  key={key}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                >
                  <div>
                    <span className="text-xs font-mono text-muted-foreground/60 uppercase">
                      {key}
                    </span>
                    <p className="text-sm font-semibold text-white">{label}</p>
                  </div>
                  {tooltip && (
                    <p className="text-xs text-muted-foreground sm:text-right sm:max-w-[200px]">
                      {tooltip}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href="/play"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-sm font-semibold hover:bg-neon-cyan/20 transition-colors"
            >
              Start playing
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.08] transition-colors"
            >
              How it works
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
