"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analyticsEnabled, identify } from "@/lib/openhelm-analytics";
import { analyticsEvents, trackEvent, type AnalyticsIdentity } from "@/lib/analytics-events";

/**
 * Sits in the dashboard layout, which already knows the signed-in user. Tells GA
 * who they are (`oh_user_ref`, `oh_plan`) and, right after the sign-in or
 * sign-up server action redirects here (`?joined=login|sign_up`), sends that
 * event once and drops the param. Renders nothing.
 */
export function DashboardAnalytics({ identity }: { identity: AnalyticsIdentity | null }) {
  const params = useSearchParams();
  const pathname = usePathname();
  const joined = params.get("joined");
  const sentFor = useRef<string | null>(null);
  // The server hands over a fresh object on every render; key on the values.
  const userRef = identity?.userRef;
  const plan = identity?.plan;

  useEffect(() => {
    if (!analyticsEnabled || !userRef || !plan) return;
    identify({ userRef, plan });
  }, [userRef, plan]);

  useEffect(() => {
    if (!analyticsEnabled || !userRef || !joined || sentFor.current === joined) return;
    sentFor.current = joined;
    if (joined === "sign_up") trackEvent(analyticsEvents.signUp, { method: "email" });
    else if (joined === "login") trackEvent(analyticsEvents.login, { method: "email" });
    const next = new URLSearchParams(params.toString());
    next.delete("joined");
    const query = next.toString();
    window.history.replaceState(window.history.state, "", query ? `${pathname}?${query}` : pathname);
  }, [userRef, joined, params, pathname]);

  return null;
}
