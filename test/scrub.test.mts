import { readFileSync } from "node:fs";
import type { ErrorEvent } from "@sentry/nextjs";
import { type TransactionEvent, scrubString, scrubValue, scrubEvent, scrubLog, scrubBreadcrumb, scrubTransaction, MAX_STRING } from "../lib/scrub.ts";
import { safeContext } from "../lib/observability.ts";
import { eq, ok, done } from "./_assert.mts";

// Loose view of scrubbed output for assertions.
type Loose = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const L = (v: unknown) => v as Loose;

const SECRETS = [
  "sk_live_51Habcdefghijklmnop",
  "pk_test_abcdefghijkl1234",
  "whsec_abcdefghijklmnop1234",
  "hlm_sk_abcdefghijklmnop1234",
  "sntrys_abcdefghijklmnop1234",
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYifQ.SflKxwRJSMeKKF2QT4fw",
  "Bearer abcdef1234567890abcdef",
];
for (const s of SECRETS) {
  const out = scrubString(`failed calling upstream with ${s} again`);
  ok(!out.includes(s.slice(-12)), `redacts ${s.slice(0, 8)}...`);
}

// Personal data in free text.
const pii = scrubString("contact jane.doe+x@example.co.uk or +44 7700 900123 or 07700900123");
ok(!/jane|7700/.test(pii), "redacts emails and phone numbers");

// Serialised objects carrying secrets.
const ser = scrubString(JSON.stringify({ password: "hunter2hunter2", stripe_secret_key: "abc123", access_token: "tok_999", ok: 1 }));
ok(!/hunter2|abc123|tok_999/.test(ser), "redacts secrets inside serialised JSON");
ok(ser.includes('"ok":1'), "keeps harmless fields");

// Object keys.
const obj = scrubValue({ Authorization: "x", email: "a@b.com", name: "Jane", tool_slug: "chatgpt", nested: [{ password: "p" }] }) as Loose;
eq([obj.Authorization, obj.email, obj.name, obj.tool_slug, obj.nested[0].password], ["[redacted]", "[redacted]", "[redacted]", "chatgpt", "[redacted]"], "key-based redaction");
let deep: Loose = { a: "b" };
for (let i = 0; i < 30; i++) deep = { n: deep };
ok(!JSON.stringify(scrubValue(deep)).includes('"a"'), "over-deep structures are dropped, not passed raw");

// Adversarial input: long, and shaped to hurt naive regexes. Must be fast.
const evil = ["a".repeat(200_000), "@".repeat(100_000), ("1-".repeat(60_000)), "Bearer " + " ".repeat(100_000), "password" + "=".repeat(50_000), "eyJ" + "a.".repeat(50_000), "x@" + "a.".repeat(50_000)];
for (const e of evil) {
  const t = Date.now();
  const out = scrubString(e);
  ok(Date.now() - t < 500, `adversarial ${e.slice(0, 10)}... scrubbed in ${Date.now() - t}ms`);
  ok(out.length <= MAX_STRING + 40, "output truncated to the cap");
}

// Events: query strings, cookies, bodies, user, extras, messages.
const ev = scrubEvent({
  message: "boom for jane@example.com",
  request: { url: "https://www.modelcharter.com/attest/abc?token=zzz", cookies: { a: "b" }, data: { x: 1 }, query_string: "token=zzz", headers: { authorization: "Bearer x", "user-agent": "curl" } },
  user: { id: "u1", email: "jane@example.com", ip_address: "1.2.3.4" },
  extra: { note: "free text", orgId: "o1" },
  breadcrumbs: [{ message: "GET https://x.com/a?email=a@b.com", data: { url: "/p?token=1", to: "/q?x=1" } }],
  exception: { values: [{ type: "Error", value: "failed for sk_live_51Habcdefghijklmnop" }] },
} as unknown as ErrorEvent)!;
eq(ev.request?.url, "https://www.modelcharter.com/attest/abc", "event url loses query");
ok(!ev.request?.cookies && !ev.request?.data && !ev.request?.query_string, "cookies, body, query_string removed");
eq(ev.request?.headers?.authorization, "[redacted]", "header redacted");
eq(ev.user, { id: "u1" }, "user reduced to id");
ok(!ev.message!.includes("jane"), "message scrubbed");
ok(!ev.exception!.values![0].value!.includes("51Habc"), "exception value scrubbed");
eq((ev.extra as Loose).note, "[redacted]", "free-text extra redacted");
eq((ev.breadcrumbs![0].data as Loose).url, "/p", "breadcrumb url stripped");
eq((ev.breadcrumbs![0].data as Loose).to, "/q", "breadcrumb to stripped");
ok(!ev.breadcrumbs![0].message!.includes("a@b.com"), "breadcrumb message scrubbed");

// Feedback keeps name and email, but not secrets.
const fb = scrubEvent({ type: "feedback", user: { email: "jane@example.com", username: "Jane" }, contexts: { feedback: { message: "hi, my key is sk_live_51Habcdefghijklmnop", contact_email: "jane@example.com", name: "Jane" } } } as unknown as ErrorEvent)!;
eq((fb.contexts as Loose).feedback.contact_email, "jane@example.com", "feedback keeps email");
eq((fb.contexts as Loose).feedback.name, "Jane", "feedback keeps name");
eq(fb.user?.email, "jane@example.com", "feedback keeps user email");
ok(!(fb.contexts as Loose).feedback.message.includes("51Habc"), "feedback message still loses secrets");

// Logs.
const log = scrubLog({ level: "info", message: "user jane@example.com paid sk_live_51Habcdefghijklmnop", attributes: { orgId: "o1", token: "t", email: "a@b.com" } })!;
ok(!/jane|51Habc/.test(log.message as string), "log message scrubbed");
eq((log.attributes as Loose).token, "[redacted]", "log attribute token redacted");
eq((log.attributes as Loose).email, "[redacted]", "log attribute email redacted");
eq((log.attributes as Loose).orgId, "o1", "log ids kept");

// Breadcrumbs and transactions.
eq((scrubBreadcrumb({ category: "navigation", data: { from: "/a?x=1", to: "/b?y=2" } })!.data as Loose), { from: "/a", to: "/b" }, "navigation breadcrumb");
const tx = scrubTransaction({
  type: "transaction", transaction: "GET /x?y=1", request: { url: "https://h/p?token=1", query_string: "token=1" },
  spans: [{ description: "GET https://h/api?email=a@b.com", data: { "http.url": "https://h/api?email=a@b.com", "url.query": "email=a@b.com", "http.query": "?a=b" } }],
} as unknown as TransactionEvent)!;
eq(tx.request?.url, "https://h/p", "transaction request url");
eq(tx.transaction, "GET /x", "transaction name");
eq((tx.spans![0].data as Loose)["http.url"], "https://h/api", "span http.url");
eq((tx.spans![0].data as Loose)["url.query"], "[redacted]", "span url.query");
ok(!tx.spans![0].description!.includes("?"), "span description");

// FAIL CLOSED: a throwing scrub drops the item, never sends it raw.
const boom = { get message() { throw new Error("nope"); } } as unknown as ErrorEvent;
eq(scrubEvent(boom), null, "event dropped on scrub failure");
const boomLog = { level: "info", get message(): string { throw new Error("nope"); } } as Loose;
eq(scrubLog(boomLog), null, "log dropped on scrub failure");
const boomCrumb = { get data(): Loose { throw new Error("nope"); } } as Loose;
eq(scrubBreadcrumb(boomCrumb), null, "breadcrumb dropped on scrub failure");
const boomTx = { get request(): Loose { throw new Error("nope"); } } as unknown as TransactionEvent;
eq(scrubTransaction(boomTx), null, "transaction dropped on scrub failure");

// Capture context is ids only.
const ctx = safeContext({ orgId: "7f3a-91", count: 3, ok: true, email: "a@b.com", note: "free text with spaces", body: { a: 1 }, ids: ["a1", "b2"] });
eq(ctx, { orgId: "7f3a-91", count: 3, ok: true, email: "[omitted]", note: "[omitted]", body: "[omitted]", ids: ["a1", "b2"] }, "safeContext keeps ids/counts, omits content");

// Wiring: every init uses the shared options, and every hook is registered.
const opts = readFileSync(new URL("../lib/sentry-options.ts", import.meta.url), "utf8");
for (const k of ["beforeSend:", "beforeSendLog:", "beforeBreadcrumb:", "beforeSendTransaction:", "enableLogs: true", "consoleLoggingIntegration"]) ok(opts.includes(k), `shared options set ${k}`);
for (const f of ["instrumentation-client.ts", "sentry.server.config.ts", "sentry.edge.config.ts"]) {
  ok(readFileSync(new URL(`../${f}`, import.meta.url), "utf8").includes("sharedSentryOptions()"), `${f} uses shared options`);
}
ok(readFileSync(new URL("../instrumentation-client.ts", import.meta.url), "utf8").includes("application/x-sentry-envelope"), "tunnel content-type fix present");
ok(readFileSync(new URL("../next.config.ts", import.meta.url), "utf8").includes("tunnelRoute: true"), "randomised tunnel route on");

done("scrub");
