import "server-only";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { captureServerError } from "@/lib/observability";
import { planForSubscription } from "@/lib/stripe-events";
import { checkoutPlanId, checkoutSessionProblem, purchaseFromSession, type PurchasePayload } from "./purchase";
import { chargeRevokesKit, grantKit, isOwnKitSession } from "./kit";

/** A verified Checkout return: the purchase to report, or a short code for why not. */
export type CheckoutConfirmation =
  | { ok: true; purchase: PurchasePayload; subscription: Stripe.Subscription | null; session: Stripe.Checkout.Session }
  | { ok: false; reason: string };

/** Ask Stripe about a returned Checkout Session and check it belongs to this org. Changes nothing. */
export async function confirmCheckoutSession(sessionId: string, orgId: string): Promise<CheckoutConfirmation> {
  const stripe = getStripe();
  if (!stripe || !createAdminSupabase()) return { ok: false, reason: "billing_not_configured" };
  if (!sessionId || !orgId) return { ok: false, reason: "missing_session" };
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription", "payment_intent.latest_charge"] });
    const problem = checkoutSessionProblem(session, orgId);
    if (problem) return { ok: false, reason: problem };
    if (session.mode === "payment") {
      if (!(await isOwnKitSession(stripe, session.id))) return { ok: false, reason: "not_our_price" };
      // A refunded or disputed payment must not be re-granted by revisiting the return URL.
      const pi = typeof session.payment_intent === "object" ? session.payment_intent : null;
      const charge = pi && typeof pi.latest_charge === "object" ? pi.latest_charge : null;
      if (chargeRevokesKit(charge)) return { ok: false, reason: "payment_reversed" };
    }
    const subscription = typeof session.subscription === "object" && session.subscription !== null ? session.subscription : null;
    return { ok: true, purchase: purchaseFromSession(session, subscription?.status), subscription, session };
  } catch (error) {
    captureServerError(error, { scope: "stripe-checkout", stage: "confirm", sessionId, orgId });
    return { ok: false, reason: "confirmation_unavailable" };
  }
}

/** Stripe-backed recovery for the signed-in Checkout return: confirm, then grant the plan. */
export async function reconcileCheckoutSession(sessionId: string, orgId: string): Promise<CheckoutConfirmation> {
  const confirmed = await confirmCheckoutSession(sessionId, orgId);
  if (!confirmed.ok) return confirmed;
  const admin = createAdminSupabase();
  if (!admin) return { ok: false, reason: "billing_not_configured" };
  const { session, subscription } = confirmed;
  try {
    if (session.mode === "payment") {
      await grantKit(admin, orgId, typeof session.customer === "string" ? session.customer : null);
      return confirmed;
    }
    const { error } = await admin.from("orgs").update({
      plan: planForSubscription(subscription?.status ?? "active", checkoutPlanId(session)),
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      stripe_subscription_id: subscription?.id ?? (typeof session.subscription === "string" ? session.subscription : null),
    }).eq("id", orgId);
    if (error) throw error;
    return confirmed;
  } catch (error) {
    captureServerError(error, { scope: "stripe-checkout", stage: "reconcile", sessionId, orgId });
    return { ok: false, reason: "plan_update_failed" };
  }
}
