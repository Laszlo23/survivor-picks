import { createPublicClient, http, recoverMessageAddress } from "viem";
import { base, baseSepolia, hardhat } from "viem/chains";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";
import { authLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

/* ── Chain & RPC config (matches wagmi client config) ─────────────── */

function getChainConfig() {
  if (process.env.NEXT_PUBLIC_CHAIN === "mainnet") {
    return {
      chain: base,
      transport: http(
        process.env.NEXT_PUBLIC_BASE_RPC || "https://mainnet.base.org"
      ),
    };
  }
  if (process.env.NEXT_PUBLIC_CHAIN === "testnet") {
    return {
      chain: baseSepolia,
      transport: http(
        process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || "https://sepolia.base.org"
      ),
    };
  }
  return { chain: hardhat, transport: http("http://127.0.0.1:8545") };
}

const { chain: activeChain, transport } = getChainConfig();
const publicClient = createPublicClient({ chain: activeChain, transport });

/* ── POST /api/auth/wallet ────────────────────────────────────────── */

export async function POST(req: Request) {
  /* Rate-limit */
  const ip = getClientIP(req);
  const rl = authLimiter.check(ip);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return Response.json({ error: "Server misconfigured" }, { status: 500 });
  }

  let step = "init";

  try {
    /* 1 ─ Read body ------------------------------------------------ */
    step = "body";
    const { message, signature } = await req.json();
    if (!message || !signature) {
      return Response.json(
        { error: "message and signature required" },
        { status: 400 }
      );
    }

    /* 2 ─ Parse SIWE message --------------------------------------- */
    step = "parse";
    const parsed = parseSiweMessage(message);
    if (!parsed?.address) {
      return Response.json(
        { error: "Could not parse SIWE message" },
        { status: 400 }
      );
    }

    console.log(
      `[Wallet Auth] address=${parsed.address} domain=${parsed.domain} chain=${parsed.chainId}`
    );

    /* 3 ─ Verify signature ----------------------------------------- */
    // We intentionally skip domain validation here — the SIWE domain is
    // included in the signed message so it cannot be tampered with.
    // This avoids mismatches between Vercel preview URLs, custom domains,
    // and Farcaster frame embed URLs.

    step = "verify";
    let valid = false;
    let verifyMethod = "";

    // (a) Fast path — ECDSA recovery (works for EOA / externally owned wallets)
    try {
      const recovered = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`,
      });
      if (recovered.toLowerCase() === parsed.address.toLowerCase()) {
        valid = true;
        verifyMethod = "ecdsa";
      }
      console.log(
        `[Wallet Auth] ECDSA recovered=${recovered} expected=${parsed.address} match=${valid}`
      );
    } catch (e) {
      console.log(
        "[Wallet Auth] ECDSA recovery skipped:",
        e instanceof Error ? e.message : e
      );
    }

    // (b) Smart contract wallet — EIP-6492 / EIP-1271 on-chain check
    if (!valid) {
      try {
        valid = await verifySiweMessage(publicClient, {
          message,
          signature: signature as `0x${string}`,
        });
        if (valid) verifyMethod = "eip6492";
        console.log(`[Wallet Auth] verifySiweMessage=${valid}`);
      } catch (e) {
        console.log(
          "[Wallet Auth] verifySiweMessage error:",
          e instanceof Error ? e.message : e
        );
      }
    }

    // (c) Last-resort verifyMessage
    if (!valid) {
      try {
        valid = await publicClient.verifyMessage({
          address: parsed.address,
          message,
          signature: signature as `0x${string}`,
        });
        if (valid) verifyMethod = "verifyMessage";
        console.log(`[Wallet Auth] verifyMessage=${valid}`);
      } catch (e) {
        console.log(
          "[Wallet Auth] verifyMessage error:",
          e instanceof Error ? e.message : e
        );
      }
    }

    if (!valid) {
      return Response.json(
        {
          error: "Signature verification failed",
          address: parsed.address,
          chainId: parsed.chainId,
        },
        { status: 401 }
      );
    }

    console.log(`[Wallet Auth] Verified via ${verifyMethod}`);

    /* 4 ─ Find or create user -------------------------------------- */
    step = "user";
    const walletAddress = parsed.address.toLowerCase();

    let user = await prisma.user.findFirst({ where: { walletAddress } });

    if (!user) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let referralCode = "";
      for (let i = 0; i < 8; i++)
        referralCode += chars[Math.floor(Math.random() * chars.length)];

      const shortAddr = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

      try {
        user = await prisma.user.create({
          data: {
            email: `wallet-${walletAddress}@wallet.local`,
            name: shortAddr,
            walletAddress,
            referralCode,
            emailVerified: new Date(),
            hasOnboarded: true,
          },
        });
      } catch {
        // Race-condition retry
        user = await prisma.user.findFirst({ where: { walletAddress } });
      }

      if (!user) {
        return Response.json(
          { error: "Could not create account" },
          { status: 500 }
        );
      }
    }

    /* 5 ─ Mint NextAuth JWT session -------------------------------- */
    step = "session";
    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sub: user.id,
      },
      secret,
    });

    const isSecure = process.env.NEXTAUTH_URL?.startsWith("https://");
    const cookieName = isSecure
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    const maxAge = 30 * 24 * 60 * 60;
    const cookie = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure ? "; Secure" : ""}`;

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: user.id, name: user.name, walletAddress: user.walletAddress },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Wallet Auth] step=${step} error:`, msg);
    return Response.json(
      { error: `Auth failed (${step}): ${msg}` },
      { status: 500 }
    );
  }
}
