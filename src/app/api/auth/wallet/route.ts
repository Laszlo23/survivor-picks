import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";
import { authLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

/**
 * POST /api/auth/wallet
 *
 * Verifies a SIWE (Sign In With Ethereum) signature, finds or creates
 * a user by wallet address, and sets a NextAuth-compatible session cookie.
 *
 * Body: { message: string, signature: string }
 */
export async function POST(req: Request) {
  const ip = getClientIP(req);
  const rl = authLimiter.check(ip);
  if (!rl.success) return rateLimitResponse(rl.resetAt);

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return Response.json(
      { error: "NEXTAUTH_SECRET not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { message, signature } = body;

    if (!message || !signature) {
      return Response.json(
        { error: "message and signature are required" },
        { status: 400 }
      );
    }

    // ─── Parse and verify the SIWE message ──────────────────────────
    const siweMessage = new SiweMessage(message);

    // Validate domain matches our app
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz";
    const expectedDomain = new URL(appUrl).host;

    if (siweMessage.domain !== expectedDomain) {
      return Response.json(
        { error: "Domain mismatch" },
        { status: 401 }
      );
    }

    const result = await siweMessage.verify({ signature });

    if (!result.success) {
      return Response.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const walletAddress = result.data.address.toLowerCase();

    // ─── Find or create user by wallet address ──────────────────────
    let user = await prisma.user.findFirst({
      where: { walletAddress },
    });

    if (!user) {
      // Generate referral code
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let referralCode = "";
      for (let i = 0; i < 8; i++) {
        referralCode += chars[Math.floor(Math.random() * chars.length)];
      }

      const shortAddr = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
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
    }

    // ─── Create NextAuth-compatible JWT session ─────────────────────
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
    const message =
      error instanceof Error ? error.message : "Unknown error";
    console.error("[Wallet Auth] Error:", message);

    if (
      message.includes("Invalid") ||
      message.includes("Signature") ||
      message.includes("Malformed")
    ) {
      return Response.json(
        { error: "Invalid signature or message" },
        { status: 401 }
      );
    }

    return Response.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
