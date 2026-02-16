/**
 * Serves the Farcaster Mini App manifest at /.well-known/farcaster.json
 * (rewritten via next.config.mjs).
 *
 * IMPORTANT: The accountAssociation MUST be signed for the exact domain
 * where this app is hosted (e.g. realitypicks.xyz — NOT survivor-picks.vercel.app).
 *
 * Sign your manifest at:
 *   https://farcaster.xyz/~/developers/mini-apps/manifest?domain=realitypicks.xyz
 *
 * Then set the env vars on Vercel:
 *   FARCASTER_MANIFEST_HEADER=...
 *   FARCASTER_MANIFEST_PAYLOAD=...
 *   FARCASTER_MANIFEST_SIGNATURE=...
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz";

  const manifest: Record<string, unknown> = {
    accountAssociation: {
      header: process.env.FARCASTER_MANIFEST_HEADER || "",
      payload: process.env.FARCASTER_MANIFEST_PAYLOAD || "",
      signature: process.env.FARCASTER_MANIFEST_SIGNATURE || "",
    },
    frame: {
      version: "1",
      name: "RealityPicks",
      subtitle: "Reality TV Predictions on Base",
      description:
        "Predict reality TV outcomes across Survivor, The Bachelor, Love Island and more. Earn points, build streaks, climb the leaderboard. Free to play on Base.",
      tagline: "Predict Reality. Win Glory.",
      iconUrl: `${baseUrl}/logo.png`,
      homeUrl: baseUrl,
      imageUrl: `${baseUrl}/og-image.png`,
      heroImageUrl: `${baseUrl}/hero-stage.jpg`,
      screenshotUrls: [
        `${baseUrl}/screenshot-1.png`,
        `${baseUrl}/screenshot-2.png`,
      ],
      buttonTitle: "Predict Now",
      splashImageUrl: `${baseUrl}/logo.png`,
      splashBackgroundColor: "#0a0a0f",
      webhookUrl: `${baseUrl}/api/farcaster/webhook`,
      primaryCategory: "entertainment",
      tags: ["realitytv", "predictions", "gaming", "base", "community"],
      ogTitle: "RealityPicks",
      ogDescription:
        "Free reality TV prediction game. Pick winners, earn points, collect badges. Built on Base.",
      ogImageUrl: `${baseUrl}/og-image.png`,
      noindex: false,
      requiredChains: ["eip155:8453"],
      requiredCapabilities: [
        "actions.signIn",
        "wallet.getEthereumProvider",
        "actions.swapToken",
      ],
    },
  };

  return Response.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
