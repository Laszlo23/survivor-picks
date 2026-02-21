import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { TOKEN_PACKAGES } from "@/lib/picks-config";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json(
      { error: "Stripe is not configured yet. Coming soon!" },
      { status: 503 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Please sign in first" }, { status: 401 });
  }

  let body: { packageId?: string; returnTo?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const packageId = body.packageId as string;
  const returnTo =
    typeof body.returnTo === "string" && body.returnTo.startsWith("/")
    ? body.returnTo
    : "/dashboard";

  const pkg = TOKEN_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    return Response.json({ error: "Invalid package" }, { status: 400 });
  }

  try {
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email || undefined,
      metadata: {
        userId: user.id,
        packageId: pkg.id,
        picksAmount: String(pkg.picks),
      },
      line_items: [
        {
          price: pkg.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}${returnTo}?purchase=success&picks=${pkg.picks}`,
      cancel_url: `${appUrl}${returnTo}?purchase=cancelled`,
    });

    return Response.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[stripe/checkout] Error:", err);
    return Response.json(
      { error: "Payment system error. Please try again later." },
      { status: 500 }
    );
  }
}
