import type Stripe from "stripe";

const PAID_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

/** A completed Checkout must also have collected payment before granting access. */
export function checkoutSessionIsFunded(session: Pick<Stripe.Checkout.Session, "status" | "payment_status">): boolean {
  return session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required");
}

export function planForSubscription(status: string | null | undefined, requestedPlan: string | null | undefined): "free" | "team" | "business" {
  if (!status || !PAID_SUBSCRIPTION_STATUSES.has(status)) return "free";
  return requestedPlan === "business" ? "business" : "team";
}
