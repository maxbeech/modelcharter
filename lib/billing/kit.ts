import "server-only";
import type Stripe from "stripe";
import { KIT } from "@/lib/site";
import { priceForPlan } from "@/lib/stripe";
import { catalogueFromEnv } from "@/lib/gate";
import { ownershipOfPrices } from "@/lib/stripe-guard";
import { lineItemPriceIds } from "./purchase";
export { chargeRevokesKit } from "./purchase";
import type { createAdminSupabase } from "@/lib/supabase/admin";

type Admin = NonNullable<ReturnType<typeof createAdminSupabase>>;

/**
 * Is this one-off Checkout Session a purchase of OUR kit? Decided by price id
 * only, the same rule lib/gate.ts enforces for subscriptions: the shared Stripe
 * account delivers every product's sessions here, and a one-off session carries
 * no subscription for the generated gate to read, so its line items are listed
 * instead. Every line must be the kit price; anything else is someone else's.
 */
export async function isOwnKitSession(stripe: Stripe, sessionId: string): Promise<boolean> {
  const kitPrice = priceForPlan(KIT.id);
  if (!kitPrice) return false;
  const items = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });
  const prices = lineItemPriceIds(items);
  const ownership = ownershipOfPrices(prices, catalogueFromEnv());
  return ownership.verdict === "owned" && prices.length > 0 && prices.every((p) => p === kitPrice);
}

/**
 * Record a kit purchase on the org. A workspace still on a legacy Team or
 * Business subscription already has everything the kit unlocks, so its plan is
 * left alone rather than swapped for one its subscription webhooks would undo.
 */
export async function grantKit(admin: Admin, orgId: string, customer: string | null): Promise<void> {
  const { error } = await admin.from("orgs")
    .update({ plan: KIT.id, ...(customer ? { stripe_customer_id: customer } : {}) })
    .eq("id", orgId)
    .not("plan", "in", "(team,business)");
  if (error) throw error;
}

/**
 * The kit Checkout Session behind a payment intent, if it is ours. Used when a
 * charge is refunded or disputed: those events carry no price, so we walk back
 * to the session and apply the same line-item price check as a purchase.
 */
export async function ownKitSessionForPaymentIntent(stripe: Stripe, paymentIntentId: string): Promise<Stripe.Checkout.Session | null> {
  const { data } = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 });
  const session = data[0];
  if (!session || session.mode !== "payment" || session.metadata?.plan !== KIT.id) return null;
  return (await isOwnKitSession(stripe, session.id)) ? session : null;
}

/** A refunded or disputed kit loses its access. Legacy subscribers are untouched. */
export async function revokeKit(admin: Admin, orgId: string): Promise<void> {
  const { error } = await admin.from("orgs").update({ plan: "free" }).eq("id", orgId).eq("plan", KIT.id);
  if (error) throw error;
}

