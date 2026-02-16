import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiLimiter, getClientIP, rateLimitResponse } from "@/lib/rate-limit";

const emailSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .max(320, "Email is too long."),
});

export async function POST(req: Request) {
  // Rate limit: 10 subscribes per minute per IP
  const ip = getClientIP(req);
  const limit = apiLimiter.check(ip);
  if (!limit.success) {
    return rateLimitResponse(limit.resetAt);
  }

  try {
    const body = await req.json();
    const parsed = emailSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid email." },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Upsert to avoid duplicate error — if already subscribed, just return success
    await prisma.newsletterSubscription.upsert({
      where: { email: email.toLowerCase() },
      update: {},
      create: { email: email.toLowerCase() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[newsletter/subscribe] Error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
