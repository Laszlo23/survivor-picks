import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { apiLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Claim 33,333 $PICKS — one-time per email.
 * Sends magic link; user gets bonus on first sign-in.
 */
export async function POST(req: Request) {
  const ip = getClientIP(req);
  const limit = apiLimiter.check(ip);
  if (!limit.success) {
    return rateLimitResponse(limit.resetAt);
  }

  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !EMAIL_RE.test(email) || email.length > 320) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const existing = await prisma.emailPicksClaim.findUnique({
      where: { email },
    });

    if (existing) {
      return Response.json(
        { error: "Already claimed", message: "This email has already claimed. Check your inbox for the sign-in link." },
        { status: 400 }
      );
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) {
      return Response.json(
        { error: "Auth not configured. Please try again later." },
        { status: 503 }
      );
    }

    let origin = req.headers.get("origin");
    if (!origin && req.headers.get("referer")) {
      try {
        origin = new URL(req.headers.get("referer")!).origin;
      } catch {
        origin = "";
      }
    }
    origin = origin || process.env.NEXT_PUBLIC_APP_URL || "";
    const redirectTo = origin ? `${origin.replace(/\/$/, "")}/auth/callback?next=/profile` : "";

    if (!redirectTo) {
      return Response.json(
        { error: "Redirect URL not configured." },
        { status: 503 }
      );
    }

    const supabase = createClient(url, key);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      console.error("[claim/picks] Supabase error:", error.message);
      return Response.json(
        { error: error.message || "Failed to send sign-in link." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.emailPicksClaim.create({ data: { email } }),
      prisma.newsletterSubscription.upsert({
        where: { email },
        update: {},
        create: { email },
      }),
    ]);

    return Response.json({
      success: true,
      message: "Check your email for the sign-in link. Your 33,333 $PICKS will be credited when you sign in.",
    });
  } catch (err) {
    console.error("[claim/picks] Error:", err);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
