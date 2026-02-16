import { createPublicClient, http, recoverMessageAddress } from "viem";
import { base, baseSepolia, hardhat } from "viem/chains";
import { verifySiweMessage } from "viem/siwe";
import { authLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

/* ── Chain & RPC (mirrors wagmi client config) ────────────────────── */

function getChainConfig() {
  if (process.env.NEXT_PUBLIC_CHAIN === "mainnet")
    return {
      chain: base,
      transport: http(process.env.NEXT_PUBLIC_BASE_RPC || "https://mainnet.base.org"),
    };
  if (process.env.NEXT_PUBLIC_CHAIN === "testnet")
    return {
      chain: baseSepolia,
      transport: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"),
    };
  return { chain: hardhat, transport: http("http://127.0.0.1:8545") };
}

const { chain, transport } = getChainConfig();
const publicClient = createPublicClient({ chain, transport });

/* ── POST /api/auth/wallet ────────────────────────────────────────── *
 *  Verifies a SIWE signature and returns the verified wallet address. *
 *  The client then passes this address to NextAuth signIn("wallet").  *
 * ──────────────────────────────────────────────────────────────────── */

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const rl = authLimiter.check(ip);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  try {
    const { message, signature } = await req.json();
    if (!message || !signature) {
      return Response.json({ error: "message and signature required" }, { status: 400 });
    }

    let verified = false;

    // 1. Fast path — ECDSA recovery (EOA wallets)
    try {
      const recovered = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`,
      });
      // Parse address from message (line 2 of EIP-4361)
      const lines = (message as string).split("\n");
      const messageAddress = lines[1]?.trim();
      if (messageAddress && recovered.toLowerCase() === messageAddress.toLowerCase()) {
        verified = true;
        return Response.json({ address: messageAddress });
      }
    } catch {
      // Not an EOA signature, try smart wallet path
    }

    // 2. Smart contract wallet — EIP-6492 / EIP-1271
    if (!verified) {
      try {
        const valid = await verifySiweMessage(publicClient, {
          message,
          signature: signature as `0x${string}`,
        });
        if (valid) {
          const lines = (message as string).split("\n");
          const messageAddress = lines[1]?.trim();
          return Response.json({ address: messageAddress });
        }
      } catch (e) {
        console.error("[Wallet Auth] verifySiweMessage error:", e instanceof Error ? e.message : e);
      }
    }

    // 3. Last resort — publicClient.verifyMessage
    try {
      const lines = (message as string).split("\n");
      const messageAddress = lines[1]?.trim() as `0x${string}`;
      const valid = await publicClient.verifyMessage({
        address: messageAddress,
        message,
        signature: signature as `0x${string}`,
      });
      if (valid) {
        return Response.json({ address: messageAddress });
      }
    } catch (e) {
      console.error("[Wallet Auth] verifyMessage error:", e instanceof Error ? e.message : e);
    }

    return Response.json({ error: "Signature verification failed" }, { status: 401 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[Wallet Auth] Error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
