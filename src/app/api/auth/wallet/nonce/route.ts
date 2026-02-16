import { randomBytes } from "crypto";

/**
 * GET /api/auth/wallet/nonce
 *
 * Generates a random nonce for SIWE replay protection.
 * The client includes this nonce in the SIWE message before signing.
 */
export async function GET() {
  const nonce = randomBytes(16).toString("hex");

  return Response.json(
    { nonce },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
