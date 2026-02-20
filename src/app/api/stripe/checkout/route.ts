import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getStripe, TOKEN_PACKAGES } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const packageId = body.packageId as string;

  const pkg = TOKEN_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) {
    return Response.json({ error: "Invalid package" }, { status: 400 });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: session.user.email || undefined,
    metadata: {
      userId: session.user.id,
      packageId: pkg.id,
      picksAmount: String(pkg.picks),
    },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${pkg.picks.toLocaleString()} $PICKS — ${pkg.label}`,
            description: `${pkg.picks.toLocaleString()} $PICKS tokens at $0.00333/token`,
            images: [`${appUrl}/pickslogoicon.png`],
          },
          unit_amount: Math.round(pkg.priceUsd * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/profile?purchase=success&picks=${pkg.picks}`,
    cancel_url: `${appUrl}/profile?purchase=cancelled`,
  });

  return Response.json({ url: checkoutSession.url });
}
