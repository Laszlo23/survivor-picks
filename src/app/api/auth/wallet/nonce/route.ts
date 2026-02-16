import { generateNonce } from "siwe";

/**
 * GET /api/auth/wallet/nonce
 *
 * Generates a random SIWE nonce for replay protection.
 * The client includes this nonce in the SIWE message before signing.
 */
export async function GET() {
  const nonce = generateNonce();

  return Response.json(
    { nonce },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
