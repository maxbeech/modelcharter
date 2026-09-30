"use client";

import { analyticsEvents, beginCheckoutParams, trackEvent } from "@/lib/analytics-events";

/**
 * The upgrade button. A plain form POST to the checkout route, which redirects
 * to Stripe; the only addition is `begin_checkout` on submit. If the route
 * cannot start Checkout it sends the user to `/pricing?checkout=failed&reason=…`,
 * where `CheckoutReturnTracker` reports `checkout_failed`.
 */
export function CheckoutForm({ plan, label, disabled }: { plan: string; label: string; disabled: boolean }) {
  return (
    <form action="/api/stripe/checkout" method="post" className="mt-5" onSubmit={() => trackEvent(analyticsEvents.beginCheckout, beginCheckoutParams(plan))}>
      <input type="hidden" name="plan" value={plan} />
      <button type="submit" disabled={disabled} className="w-full rounded-full bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50">
        {label}
      </button>
    </form>
  );
}
