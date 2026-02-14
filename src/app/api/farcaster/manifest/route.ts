/**
 * Serves the Farcaster Mini App manifest.
 *
 * This is rewritten from /.well-known/farcaster.json via next.config.mjs.
 *
 * The accountAssociation must be generated using the Farcaster developer tools:
 * https://farcaster.xyz/~/developers/mini-apps/manifest?domain=realitypicks.xyz
 *
 * After signing, copy the header, payload, and signature into .env:
 *   FARCASTER_MANIFEST_HEADER=...
 *   FARCASTER_MANIFEST_PAYLOAD=...
 *   FARCASTER_MANIFEST_SIGNATURE=...
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz";

  const manifest = {
    accountAssociation: {
      header: process.env.FARCASTER_MANIFEST_HEADER || "",
      payload: process.env.FARCASTER_MANIFEST_PAYLOAD || "",
      signature: process.env.FARCASTER_MANIFEST_SIGNATURE || "",
    },
    miniapp: {
      version: "1",
      name: "RealityPicks",
      iconUrl: `${baseUrl}/logo.png`,
      homeUrl: baseUrl,
      imageUrl: `${baseUrl}/og-image.png`,
      buttonTitle: "Predict Now",
      splashImageUrl: `${baseUrl}/logo.png`,
      splashBackgroundColor: "#0a0a0f",
      webhookUrl: `${baseUrl}/api/farcaster/webhook`,
    },
  };

  return Response.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
