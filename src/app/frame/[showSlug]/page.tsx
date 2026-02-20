import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getShowBySlug, LIVE_SHOWS } from "@/lib/shows";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz";

/**
 * Show-specific Farcaster Mini App embed page.
 *
 * When shared in a Farcaster feed, this page renders as a rich embed
 * with the show's name, network, and a "Predict Now" button that opens
 * the Mini App directly on that show's predictions.
 *
 * URL format: /frame/survivor-2026, /frame/bachelor-2026, etc.
 */

// Generate static paths for all known shows
export async function generateStaticParams() {
  return LIVE_SHOWS.map((show) => ({
    showSlug: show.slug,
  }));
}

// Dynamic metadata per show (OG + fc:miniapp)
export async function generateMetadata({
  params,
}: {
  params: { showSlug: string };
}): Promise<Metadata> {
  const show = getShowBySlug(params.showSlug);
  if (!show) return {};

  const title = `${show.name} Predictions — RealityPicks`;
  const description = `${show.tagline} Make your predictions for ${show.name} on ${show.network}.`;
  const showUrl = `${BASE_URL}/frame/${show.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: showUrl,
      siteName: "RealityPicks",
      images: [{ url: `${BASE_URL}/og-image.png`, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    other: {
      "fc:miniapp": JSON.stringify({
        version: "1",
        imageUrl: `${BASE_URL}/og-image.png`,
        button: {
          title: `${show.emoji} ${show.shortName}`,
          action: {
            type: "launch_frame",
            name: "RealityPicks",
            url: `${BASE_URL}/dashboard?show=${show.slug}`,
            splashImageUrl: `${BASE_URL}/pickslogoicon.png`,
            splashBackgroundColor: "#0a0a0f",
          },
        },
      }),
    },
  };
}

export default function FrameShowPage({
  params,
}: {
  params: { showSlug: string };
}) {
  const show = getShowBySlug(params.showSlug);
  if (!show) notFound();

  // When accessed directly in a browser (not via Farcaster embed),
  // redirect to the actual predictions dashboard for this show.
  redirect(`/dashboard?show=${show.slug}`);
}
