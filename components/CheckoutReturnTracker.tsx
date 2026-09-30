"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { analyticsEnabled } from "@/lib/openhelm-analytics";
import { analyticsEvents, trackEvent, trackFailure } from "@/lib/analytics-events";

/**
 * On `/pricing?checkout=cancelled` (Stripe's cancel URL) the visitor backed out
 * of Checkout; on `/pricing?checkout=failed&reason=…` the checkout route could
 * not start one. Sends `checkout_cancelled` or `checkout_failed` once. Renders nothing.
 */
export function CheckoutReturnTracker() {
  const params = useSearchParams();
  const state = params.get("checkout");
  const reason = params.get("reason");
  const sent = useRef(false);

  useEffect(() => {
    if (!analyticsEnabled || sent.current) return;
    if (state === "cancelled") trackEvent(analyticsEvents.checkoutCancelled);
    else if (state === "failed") trackFailure(analyticsEvents.checkoutFailed, reason);
    else return;
    sent.current = true;
  }, [state, reason]);

  return null;
}
