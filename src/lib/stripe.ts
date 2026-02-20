import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
    });
  }
  return _stripe;
}

export { TOKEN_PACKAGES, PICKS_PRICE_USD } from "./picks-config";
export type { TokenPackage } from "./picks-config";
