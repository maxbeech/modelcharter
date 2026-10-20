import "server-only";
import type Stripe from "stripe";
import { KIT } from "@/lib/site";
import { priceForPlan } from "@/lib/stripe";
import { catalogueFromEnv } from "@/lib/gate";
import { ownershipOfPrices } from "@/lib/stripe-guard";
import { lineItemPriceIds } from "./purchase";
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
