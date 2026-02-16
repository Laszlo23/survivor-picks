"use client";

import { FadeIn } from "@/components/motion";
import { MessageCircle, ArrowRight } from "lucide-react";

export function LandingDiscordCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <FadeIn>
        <a
          href="https://discord.gg/Km7Tw6jHhk"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 to-violet-950/40 backdrop-blur-xl p-5 sm:p-6 hover:border-indigo-500/40 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 shrink-0">
              <MessageCircle className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="font-headline text-lg sm:text-xl font-bold text-white">
                The Energy Is Real.
              </p>
              <p className="text-sm text-indigo-300/70">
                Join the Discord — 3,400+ fans and growing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors shrink-0">
            Join Now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </a>
      </FadeIn>
    </section>
  );
}
