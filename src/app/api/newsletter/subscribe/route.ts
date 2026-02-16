import { prisma } from "@/lib/prisma";
import { apiLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip = getClientIP(req);
  const limit = apiLimiter.check(ip);
  if (!limit.success) {
    return rateLimitResponse(limit.resetAt);
  }

  try {
    const body = await req.json();
    const email =
      typeof body?.email === "string" ? body.email.trim() : "";

    if (!email || !EMAIL_RE.test(email) || email.length > 320) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    await prisma.newsletterSubscription.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: { email: email.toLowerCase() },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[newsletter/subscribe] Error:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
