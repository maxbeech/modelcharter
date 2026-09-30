import { isPaidPlan } from "./site";
import { analyticsUserRef } from "./analytics-ref";
import type { AnalyticsIdentity } from "./analytics-events";

/**
 * `oh_plan` for a signed-in user. "paid" means the workspace is on the Team or
 * Business plan (`orgs.plan`), which the Stripe webhook sets for a funded
 * Checkout (including the 14-day trial) or an active, trialing or past-due
 * subscription, and clears when the subscription ends. Everyone else is "free".
 * ModelCharter has no anonymous product use, so "anonymous" is never sent.
 */
export function analyticsPlanFor(orgPlan: string | null | undefined): "free" | "paid" {
  return isPaidPlan(orgPlan) ? "paid" : "free";
}

/** The identity to hand a client component. Only the one-way ref leaves the server. */
export function buildAnalyticsIdentity(userId: string, orgPlan: string | null | undefined): AnalyticsIdentity {
  return { userRef: analyticsUserRef(userId), plan: analyticsPlanFor(orgPlan) };
}
