import * as Sentry from "@sentry/nextjs";
import { identify, track, type AnalyticsPlan } from "./openhelm-analytics";
import { analyticsConsentGranted, currentCookieHeader, hasSupabaseSessionCookie } from "./analytics-consent";
import { PLAN_LABELS, PLAN_PRICES, type PlanId } from "./site";

/**
 * Every GA4 event ModelCharter sends for OpenHelm's user journeys, in one
 * place. Names are snake_case and at most 40 characters; GA recommended names
 * (sign_up, login, begin_checkout, purchase) are used where one fits. Each step
 * that can fail has a `*_failed` sibling carrying a short `reason` code, so a
 * step nobody completes is told apart from one that errors.
 *
 * Nothing here takes free text, an email or an id: the only user identifier is
 * the pseudonymous `oh_user_ref` set through `identify()`.
 */
export const analyticsEvents = {
  signUp: "sign_up",
  signUpFailed: "sign_up_failed",
  login: "login",
  loginFailed: "login_failed",
  policyExported: "policy_exported",
  policyExportFailed: "policy_export_failed",
  toolTriaged: "tool_triaged",
  toolTriageFailed: "tool_triage_failed",
  policySaved: "policy_saved",
  policySaveFailed: "policy_save_failed",
  attestationLinkCreated: "attestation_link_created",
  attestationLinkFailed: "attestation_link_failed",
  beginCheckout: "begin_checkout",
  checkoutFailed: "checkout_failed",
  checkoutCancelled: "checkout_cancelled",
  purchase: "purchase",
  purchaseConfirmationFailed: "purchase_confirmation_failed",
} as const;

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents];

export interface AnalyticsIdentity {
  userRef: string;
  plan: AnalyticsPlan;
  /** True ONLY for the product's own test accounts (Supabase app_metadata is_test). */
  isTest?: boolean;
}

const USER_REF = /^[0-9a-f]{16}$/;

export function isAnalyticsIdentity(value: unknown): value is AnalyticsIdentity {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.userRef === "string" && USER_REF.test(v.userRef) &&
    (v.plan === "anonymous" || v.plan === "free" || v.plan === "paid") &&
    (v.isTest === undefined || typeof v.isTest === "boolean");
}

/**
 * Set the user properties for every later event. Consent-gated: without the
 * consent cookie nothing is sent and this returns false. `isTest` reaches GA
 * only as `oh_is_test: "true"`; the shared client never sends "false", so an
 * ordinary user carries no `oh_is_test` at all.
 */
export function identifyJourney(
  identity: { userRef?: string; plan: AnalyticsPlan; isTest?: boolean },
  cookieHeader: string = currentCookieHeader(),
): boolean {
  if (!analyticsConsentGranted(cookieHeader)) return false;
  return identify({ userRef: identity.userRef, plan: identity.plan, isTest: identity.isTest === true });
}

/**
 * `oh_plan = anonymous` for a visitor with no account, on a public page. Sent
 * only when there is no Supabase session cookie, so a signed-in user browsing
 * the free tools keeps their real plan instead of being relabelled.
 */
export function identifyAnonymousVisitor(cookieHeader: string = currentCookieHeader()): boolean {
  if (hasSupabaseSessionCookie(cookieHeader)) return false;
  return identifyJourney({ plan: "anonymous" }, cookieHeader);
}

/** A `reason` is a short code, never free text: anything else becomes "unknown". */
export function failureReason(reason: unknown): string {
  return typeof reason === "string" && /^[a-z][a-z0-9_]{0,39}$/.test(reason) ? reason : "unknown";
}

/** Send one journey event. Returns false when analytics is off. */
export function trackEvent(name: AnalyticsEventName, params: Record<string, unknown> = {}): boolean {
  return track(name, params);
}

/** Send a `*_failed` event with a sanitised reason and any other short params. */
export function trackFailure(
  name: AnalyticsEventName,
  reason: unknown,
  params: Record<string, unknown> = {},
): boolean {
  return track(name, { ...params, reason: failureReason(reason) });
}

/** The GA `items` entry for a paid plan, from the same price table the pricing page shows. */
export function planItem(planId: string): { item_id: string; item_name: string; price: number; quantity: 1 } | null {
  if (!(planId in PLAN_PRICES) || planId === "free") return null;
  const id = planId as PlanId;
  return { item_id: id, item_name: PLAN_LABELS[id], price: PLAN_PRICES[id], quantity: 1 };
}

/** Params for `begin_checkout`: the plan's listed price, not a charge. */
export function beginCheckoutParams(planId: string): Record<string, unknown> {
  const item = planItem(planId);
  return item ? { currency: "USD", value: item.price, items: [item] } : { currency: "USD" };
}

/** What a dashboard server action reports back, so the browser can send the matching event. */
export interface ActionResult {
  ok: boolean;
  /** Short code for a `*_failed` event, set when `ok` is false. */
  reason?: string;
  /** Saved policy version, for `policy_saved`. */
  version?: number;
}

/**
 * Sentry capture for a journey step whose call threw before it returned (network
 * loss, deploy skew). The journey event says the step failed; this says why, so
 * a stalled user is visible as an Issue and not only as a GA count. The tag is
 * the event name, never the payload, so no user content is attached.
 */
export function captureJourneyFailure(error: unknown, failedEvent: AnalyticsEventName): void {
  try {
    Sentry.withScope((scope) => {
      scope.setTag("journey_event", failedEvent);
      scope.setTag("scope", "journey");
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
    });
  } catch {
    // Reporting a failure must never become one; the GA event already went out.
  }
}

/**
 * Turn a server action's result into its success or `*_failed` event. A call
 * that threw before returning (network, deploy skew) is a failure too, reported
 * as `request_failed` and captured to Sentry with the thrown error.
 */
export async function reportAction(
  run: () => Promise<ActionResult>,
  events: { ok: AnalyticsEventName; failed: AnalyticsEventName },
  okParams: (result: ActionResult) => Record<string, unknown> = () => ({}),
  capture: (error: unknown, failedEvent: AnalyticsEventName) => void = captureJourneyFailure,
): Promise<ActionResult> {
  let result: ActionResult;
  try {
    result = await run();
  } catch (error) {
    capture(error, events.failed);
    result = { ok: false, reason: "request_failed" };
  }
  if (result.ok) trackEvent(events.ok, okParams(result));
  else trackFailure(events.failed, result.reason);
  return result;
}
