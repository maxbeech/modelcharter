import { track, type AnalyticsPlan } from "./openhelm-analytics";
import { PLANS } from "./site";

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
}

const USER_REF = /^[0-9a-f]{16}$/;

export function isAnalyticsIdentity(value: unknown): value is AnalyticsIdentity {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.userRef === "string" && USER_REF.test(v.userRef) &&
    (v.plan === "anonymous" || v.plan === "free" || v.plan === "paid");
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

/** The GA `items` entry for a paid plan, from the same table the pricing page shows. */
export function planItem(planId: string): { item_id: string; item_name: string; price: number; quantity: 1 } | null {
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan || plan.id === "free") return null;
  return { item_id: plan.id, item_name: plan.name, price: plan.price, quantity: 1 };
}

/** Params for `begin_checkout`: the plan's listed monthly price, not a charge. */
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
 * Turn a server action's result into its success or `*_failed` event. A call
 * that threw before returning (network, deploy skew) is a failure too, reported
 * as `request_failed`.
 */
export async function reportAction(
  run: () => Promise<ActionResult>,
  events: { ok: AnalyticsEventName; failed: AnalyticsEventName },
  okParams: (result: ActionResult) => Record<string, unknown> = () => ({}),
): Promise<ActionResult> {
  let result: ActionResult;
  try {
    result = await run();
  } catch {
    result = { ok: false, reason: "request_failed" };
  }
  if (result.ok) trackEvent(events.ok, okParams(result));
  else trackFailure(events.failed, result.reason);
  return result;
}
