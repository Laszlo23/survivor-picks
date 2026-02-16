import { createPublicClient, http, recoverMessageAddress } from "viem";
import { base, baseSepolia, hardhat } from "viem/chains";
import { parseSiweMessage, verifySiweMessage } from "viem/siwe";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";
import { authLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Get the active chain and RPC transport for server-side verification.
 */
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

const publicClient = createPublicClient({
  chain: activeChain,
  transport,
});

/**
 * POST /api/auth/wallet
 *
 * Verifies a SIWE signature, finds/creates user, sets NextAuth session.
 * Body: { message: string, signature: string }
 */
export async function POST(req: Request) {
  const ip = getClientIP(req);
  const rl = authLimiter.check(ip);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return Response.json(
      { error: "Server config error: NEXTAUTH_SECRET not set" },
      { status: 500 }
    );
  }

  let step = "init";

  try {
    // ─── 1. Parse request body ────────────────────────────────────
    step = "parse-body";
    const body = await req.json();
    const { message, signature } = body;

    if (!message || !signature) {
      return Response.json(
        { error: "message and signature are required" },
        { status: 400 }
      );
    }

    // ─── 2. Parse the SIWE message ────────────────────────────────
    step = "parse-siwe";
    let parsed;
    try {
      parsed = parseSiweMessage(message);
    } catch (parseErr) {
      console.error(
        "[Wallet Auth] parseSiweMessage threw:",
        parseErr instanceof Error ? parseErr.message : parseErr
      );
      return Response.json(
        {
          error: "Could not parse SIWE message",
          detail: parseErr instanceof Error ? parseErr.message : String(parseErr),
        },
        { status: 400 }
      );
    }

    if (!parsed || !parsed.address) {
      console.error("[Wallet Auth] parseSiweMessage returned no address");
      return Response.json(
        { error: "Malformed SIWE message (no address)" },
        { status: 400 }
      );
    }

    console.log(
      `[Wallet Auth] Parsed SIWE — address: ${parsed.address}, domain: ${parsed.domain}, chainId: ${parsed.chainId}`
    );

    // ─── 3. Verify signature ──────────────────────────────────────
    // Strategy:
    //   a) Try direct ECDSA recovery (fast, works for EOA wallets)
    //   b) If address mismatch, try verifySiweMessage (handles smart
    //      contract wallets via EIP-6492/EIP-1271)
    step = "verify-sig";
    let valid = false;

    // (a) Direct ECDSA recovery — no RPC call needed
    try {
      const recoveredAddress = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`,
      });
      console.log(
        `[Wallet Auth] ECDSA recovered: ${recoveredAddress}, expected: ${parsed.address}`
      );
      if (
        recoveredAddress.toLowerCase() === parsed.address.toLowerCase()
      ) {
        valid = true;
        console.log("[Wallet Auth] ECDSA verification succeeded (EOA)");
      }
    } catch (ecdsaErr) {
      console.warn(
        "[Wallet Auth] ECDSA recovery failed:",
        ecdsaErr instanceof Error ? ecdsaErr.message : ecdsaErr
      );
    }

    // (b) Smart contract wallet verification via EIP-6492
    if (!valid) {
      try {
        console.log("[Wallet Auth] Trying verifySiweMessage (smart wallet)...");
        valid = await verifySiweMessage(publicClient, {
          message,
          signature: signature as `0x${string}`,
        });
        console.log(
          `[Wallet Auth] verifySiweMessage returned: ${valid}`
        );
      } catch (verifyErr) {
        console.error(
          "[Wallet Auth] verifySiweMessage threw:",
          verifyErr instanceof Error ? verifyErr.message : verifyErr
        );
      }
    }

    // (c) Last resort: publicClient.verifyMessage (ERC-1271)
    if (!valid) {
      try {
        console.log("[Wallet Auth] Trying publicClient.verifyMessage...");
        valid = await publicClient.verifyMessage({
          address: parsed.address,
          message,
          signature: signature as `0x${string}`,
        });
        console.log(`[Wallet Auth] verifyMessage returned: ${valid}`);
      } catch (lastErr) {
        console.error(
          "[Wallet Auth] verifyMessage threw:",
          lastErr instanceof Error ? lastErr.message : lastErr
        );
      }
    }

    if (!valid) {
      return Response.json(
        {
          error: "Invalid signature or message",
          debug: {
            address: parsed.address,
            domain: parsed.domain,
            chainId: parsed.chainId,
            chain: activeChain.name,
          },
        },
        { status: 401 }
      );
    }

    // ─── 4. Find or create user ───────────────────────────────────
    step = "db-user";
    const walletAddress = parsed.address.toLowerCase();

    let user = await prisma.user.findFirst({
      where: { walletAddress },
    });

    if (!user) {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let referralCode = "";
      for (let i = 0; i < 8; i++) {
        referralCode += chars[Math.floor(Math.random() * chars.length)];
      }

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
      } catch (createErr) {
        // Might be a unique constraint violation if race condition
        console.warn(
          "[Wallet Auth] Create user failed, retrying findFirst:",
          createErr instanceof Error ? createErr.message : createErr
        );
        user = await prisma.user.findFirst({ where: { walletAddress } });
        if (!user) {
          return Response.json(
            {
              error: "Could not create user account",
              detail: createErr instanceof Error ? createErr.message : String(createErr),
            },
            { status: 500 }
          );
        }
      }
    }

    // ─── 5. Create NextAuth JWT session ───────────────────────────
    step = "session";
    const sessionToken = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        sub: user.id,
      },
      secret,
    });

    const cookieName = process.env.NEXTAUTH_URL?.startsWith("https://")
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

    const maxAge = 30 * 24 * 60 * 60; // 30 days
    const isSecure = process.env.NEXTAUTH_URL?.startsWith("https://");
    const cookieValue = `${cookieName}=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isSecure ? "; Secure" : ""}`;

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          walletAddress: user.walletAddress,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookieValue,
        },
      }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Wallet Auth] Unhandled error at step="${step}":`, msg);

    // Return actual error for debugging (TODO: remove detail in production)
    return Response.json(
      {
        error: `Auth failed at step: ${step}`,
        detail: msg,
      },
      { status: 500 }
    );
  }
}
