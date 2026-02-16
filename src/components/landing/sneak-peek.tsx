"use client";

import Image from "next/image";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";

export function LandingSneakPeek() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="text-center mb-10">
          <LowerThird label="APP PREVIEW" value="Sneak Peek" />
          <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">
            Here&apos;s what the app looks like — ready to go live.
          </p>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="relative">
          {/* Glow behind screenshots */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <div className="w-[500px] h-[300px] bg-neon-cyan/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
            {/* Screenshot 1 */}
            <div className="rounded-2xl border border-white/[0.08] bg-studio-dark/40 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/30 hover:border-neon-cyan/20 transition-colors group">
              <div className="relative aspect-[16/10]">
                <Image
                  src="/screenshot-1.png"
                  alt="RealityPicks Dashboard"
                  fill
                  className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Screenshot 2 */}
            <div className="rounded-2xl border border-white/[0.08] bg-studio-dark/40 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/30 hover:border-neon-cyan/20 transition-colors group">
              <div className="relative aspect-[16/10]">
                <Image
                  src="/screenshot-2.png"
                  alt="RealityPicks Predictions"
                  fill
                  className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
