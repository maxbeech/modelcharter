"use client";

import { useEffect, useRef } from "react";
import { analyticsEvents, beginCheckoutParams, trackEvent } from "@/lib/analytics-events";

/**
 * Shown on the dashboard right after someone signs up (or logs in) from a buy
 * button. Sends `begin_checkout`, then carries them on to Stripe after a beat,
 * long enough for the sign_up event to leave. The button is there in case the
 * redirect is blocked or they would rather click.
 */
export function ContinueToCheckout({ plan, name, price }: { plan: string; name: string; price: number }) {
  const started = useRef(false);
  const href = `/api/stripe/checkout?plan=${encodeURIComponent(plan)}`;

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    trackEvent(analyticsEvents.beginCheckout, beginCheckoutParams(plan));
    const t = window.setTimeout(() => window.location.assign(href), 900);
    return () => window.clearTimeout(t);
  }, [plan, href]);

  return (
    <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand-200 bg-brand-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <span className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-brand-300 border-t-brand-700" aria-hidden />
        <p className="text-sm text-ink">
          <span className="font-semibold">Taking you to secure checkout.</span>{" "}
          <span className="text-ink-soft">{name}, ${price} once.</span>
        </p>
      </div>
      <a href={href} className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800">Continue</a>
    </div>
  );
}
