import { NextResponse, type NextRequest } from "next/server";
import { getStripe, priceForPlan, SELLABLE_PLANS } from "@/lib/stripe";
import { getSession } from "@/lib/auth";
import { ensureOrg } from "@/lib/workspace";
import { captureServerError, captureServerMessage } from "@/lib/observability";
import { SITE, KIT, isPaidPlan } from "@/lib/site";

// A checkout that cannot start sends the user to /pricing with a short reason,
// where the page reports `checkout_failed` to analytics. `reason` is a code, never free text.
// Every reason here leaves a visitor stalled on pricing, so each one is also a
// Sentry warning (the Stripe exception, when there is one, is captured separately).
const failedCheckout = (reason: string) => {
  captureServerMessage("checkout could not start", { scope: "stripe-checkout", reason });
  return NextResponse.redirect(`${SITE.url}/pricing?checkout=failed&reason=${reason}`, { status: 303 });
};

// Starts Stripe Checkout for the signed-in user's org. POST comes from the buy
// buttons; GET is the hand-off right after signup or login with ?plan=, so a
// visitor who clicked "Get the kit" lands on Checkout without clicking again.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  return startCheckout(String(form.get("plan") ?? KIT.id));
}

export async function GET(request: NextRequest) {
  return startCheckout(request.nextUrl.searchParams.get("plan") ?? KIT.id);
}

async function startCheckout(plan: string) {
  const stripe = getStripe();
  if (!stripe) return failedCheckout("billing_not_configured");

  const user = await getSession();
  if (!user) return NextResponse.redirect(`${SITE.url}/login?plan=${encodeURIComponent(plan)}`, { status: 303 });

  // Only plans on sale today; legacy subscriptions are honoured, never sold.
  const price = SELLABLE_PLANS.includes(plan) ? priceForPlan(plan) : undefined;
  if (!price) return failedCheckout("plan_unavailable");

  const org = await ensureOrg();
  if (!org) return NextResponse.redirect(`${SITE.url}/login`, { status: 303 });
  // Already has access: nothing to buy, so don't take their money twice.
  if (isPaidPlan(org.plan)) return NextResponse.redirect(`${SITE.url}/dashboard/billing?already=1`, { status: 303 });

  let url: string | null;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      customer_email: user.email,
      customer_creation: "always",
      client_reference_id: org.id,
      metadata: { org_id: org.id, plan },
      payment_intent_data: { metadata: { org_id: org.id, plan } },
      success_url: `${SITE.url}/dashboard?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
      // The marker lets the kit page report the abandonment as `checkout_cancelled`.
      cancel_url: `${SITE.url}${KIT.href}?checkout=cancelled`,
    }, { idempotencyKey: `checkout:${org.id}:${plan}:${new Date().toISOString().slice(0, 13)}` });
    url = session.url;
  } catch (error) {
    captureServerError(error, { scope: "stripe-checkout", stage: "create_session", plan, orgId: org.id });
    return failedCheckout("stripe_error");
  }
  if (!url) return failedCheckout("missing_checkout_url");
  return NextResponse.redirect(url, { status: 303 });
}
