import type Stripe from "stripe";
import { checkoutSessionIsFunded } from "../stripe-events";
import { PLANS } from "../site";

/** What the GA4 `purchase` event carries, read from a confirmed Checkout Session. */
export interface PurchasePayload {
  transaction_id: string;
  currency: string;
  /** What Checkout actually charged: 0 while the 14-day trial is running. */
  value: number;
  items: { item_id: string; item_name: string; price: number; quantity: 1 }[];
  /** True when the subscription starts in its trial, so a 0 value is not a bug. */
  trial: boolean;
}

type SessionForPurchase = Pick<
  Stripe.Checkout.Session,
  "id" | "mode" | "status" | "payment_status" | "amount_total" | "currency" | "client_reference_id" | "metadata"
>;

/**
 * Why a returned Checkout Session may not be reported as a purchase, or null.
 * A short code, safe to send to GA as a `reason`.
 */
export function checkoutSessionProblem(session: SessionForPurchase, orgId: string): string | null {
  const sessionOrgId = session.metadata?.org_id || session.client_reference_id;
  if (sessionOrgId !== orgId) return "session_not_yours";
  if (session.mode !== "subscription") return "not_a_subscription";
  if (!checkoutSessionIsFunded(session)) return "payment_not_confirmed";
  return null;
}

/** The plan this Checkout was for, as the webhook reads it: Business, else Team. */
export function checkoutPlanId(session: Pick<Stripe.Checkout.Session, "metadata">): "team" | "business" {
  return session.metadata?.plan === "business" ? "business" : "team";
}

export function purchaseFromSession(
  session: SessionForPurchase,
  subscriptionStatus: string | null | undefined,
): PurchasePayload {
  const planId = checkoutPlanId(session);
  const plan = PLANS.find((p) => p.id === planId);
  return {
    transaction_id: session.id,
    currency: (session.currency ?? "usd").toUpperCase(),
    value: (session.amount_total ?? 0) / 100,
    items: [{ item_id: planId, item_name: plan?.name ?? planId, price: plan?.price ?? 0, quantity: 1 }],
    trial: subscriptionStatus === "trialing",
  };
}
