// OpenHelm journey analytics: identity, event payloads and the dataLayer shape.
// The measurement id is read when the client module loads, so it is set first
// and the modules under test are imported afterwards.
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST12345";

const { eq, ok, done } = await import("./_assert.mts");
const { analyticsUserRef } = await import("../lib/analytics-ref.ts");
const { analyticsPlanFor, buildAnalyticsIdentity } = await import("../lib/analytics-identity.ts");
const { analyticsEvents, failureReason, isAnalyticsIdentity, beginCheckoutParams, reportAction } =
  await import("../lib/analytics-events.ts");
const { checkoutSessionProblem, purchaseFromSession } = await import("../lib/billing/purchase.ts");
const { userRefFor } = await import("../lib/openhelm-analytics-mp.ts");

const isArguments = (v: unknown) => Object.prototype.toString.call(v) === "[object Arguments]";

// -- user ref: pinned vector, same value as the shared client's async hash ----
const ZERO = "00000000-0000-0000-0000-000000000000";
eq(analyticsUserRef(ZERO), "12b9377cbe7e5c94", "user ref matches the contract test vector");
eq(await userRefFor(ZERO), analyticsUserRef(ZERO), "server and shared-client hashes agree");
eq(analyticsUserRef(` ${ZERO} `), "12b9377cbe7e5c94", "ids are trimmed before hashing");
let threw = false;
try { analyticsUserRef("  "); } catch { threw = true; }
ok(threw, "an empty id is refused");

// -- plan derivation ------------------------------------------------------------
eq(analyticsPlanFor("free"), "free", "free org is free");
eq(analyticsPlanFor(undefined), "free", "no org is free");
eq(analyticsPlanFor("team"), "paid", "Team is paid");
eq(analyticsPlanFor("business"), "paid", "Business is paid");
const identity = buildAnalyticsIdentity(ZERO, "team");
eq(identity, { userRef: "12b9377cbe7e5c94", plan: "paid" }, "identity is ref + plan");
ok(!JSON.stringify(identity).includes(ZERO), "identity never carries the raw user id");
ok(isAnalyticsIdentity(identity), "identity passes its own guard");
ok(!isAnalyticsIdentity({ userRef: "a@b.com", plan: "free" }), "an email is not a user ref");
ok(!isAnalyticsIdentity({ userRef: "12b9377cbe7e5c94", plan: "vip" }), "an unknown plan is refused");

// -- event names ----------------------------------------------------------------
for (const name of Object.values(analyticsEvents)) {
  ok(/^[a-z][a-z0-9_]{0,39}$/.test(name), `${name} is a valid GA4 event name`);
}
eq(failureReason("invalid_credentials"), "invalid_credentials", "a code passes through");
eq(failureReason("Wrong password for a@b.com"), "unknown", "free text becomes unknown");
eq(failureReason(undefined), "unknown", "a missing reason becomes unknown");

// -- payloads ---------------------------------------------------------------------
eq(beginCheckoutParams("team"), {
  currency: "USD", value: 49,
  items: [{ item_id: "team", item_name: "Team", price: 49, quantity: 1 }],
}, "begin_checkout carries the listed Team price");
eq(beginCheckoutParams("free"), { currency: "USD" }, "the free plan has no checkout item");

const session = {
  id: "cs_test_1", mode: "subscription", status: "complete", payment_status: "no_payment_required",
  amount_total: 0, currency: "usd", client_reference_id: "org-1", metadata: { org_id: "org-1", plan: "business" },
} as never;
eq(purchaseFromSession(session, "trialing"), {
  transaction_id: "cs_test_1", currency: "USD", value: 0,
  items: [{ item_id: "business", item_name: "Business", price: 149, quantity: 1 }], trial: true,
}, "a trial Checkout is a purchase of value 0, flagged as a trial");
eq(purchaseFromSession({ ...(session as object), amount_total: 4900, metadata: { org_id: "org-1" } } as never, "active").value, 49,
  "value is what Checkout charged");
eq(checkoutSessionProblem(session, "org-1"), null, "a funded session for this org is reportable");
eq(checkoutSessionProblem(session, "org-2"), "session_not_yours", "another org's session is refused");
eq(checkoutSessionProblem({ ...(session as object), payment_status: "unpaid" } as never, "org-1"), "payment_not_confirmed", "unpaid is refused");
eq(checkoutSessionProblem({ ...(session as object), mode: "payment" } as never, "org-1"), "not_a_subscription", "one-off payment is refused");

// -- the dataLayer: gtag.js only acts on `arguments` objects, never arrays -------
const win: { dataLayer: unknown[]; location: { href: string } } = { dataLayer: [], location: { href: "https://modelcharter.test/" } };
(globalThis as unknown as { window: unknown }).window = win;
(globalThis as unknown as { document: unknown }).document = { title: "T" };
const { identify, track } = await import("../lib/openhelm-analytics.tsx");

ok(identify(identity), "identify records when a measurement id is set");
ok(track(analyticsEvents.signUp, { method: "email" }), "track records when a measurement id is set");
eq(win.dataLayer.length, 2, "two commands queued");
ok(win.dataLayer.every(isArguments), "every command is an arguments object, not an array");
eq(Array.from(win.dataLayer[0] as ArrayLike<unknown>), ["set", "user_properties", { oh_user_ref: "12b9377cbe7e5c94", oh_plan: "paid" }], "identify sets the two user properties");
eq(Array.from(win.dataLayer[1] as ArrayLike<unknown>), ["event", "sign_up", { method: "email" }], "sign_up payload");

// -- server-action results become the right event --------------------------------
win.dataLayer.length = 0;
const okResult = await reportAction(async () => ({ ok: true, version: 3 }),
  { ok: analyticsEvents.policySaved, failed: analyticsEvents.policySaveFailed }, (r) => ({ version: r.version }));
eq(okResult.ok, true, "a saved policy reports success");
await reportAction(async () => ({ ok: false, reason: "save_failed" }),
  { ok: analyticsEvents.policySaved, failed: analyticsEvents.policySaveFailed });
await reportAction(async () => { throw new Error("offline"); },
  { ok: analyticsEvents.policySaved, failed: analyticsEvents.policySaveFailed });
eq(win.dataLayer.map((e) => Array.from(e as ArrayLike<unknown>)), [
  ["event", "policy_saved", { version: 3 }],
  ["event", "policy_save_failed", { reason: "save_failed" }],
  ["event", "policy_save_failed", { reason: "request_failed" }],
], "success, failure and a thrown call each send their own event");

done("analytics");
