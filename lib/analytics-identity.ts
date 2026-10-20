import { isPaidPlan } from "./site";
import { analyticsUserRef } from "./analytics-ref";
import type { AnalyticsIdentity } from "./analytics-events";

/**
 * `oh_plan` for a signed-in user. "paid" means the workspace is on the Team or
 * Business plan (`orgs.plan`), which the Stripe webhook sets for a funded
 * Checkout (including the 14-day trial) or an active, trialing or past-due
 * subscription, and clears when the subscription ends. Everyone else is "free".
 * "anonymous" is sent only by the browser on public pages, never from here.
 */
export function analyticsPlanFor(orgPlan: string | null | undefined): "free" | "paid" {
  return isPaidPlan(orgPlan) ? "paid" : "free";
}

/**
 * True ONLY for the product's own test accounts. The marker is `is_test: true`
 * in Supabase `app_metadata`, which only the server can write (OpenHelm's test
 * accounts carry it). `user_metadata` is user-editable and so is never trusted,
 * and nothing here looks at the email address.
 */
export function isTestUserMetadata(appMetadata: unknown): boolean {
  if (!appMetadata || typeof appMetadata !== "object") return false;
  return (appMetadata as Record<string, unknown>).is_test === true;
}

/**
 * The identity to hand a client component. Only the one-way ref, the plan and
 * the test flag leave the server; the raw user id never does.
 */
export function buildAnalyticsIdentity(
  userId: string,
  orgPlan: string | null | undefined,
  isTest: boolean = false,
): AnalyticsIdentity {
  return { userRef: analyticsUserRef(userId), plan: analyticsPlanFor(orgPlan), isTest };
}
