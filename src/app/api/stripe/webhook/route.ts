import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { creditBalance } from "@/lib/actions/token-balance";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[Stripe webhook] Signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const picksAmount = session.metadata?.picksAmount;
    const packageId = session.metadata?.packageId;

    if (userId && picksAmount) {
      const amount = BigInt(picksAmount);
      await creditBalance(
        userId,
        amount,
        "stripe_purchase",
        `Purchased ${Number(amount).toLocaleString()} $PICKS via Stripe (${packageId})`
      );
      console.log(
        `[Stripe] Credited ${picksAmount} $PICKS to user ${userId}`
      );
    }
  }

  return Response.json({ received: true });
}
