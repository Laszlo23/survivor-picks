import { prisma } from "@/lib/prisma";
import { encode } from "next-auth/jwt";

/**
 * DEV-ONLY: Instant login without email verification.
 * Creates/finds user and sets a NextAuth session cookie.
 * Blocked unless NODE_ENV !== "production" AND NEXTAUTH_SECRET is set.
 */
export async function POST(req: Request) {
  // Double gate: block in production AND require explicit dev flag
  if (
    process.env.NODE_ENV === "production" ||
    process.env.DISABLE_DEV_LOGIN === "true"
  ) {
    return new Response(JSON.stringify({ error: "Not available" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Require NEXTAUTH_SECRET — never use a fallback
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    return new Response(
      JSON.stringify({ error: "NEXTAUTH_SECRET not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { email, name } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Upsert user — role is ALWAYS "USER" for dev-login (no privilege escalation)
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: name || undefined },
      create: {
        email,
        name: name || email.split("@")[0],
        role: "USER",
        emailVerified: new Date(),
      },
    });

    // Create JWT token (same format NextAuth uses)
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

    // Build Set-Cookie header
    const cookieName =
      process.env.NEXTAUTH_URL?.startsWith("https://")
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token";

    const maxAge = 30 * 24 * 60 * 60; // 30 days
    const cookieValue = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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
  } catch (error) {
    console.error("Dev login error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create dev session" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
