"use client";

import { Play } from "lucide-react";
import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";

export function LandingVideoExplainer() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <FadeIn>
        <div className="mb-6 text-center">
          <LowerThird label="WATCH" value="How RealityPicks Works" className="inline-block" />
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="relative mx-auto max-w-4xl rounded-2xl border border-white/[0.08] bg-studio-dark/60 overflow-hidden shadow-[0_0_60px_hsl(185_100%_55%/0.06)]">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/dRTdhQjpuBU?si=lfPlBa4IvBrTn-of&rel=0"
              title="How RealityPicks Works"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
