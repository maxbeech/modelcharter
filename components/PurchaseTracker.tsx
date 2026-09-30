"use client";

import { useEffect, useRef } from "react";
import { analyticsEnabled, identify } from "@/lib/openhelm-analytics";
import { analyticsEvents, trackEvent, trackFailure, type AnalyticsIdentity } from "@/lib/analytics-events";
import type { PurchasePayload } from "@/lib/billing/purchase";

export type PurchaseOutcome =
  | { kind: "confirmed"; purchase: PurchasePayload; identity: AnalyticsIdentity }
  | { kind: "failed"; reason: string };

const storageKey = (transactionId: string) => `modelcharter:purchase-tracked:${transactionId}`;

function alreadyTracked(transactionId: string): boolean {
  try {
    return localStorage.getItem(storageKey(transactionId)) === "1";
  } catch {
    return false; // storage blocked: GA also de-duplicates on transaction_id
  }
}

function markTracked(transactionId: string) {
  try {
    localStorage.setItem(storageKey(transactionId), "1");
  } catch {
    /* nothing to remember it with */
  }
}

/** Drop the one-shot Checkout params so a reload or shared link cannot repeat the event. */
function stripCheckoutParams() {
  const url = new URL(window.location.href);
  for (const key of ["confirmed", "session_id"]) url.searchParams.delete(key);
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
}

/**
 * Reports the result of a Stripe Checkout return. The server has already asked
 * Stripe about the session and checked it belongs to this workspace, so the
 * redirect alone never counts as a purchase. A confirmed one identifies the
 * user as `paid` first, so the event already carries the new plan. Renders nothing.
 */
export function PurchaseTracker({ outcome }: { outcome: PurchaseOutcome }) {
  const sent = useRef(false);

  useEffect(() => {
    if (!analyticsEnabled || sent.current) return;
    sent.current = true;
    if (outcome.kind === "failed") {
      trackFailure(analyticsEvents.purchaseConfirmationFailed, outcome.reason);
      return;
    }
    const { purchase, identity } = outcome;
    stripCheckoutParams();
    if (alreadyTracked(purchase.transaction_id)) return;
    identify(identity);
    trackEvent(analyticsEvents.purchase, { ...purchase });
    markTracked(purchase.transaction_id);
  }, [outcome]);

  return null;
}
