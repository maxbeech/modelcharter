import type Stripe from "stripe";
import { checkoutSessionIsFunded } from "../stripe-events";
import { KIT, PLAN_LABELS, PLAN_PRICES } from "../site";

/** What the GA4 `purchase` event carries, read from a confirmed Checkout Session. */
export interface PurchasePayload {
  transaction_id: string;
  currency: string;
  /** What Checkout actually charged: 0 while a legacy subscription trial runs. */
  value: number;
  items: { item_id: string; item_name: string; price: number; quantity: 1 }[];
  /** True when the subscription starts in its trial, so a 0 value is not a bug. */
  trial: boolean;
}

type SessionForPurchase = Pick<
  Stripe.Checkout.Session,
  "id" | "mode" | "status" | "payment_status" | "amount_total" | "currency" | "client_reference_id" | "metadata"
>;

export type PaidPlanId = typeof KIT.id | "team" | "business";

/**
 * The plan a Checkout Session grants. A one-off payment is the kit; a
 * subscription is a legacy Team or Business plan.
 */
export function checkoutPlanId(session: Pick<Stripe.Checkout.Session, "metadata" | "mode">): PaidPlanId {
  if (session.mode === "payment") return KIT.id;
  return session.metadata?.plan === "business" ? "business" : "team";
}

/**
 * Why a returned Checkout Session may not be reported as a purchase, or null.
 * A short code, safe to send to GA as a `reason`.
 */
export function checkoutSessionProblem(session: SessionForPurchase, orgId: string): string | null {
  const sessionOrgId = session.metadata?.org_id || session.client_reference_id;
  if (sessionOrgId !== orgId) return "session_not_yours";
  if (session.mode !== "subscription" && session.mode !== "payment") return "unsupported_mode";
  if (session.mode === "payment" && session.metadata?.plan !== KIT.id) return "not_a_kit_purchase";
  if (!checkoutSessionIsFunded(session)) return "payment_not_confirmed";
  return null;
}

export function purchaseFromSession(
  session: SessionForPurchase,
  subscriptionStatus: string | null | undefined,
): PurchasePayload {
  const planId = checkoutPlanId(session);
  return {
    transaction_id: session.id,
    currency: (session.currency ?? "usd").toUpperCase(),
    value: (session.amount_total ?? 0) / 100,
    items: [{ item_id: planId, item_name: PLAN_LABELS[planId], price: PLAN_PRICES[planId], quantity: 1 }],
    trial: subscriptionStatus === "trialing",
  };
}

/** The price ids on a Checkout Session's line items (needs `line_items` expanded or listed). */
export function lineItemPriceIds(lineItems: { data?: { price?: { id?: string | null } | null }[] } | null | undefined): (string | null)[] {
  return (lineItems?.data ?? []).map((li) => li.price?.id ?? null);
}

/** True when the money for a kit payment is no longer ours: fully refunded or disputed. */
export function chargeRevokesKit(charge: Pick<Stripe.Charge, "refunded" | "disputed"> | null | undefined): boolean {
  return Boolean(charge && (charge.refunded || charge.disputed));
}
