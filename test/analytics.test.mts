// OpenHelm journey analytics: identity, event payloads and the dataLayer shape.
// The measurement id is read when the client module loads, so it is set first
// and the modules under test are imported afterwards.
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST12345";

const { eq, ok, done } = await import("./_assert.mts");
const { analyticsUserRef } = await import("../lib/analytics-ref.ts");
const { analyticsPlanFor, buildAnalyticsIdentity, isTestUserMetadata } = await import("../lib/analytics-identity.ts");
const { analyticsEvents, failureReason, isAnalyticsIdentity, beginCheckoutParams, reportAction,
  identifyJourney, identifyAnonymousVisitor, captureJourneyFailure } = await import("../lib/analytics-events.ts");
const { analyticsConsentGranted, hasSupabaseSessionCookie } = await import("../lib/analytics-consent.ts");
const { checkoutSessionProblem, purchaseFromSession, checkoutPlanId, lineItemPriceIds, chargeRevokesKit } = await import("../lib/billing/purchase.ts");
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
eq(identity, { userRef: "12b9377cbe7e5c94", plan: "paid", isTest: false }, "identity is ref + plan + test flag");
ok(!JSON.stringify(identity).includes(ZERO), "identity never carries the raw user id");
ok(!JSON.stringify(identity).includes(ZERO), "identity never carries the raw user id");
ok(isAnalyticsIdentity(identity), "identity passes its own guard");

// -- test-user marker: app_metadata is_test only, strictly true -----------------
ok(isTestUserMetadata({ is_test: true }), "is_test true marks a test account");
ok(!isTestUserMetadata({ is_test: "true" }), "a string 'true' is not the marker");
ok(!isTestUserMetadata({}), "no marker, not a test account");
ok(!isTestUserMetadata(undefined), "missing app_metadata is not a test account");
ok(!isTestUserMetadata(null), "null app_metadata is not a test account");
ok(buildAnalyticsIdentity(ZERO, "team", true).isTest === true, "the test flag rides on the identity");
ok(!("email" in identity), "no email on the identity");

// -- consent: identifiers only after an explicit opt-in cookie ------------------
const CONSENT = "theme=warm; oh_analytics_consent=granted";
ok(analyticsConsentGranted(CONSENT), "granted consent is recognised");
ok(!analyticsConsentGranted("oh_analytics_consent=denied"), "denied consent is not granted");
ok(!analyticsConsentGranted("x_oh_analytics_consent=granted"), "a similarly named cookie is not consent");
ok(!analyticsConsentGranted(""), "no cookie is not consent");
ok(!analyticsConsentGranted(undefined), "an absent header is not consent");
ok(hasSupabaseSessionCookie("sb-abcd-auth-token=x"), "a Supabase session cookie is detected");
ok(hasSupabaseSessionCookie("a=1; sb-abcd-auth-token.0=x"), "a chunked Supabase session cookie is detected");
ok(!hasSupabaseSessionCookie("a=1; oh_analytics_consent=granted"), "no session cookie without one");
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
eq(checkoutSessionProblem({ ...(session as object), mode: "payment" } as never, "org-1"), "not_a_kit_purchase", "a one-off payment that is not the kit is refused");
eq(checkoutSessionProblem({ ...(session as object), mode: "setup" } as never, "org-1"), "unsupported_mode", "a setup session is refused");

// The one-off HIPAA AI Kit.
eq(beginCheckoutParams("hipaa_kit"), {
  currency: "USD", value: 99,
  items: [{ item_id: "hipaa_kit", item_name: "HIPAA AI Kit", price: 99, quantity: 1 }],
}, "begin_checkout carries the kit's one-off price");
const kitSession = {
  id: "cs_test_kit", mode: "payment", status: "complete", payment_status: "paid",
  amount_total: 9900, currency: "usd", client_reference_id: "org-1", metadata: { org_id: "org-1", plan: "hipaa_kit" },
} as never;
eq(checkoutSessionProblem(kitSession, "org-1"), null, "a paid kit session for this org is reportable");
eq(checkoutSessionProblem({ ...(kitSession as object), payment_status: "unpaid" } as never, "org-1"), "payment_not_confirmed", "an unpaid kit session is refused");
eq(checkoutPlanId(kitSession), "hipaa_kit", "a one-off payment grants the kit");
eq(checkoutPlanId({ mode: "subscription", metadata: { plan: "hipaa_kit" } } as never), "team", "a subscription can never grant the kit by metadata alone");
eq(purchaseFromSession(kitSession, null), {
  transaction_id: "cs_test_kit", currency: "USD", value: 99,
  items: [{ item_id: "hipaa_kit", item_name: "HIPAA AI Kit", price: 99, quantity: 1 }], trial: false,
}, "a kit purchase reports its real charge and is not a trial");
eq(lineItemPriceIds({ data: [{ price: { id: "price_kit" } }, { price: null }] }), ["price_kit", null], "line item prices are read for the ownership check");
eq(lineItemPriceIds(null), [], "no line items means no prices");
eq(chargeRevokesKit({ refunded: true, disputed: false }), true, "a full refund takes the kit back");
eq(chargeRevokesKit({ refunded: false, disputed: true }), true, "a dispute takes the kit back");
eq(chargeRevokesKit({ refunded: false, disputed: false }), false, "a settled charge keeps the kit");
eq(chargeRevokesKit(null), false, "no charge yet is not a reversal");

// -- the dataLayer: gtag.js only acts on `arguments` objects, never arrays -------
const win: { dataLayer: unknown[]; location: { href: string } } = { dataLayer: [], location: { href: "https://modelcharter.test/" } };
(globalThis as unknown as { window: unknown }).window = win;
(globalThis as unknown as { document: unknown }).document = { title: "T" };
const { track } = await import("../lib/openhelm-analytics.tsx");

ok(!identifyJourney(identity, ""), "without consent no user property is sent");
ok(!identifyJourney(identity, "oh_analytics_consent=denied"), "a refusal sends no user property");
eq(win.dataLayer.length, 0, "a refused identify queues nothing");
ok(identifyJourney(identity, CONSENT), "identify records once consent is granted");
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

// -- user properties: exactly the contract keys, oh_is_test only for test users --
win.dataLayer.length = 0;
ok(identifyJourney({ userRef: "12b9377cbe7e5c94", plan: "free" }, CONSENT), "free user identified");
eq(Array.from(win.dataLayer[0] as ArrayLike<unknown>), ["set", "user_properties", { oh_user_ref: "12b9377cbe7e5c94", oh_plan: "free" }],
  "an ordinary user carries oh_user_ref and oh_plan and no oh_is_test");
win.dataLayer.length = 0;
ok(identifyJourney(buildAnalyticsIdentity(ZERO, "team", true), CONSENT), "test user identified");
eq(Array.from(win.dataLayer[0] as ArrayLike<unknown>), ["set", "user_properties", { oh_user_ref: "12b9377cbe7e5c94", oh_plan: "paid", oh_is_test: "true" }],
  "a test account carries oh_is_test: true");
win.dataLayer.length = 0;
ok(identifyJourney(buildAnalyticsIdentity(ZERO, "team", false), CONSENT), "non-test user identified");
ok(!("oh_is_test" in (win.dataLayer[0] as Record<string, unknown>)) &&
  !Array.from(win.dataLayer[0] as ArrayLike<unknown>).includes("oh_is_test"),
  "a non-test account never sends oh_is_test");

// -- anonymous visitors: oh_plan only, never over a signed-in session -----------
win.dataLayer.length = 0;
ok(!identifyAnonymousVisitor(""), "anonymous identify is consent-gated");
ok(identifyAnonymousVisitor(CONSENT), "an anonymous visitor with consent is identified");
eq(Array.from(win.dataLayer[0] as ArrayLike<unknown>), ["set", "user_properties", { oh_plan: "anonymous" }],
  "an anonymous visitor sends only oh_plan");
ok(!identifyAnonymousVisitor(`${CONSENT}; sb-abcd-auth-token=x`), "a signed-in browser keeps its real plan");

// -- failure capture: a thrown action is reported to Sentry, a result is not ----
win.dataLayer.length = 0;
const captured: [unknown, string][] = [];
const spy = (error: unknown, event: string) => { captured.push([error, event]); };
const boom = new Error("offline");
const thrown = await reportAction(async () => { throw boom; },
  { ok: analyticsEvents.policySaved, failed: analyticsEvents.policySaveFailed }, undefined, spy);
eq(thrown, { ok: false, reason: "request_failed" }, "a thrown action resolves to request_failed");
eq(captured.length, 1, "a thrown action is captured once");
ok(captured[0][0] === boom, "the captured error is the thrown error, not a copy");
eq(captured[0][1], "policy_save_failed", "the capture is tagged with the failed journey event");
captured.length = 0;
await reportAction(async () => ({ ok: false, reason: "save_failed" }),
  { ok: analyticsEvents.policySaved, failed: analyticsEvents.policySaveFailed }, undefined, spy);
eq(captured.length, 0, "a handled failure result is not an exception");
ok(typeof captureJourneyFailure === "function", "the default capture is exported for the journey");

done("analytics");
