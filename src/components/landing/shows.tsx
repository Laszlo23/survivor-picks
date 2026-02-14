"use client";

import { FadeIn } from "@/components/motion";
import { LowerThird } from "@/components/ui/lower-third";
import { ShowPosterCard } from "@/components/ui/show-poster-card";
import { LIVE_SHOWS } from "@/lib/shows";

export function LandingShows() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <FadeIn>
        <div className="mb-10">
          <LowerThird label="TONIGHT" value="Shows You Can Predict Right Now" />
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {LIVE_SHOWS.map((show, i) => (
          <ShowPosterCard key={show.slug} show={show} index={i} />
        ))}
      </div>
    </section>
  );
}
