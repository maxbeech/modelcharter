import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminSupabase } from "@/lib/supabase/admin";
import type Stripe from "stripe";
import { checkoutSessionIsFunded, planForSubscription } from "@/lib/stripe-events";

// Stripe webhook: updates the org's plan. Verifies the signature and writes with
// the service-role client (there is no user session in a webhook). Env-gated.
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const admin = createAdminSupabase();
  if (!stripe || !secret || !admin) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const sig = request.headers.get("stripe-signature") ?? "";
  const body = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    return NextResponse.json({ error: `signature: ${(err as Error).message}` }, { status: 400 });
  }

  try {
  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const orgId = s.client_reference_id ?? s.metadata?.org_id;
    if (orgId && s.mode === "subscription" && checkoutSessionIsFunded(s)) {
      const { error } = await admin.from("orgs").update({
        plan: s.metadata?.plan === "business" ? "business" : "team",
        stripe_customer_id: s.customer ?? null,
        stripe_subscription_id: s.subscription ?? null,
      }).eq("id", orgId);
      if (error) throw error;
    }
  } else if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const orgId = sub.metadata?.org_id;
    if (orgId) {
      const { error } = await admin.from("orgs").update({
        plan: event.type === "customer.subscription.deleted" ? "free" : planForSubscription(sub.status, sub.metadata?.plan),
        stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
        stripe_subscription_id: event.type === "customer.subscription.deleted" ? null : sub.id,
      }).eq("id", orgId);
      if (error) throw error;
    }
  }
  } catch (error) {
    console.error("[stripe] webhook entitlement update failed:", error);
    return NextResponse.json({ error: "entitlement update failed" }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
