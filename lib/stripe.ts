import Stripe from "stripe";
import { KIT, SELLABLE_PLANS } from "./site";

export { SELLABLE_PLANS };

// Stripe client, created only when a secret key is present. All billing routes
// degrade gracefully (HTTP 503 / setup-pending UI) when this returns null.
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

// Team and Business price ids stay configured so existing subscribers keep
// working (and the webhook gate still recognises their renewals).
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PRICE_HIPAA_KIT);
}

export function priceForPlan(plan: string): string | undefined {
  if (plan === KIT.id) return process.env.NEXT_PUBLIC_STRIPE_PRICE_HIPAA_KIT;
  if (plan === "team") return process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM;
  if (plan === "business") return process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS;
  return undefined;
}

// A plan can be bought only if it is on sale, Stripe is configured AND that
// plan has a price set. Used to enable/disable each buy button individually
// so a button never leads to a dead end.
export function planAvailable(plan: string): boolean {
  return SELLABLE_PLANS.includes(plan) && Boolean(process.env.STRIPE_SECRET_KEY) && Boolean(priceForPlan(plan));
}
