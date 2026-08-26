import { NextResponse, type NextRequest } from "next/server";
import { getStripe, priceForPlan } from "@/lib/stripe";
import { getSession } from "@/lib/auth";
import { ensureOrg } from "@/lib/workspace";
import { SITE } from "@/lib/site";

// Starts a Stripe Checkout subscription for the signed-in user's org.
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });

  const user = await getSession();
  if (!user) return NextResponse.redirect(`${SITE.url}/login`, { status: 303 });

  const form = await request.formData();
  const plan = String(form.get("plan") ?? "team");
  const price = priceForPlan(plan);
  // No price configured for this plan: send the user back to pricing rather than
  // dead-ending on a raw JSON error.
  if (!price) return NextResponse.redirect(`${SITE.url}/pricing`, { status: 303 });

  const org = await ensureOrg();
  if (!org) return NextResponse.redirect(`${SITE.url}/login`, { status: 303 });

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer_email: user.email,
    client_reference_id: org.id,
    // Set metadata at BOTH levels: session-level is what checkout.session.completed
    // carries, subscription-level is what subscription.* events carry. Without the
    // session-level copy the webhook can't tell Team from Business and defaults to Team.
    metadata: { org_id: org.id, plan },
    subscription_data: { trial_period_days: 14, metadata: { org_id: org.id, plan } },
    success_url: `${SITE.url}/dashboard?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE.url}/pricing`,
  }, { idempotencyKey: `checkout:${org.id}:${plan}` });
  return NextResponse.redirect(session.url ?? `${SITE.url}/pricing`, { status: 303 });
}
