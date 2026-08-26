import "server-only";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { checkoutSessionIsFunded, planForSubscription } from "@/lib/stripe-events";

/** Stripe-backed recovery for the signed-in Checkout return. */
export async function reconcileCheckoutSession(sessionId: string, orgId: string): Promise<boolean> {
  const stripe = getStripe();
  const admin = createAdminSupabase();
  if (!stripe || !admin || !sessionId || !orgId) return false;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    const sessionOrgId = session.metadata?.org_id || session.client_reference_id;
    if (sessionOrgId !== orgId || session.mode !== "subscription" || !checkoutSessionIsFunded(session)) return false;
    const subscription = typeof session.subscription === "object" && session.subscription !== null ? session.subscription : null;
    const { error } = await admin.from("orgs").update({
      plan: planForSubscription(subscription?.status ?? "active", session.metadata?.plan),
      stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
      stripe_subscription_id: subscription?.id ?? (typeof session.subscription === "string" ? session.subscription : null),
    }).eq("id", orgId);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`[stripe] checkout reconciliation failed for ${sessionId}:`, error instanceof Error ? error.message : error);
    return false;
  }
}
