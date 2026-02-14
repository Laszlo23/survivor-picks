import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";
import { authLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Farcaster Quick Auth bridge.
 *
 * Receives a Quick Auth JWT from the Farcaster Mini App SDK,
 * verifies it server-side, finds or creates a user by FID,
 * and sets a NextAuth-compatible session cookie.
 */
export async function POST(req: Request) {
  // Rate limit: 10 auth attempts per minute per IP
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
    const { token } = body;

    if (!token || typeof token !== "string") {
      return Response.json({ error: "Token required" }, { status: 400 });
    }

    // ─── Verify the Quick Auth JWT ────────────────────────────────────
    const { createClient } = await import("@farcaster/quick-auth");
    const client = createClient();

    // Extract domain for verification (strip protocol)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://realitypicks.xyz";
    const domain = new URL(appUrl).hostname;

    const payload = await client.verifyJwt({ token, domain });
    const fid = payload.sub;

    if (!fid) {
      return Response.json({ error: "Invalid token: no FID" }, { status: 401 });
    }

    // ─── Resolve Farcaster user's primary Ethereum address ────────────
    let primaryAddress: string | null = null;
    let fcUsername: string | null = null;

    try {
      const addrRes = await fetch(
        `https://api.farcaster.xyz/fc/primary-address?fid=${fid}&protocol=ethereum`
      );
      if (addrRes.ok) {
        const data = await addrRes.json();
        primaryAddress = data?.result?.address?.address ?? null;
      }
    } catch {
      // Non-critical — user may not have a primary address set
    }

    try {
      // Fetch username from Farcaster API
      const userRes = await fetch(
        `https://api.farcaster.xyz/v2/user?fid=${fid}`
      );
      if (userRes.ok) {
        const data = await userRes.json();
        fcUsername = data?.result?.user?.username ?? null;
      }
    } catch {
      // Non-critical
    }

    // ─── Find or create user in our database ──────────────────────────
    let user = await prisma.user.findUnique({
      where: { farcasterFid: fid },
    });

    if (!user && primaryAddress) {
      // Try to find by wallet address (user may have connected wallet before)
      user = await prisma.user.findFirst({
        where: { walletAddress: primaryAddress },
      });
      if (user) {
        // Link the Farcaster FID to this existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            farcasterFid: fid,
            farcasterUsername: fcUsername,
          },
        });
      }
    }

    if (!user) {
      // Create a new user for this Farcaster account.
      // Email is required by the schema, so we use a placeholder.
      const placeholderEmail = `fc-${fid}@farcaster.local`;

      // Generate referral code
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let referralCode = "";
      for (let i = 0; i < 8; i++) {
        referralCode += chars[Math.floor(Math.random() * chars.length)];
      }

      user = await prisma.user.create({
        data: {
          email: placeholderEmail,
          name: fcUsername || `fc:${fid}`,
          farcasterFid: fid,
          farcasterUsername: fcUsername,
          walletAddress: primaryAddress,
          referralCode,
          emailVerified: new Date(), // Farcaster-verified users don't need email verification
          hasOnboarded: true, // Skip onboarding for Farcaster users
        },
      });
    } else {
      // Update username if changed
      if (fcUsername && user.farcasterUsername !== fcUsername) {
        await prisma.user.update({
          where: { id: user.id },
          data: { farcasterUsername: fcUsername },
        });
      }
    }

    // ─── Create NextAuth-compatible JWT session ───────────────────────
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

    // Build Set-Cookie header
    const cookieName =
      process.env.NEXTAUTH_URL?.startsWith("https://")
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
          fid,
          username: fcUsername,
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
    console.error("[Farcaster Auth] Error:", message);

    // Distinguish between auth errors and server errors
    if (
      message.includes("Invalid") ||
      message.includes("expired") ||
      message.includes("token")
    ) {
      return Response.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    return Response.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
