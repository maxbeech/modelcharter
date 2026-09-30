import { NextResponse, type NextRequest } from "next/server";
import { getStripe, priceForPlan } from "@/lib/stripe";
import { getSession } from "@/lib/auth";
import { ensureOrg } from "@/lib/workspace";
import { SITE } from "@/lib/site";

// A checkout that cannot start sends the user to /pricing with a short reason,
// where the page reports `checkout_failed` to analytics. `reason` is a code, never free text.
const failedCheckout = (reason: string) =>
  NextResponse.redirect(`${SITE.url}/pricing?checkout=failed&reason=${reason}`, { status: 303 });

// Starts a Stripe Checkout subscription for the signed-in user's org.
export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return failedCheckout("billing_not_configured");

  const user = await getSession();
  if (!user) return NextResponse.redirect(`${SITE.url}/login`, { status: 303 });

  const form = await request.formData();
  const plan = String(form.get("plan") ?? "team");
  const price = priceForPlan(plan);
  // No price configured for this plan: send the user back to pricing rather than
  // dead-ending on a raw JSON error.
  if (!price) return failedCheckout("plan_unavailable");

  const org = await ensureOrg();
  if (!org) return NextResponse.redirect(`${SITE.url}/login`, { status: 303 });

  let url: string | null;
  try {
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
      // The marker lets /pricing report the abandonment as `checkout_cancelled`.
      cancel_url: `${SITE.url}/pricing?checkout=cancelled`,
    }, { idempotencyKey: `checkout:${org.id}:${plan}` });
    url = session.url;
  } catch (error) {
    console.error("[stripe] checkout session creation failed:", error instanceof Error ? error.message : error);
    return failedCheckout("stripe_error");
  }
  if (!url) return failedCheckout("missing_checkout_url");
  return NextResponse.redirect(url, { status: 303 });
}
