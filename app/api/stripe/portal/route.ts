import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSession } from "@/lib/auth";
import { ensureOrg } from "@/lib/workspace";
import { captureServerError } from "@/lib/observability";
import { SITE } from "@/lib/site";

// Opens the Stripe customer billing portal for a paid org.
export async function POST() {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  const user = await getSession();
  if (!user) return NextResponse.redirect(`${SITE.url}/login`, { status: 303 });
  const org = await ensureOrg();
  if (!org?.stripe_customer_id) return NextResponse.redirect(`${SITE.url}/dashboard/billing`, { status: 303 });
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${SITE.url}/dashboard/billing`,
    });
    return NextResponse.redirect(session.url, { status: 303 });
  } catch (error) {
    captureServerError(error, { scope: "stripe-portal", stage: "create_session", orgId: org.id });
    return NextResponse.redirect(`${SITE.url}/dashboard/billing?portal=failed`, { status: 303 });
  }
}
