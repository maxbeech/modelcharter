import type { Breadcrumb, ErrorEvent, Event as SentryEvent, EventHint, Log } from "@sentry/nextjs";

export type TransactionEvent = SentryEvent & { type: "transaction" };

/**
 * The one scrubber every Sentry hook goes through (events, logs, breadcrumbs,
 * transactions). Three rules, in order of importance:
 *
 *  1. FAIL CLOSED. Every entry point is wrapped in try/catch and returns null
 *     (drop the item) if scrubbing throws. The raw item is never sent instead.
 *  2. LINEAR TIME. Every regex below uses bounded repetition and no nested or
 *     overlapping quantifiers, and a string is cut to MAX_STRING characters
 *     before any matching, so hostile log text cannot cause ReDoS.
 *  3. Redact secrets AND personal data (emails, phones). The one exception is
 *     user feedback, which keeps name and email because the person typed them
 *     in to be contacted.
 */

export const REDACTED = "[redacted]";
/** Longer strings are truncated BEFORE matching, which bounds regex work. */
export const MAX_STRING = 10_000;
const MAX_DEPTH = 6;
const MAX_KEYS = 100;

// Secret-shaped substrings. All repetition is bounded.
const SECRET_PATTERNS: RegExp[] = [
  /eyJ[A-Za-z0-9_-]{5,2000}\.[A-Za-z0-9_-]{5,2000}\.[A-Za-z0-9_-]{5,2000}/g, // JWT
  /\bBearer\s{1,5}[A-Za-z0-9._~+/=-]{8,2000}/gi,
  /\b(?:sk|pk|rk)_(?:live_|test_)?[A-Za-z0-9]{8,200}/g, // Stripe
  /\b(?:whsec|hlm_sk|hlm_pk|sntrys|sntryu)_[A-Za-z0-9_]{8,200}/g,
  /\b(?:ghp|gho|ghs|github_pat)_[A-Za-z0-9_]{16,200}/g,
  /\bxox[abprs]-[A-Za-z0-9-]{10,200}/g,
  /\bAKIA[A-Z0-9]{16}\b/g,
  // key=value / "key":"value" where the key names a secret. Prefix and suffix
  // are bounded so `stripe_secret_key=...` and `"access_token":"..."` both hit.
  /[A-Za-z0-9_-]{0,30}(?:password|passwd|secret|token|api[_-]?key|authorization|cookie|credential|dsn)[A-Za-z0-9_-]{0,20}["']{0,2}\s{0,3}[:=]\s{0,3}["']{0,2}[^\s"',;&]{1,500}/gi,
];

// Personal data: dropped everywhere except feedback.
const PERSONAL_PATTERNS: RegExp[] = [
  /[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9.-]{1,255}\.[A-Za-z]{2,24}/g, // email
  /\+\d[\d\s().-]{7,18}\d/g, // international phone
  /\b0\d{9,10}\b/g, // UK national phone
  /\(?\b\d{2,5}\)?[\s.-]\d{3,4}[\s.-]\d{3,4}\b/g, // grouped phone
];

const URL_QUERY_RE = /(https?:\/\/[^\s?#"'<>]{1,2000})\?[^\s"'<>]{0,2000}/g;

const SECRET_KEY_PARTS = ["key", "token", "secret", "password", "authorization", "cookie", "session", "signature", "credential", "dsn"];
const PII_KEY_PARTS = ["email", "phone", "address"];
const PII_KEY_EXACT = /^(name|full_?name|first_?name|last_?name|user_?name|display_?name|company(_?name)?|org_?name|body|content|note|notes|comment|prompt|input|input_json|content_md|description|detail)$/i;

interface Options {
  /** Feedback keeps name/email; secrets are still redacted. */
  keepPersonal?: boolean;
}

function isSensitiveKey(key: string, opts: Options): boolean {
  const k = key.toLowerCase();
  if (SECRET_KEY_PARTS.some((s) => k.includes(s))) return true;
  if (opts.keepPersonal) return false;
  return PII_KEY_PARTS.some((s) => k.includes(s)) || PII_KEY_EXACT.test(key);
}

/** Drop the query string and fragment from a URL or URL-ish string. */
export function stripQuery(url: string): string {
  const cut = url.length > MAX_STRING ? url.slice(0, MAX_STRING) : url;
  const i = cut.search(/[?#]/);
  return i === -1 ? cut : cut.slice(0, i);
}

/** Scrub secrets (and, unless keepPersonal, personal data) from free text. */
export function scrubString(input: string, opts: Options = {}): string {
  let s = input.length > MAX_STRING ? `${input.slice(0, MAX_STRING)}...[truncated]` : input;
  s = s.replace(URL_QUERY_RE, "$1");
  for (const re of SECRET_PATTERNS) s = s.replace(re, REDACTED);
  if (!opts.keepPersonal) for (const re of PERSONAL_PATTERNS) s = s.replace(re, REDACTED);
  return s;
}

/** Recursively redact: sensitive keys by name, every string by pattern. */
export function scrubValue(value: unknown, opts: Options = {}, depth = 0): unknown {
  if (value == null) return value;
  if (typeof value === "string") return scrubString(value, opts);
  if (typeof value !== "object") return typeof value === "function" ? undefined : value;
  // Past the depth limit we cannot vouch for what is inside: drop it.
  if (depth > MAX_DEPTH) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, MAX_KEYS).map((v) => scrubValue(v, opts, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>).slice(0, MAX_KEYS)) {
    out[k] = isSensitiveKey(k, opts) ? REDACTED : scrubValue(v, opts, depth + 1);
  }
  return out;
}

const URL_DATA_KEYS = ["url", "to", "from", "http.url", "url.full", "http.query", "url.query", "http.fragment"];

function scrubData(data: Record<string, unknown>, opts: Options = {}): Record<string, unknown> {
  const out = scrubValue(data, opts) as Record<string, unknown>;
  for (const k of URL_DATA_KEYS) {
    if (typeof data[k] !== "string") continue;
    // A query is dropped outright; a URL keeps only its path.
    out[k] = k.endsWith("query") || k.endsWith("fragment") ? REDACTED : stripQuery(data[k] as string);
  }
  return out;
}

const isFeedback = (event: { type?: string; contexts?: Record<string, unknown> }) =>
  event.type === "feedback" || Boolean(event.contexts?.feedback);

function scrubBreadcrumbs(list: Breadcrumb[] | undefined, opts: Options): Breadcrumb[] | undefined {
  return list?.slice(-100).map((b) => ({
    ...b,
    message: typeof b.message === "string" ? scrubString(b.message, opts) : b.message,
    data: b.data ? scrubData(b.data, opts) : b.data,
  }));
}

/** `beforeSend`: secrets and personal data out, query strings dropped. Null on any failure. */
export function scrubEvent(event: ErrorEvent, _hint?: EventHint): ErrorEvent | null {
  try {
    const opts: Options = { keepPersonal: isFeedback(event) };
    if (event.request) {
      if (event.request.url) event.request.url = stripQuery(event.request.url);
      delete event.request.cookies;
      delete event.request.data;
      event.request.query_string = undefined;
      if (event.request.headers) event.request.headers = scrubValue(event.request.headers, opts) as Record<string, string>;
    }
    if (typeof event.message === "string") event.message = scrubString(event.message, opts);
    if (event.logentry?.message) event.logentry.message = scrubString(event.logentry.message, opts);
    for (const ex of event.exception?.values ?? []) {
      if (typeof ex.value === "string") ex.value = scrubString(ex.value, opts);
    }
    if (event.transaction) event.transaction = stripQuery(event.transaction);
    if (event.extra) event.extra = scrubValue(event.extra, opts) as Record<string, unknown>;
    if (event.contexts) event.contexts = scrubValue(event.contexts, opts) as typeof event.contexts;
    if (event.tags) event.tags = scrubValue(event.tags, opts) as typeof event.tags;
    if (event.user && !opts.keepPersonal) event.user = event.user.id ? { id: event.user.id } : undefined;
    event.breadcrumbs = scrubBreadcrumbs(event.breadcrumbs, opts);
    return event;
  } catch {
    return null;
  }
}

/** `beforeSendLog`: the log equivalent of scrubEvent. Null on any failure. */
export function scrubLog(log: Log): Log | null {
  try {
    const message = typeof log.message === "string" ? scrubString(log.message) : log.message;
    const attributes = log.attributes ? (scrubValue(log.attributes) as Log["attributes"]) : log.attributes;
    return { ...log, message, attributes };
  } catch {
    return null;
  }
}

/** `beforeBreadcrumb`: message and data scrubbed, URL queries stripped. Null on any failure. */
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  try {
    return scrubBreadcrumbs([breadcrumb], {})![0];
  } catch {
    return null;
  }
}

/** `beforeSendTransaction`: request url and span URL data lose their query strings. Null on any failure. */
export function scrubTransaction(event: TransactionEvent): TransactionEvent | null {
  try {
    if (event.request) {
      if (event.request.url) event.request.url = stripQuery(event.request.url);
      delete event.request.cookies;
      delete event.request.data;
      event.request.query_string = undefined;
      if (event.request.headers) event.request.headers = scrubValue(event.request.headers) as Record<string, string>;
    }
    if (event.transaction) event.transaction = stripQuery(event.transaction);
    if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined;
    if (event.contexts) event.contexts = scrubValue(event.contexts) as typeof event.contexts;
    if (event.tags) event.tags = scrubValue(event.tags) as typeof event.tags;
    event.breadcrumbs = scrubBreadcrumbs(event.breadcrumbs, {});
    for (const span of event.spans ?? []) {
      if (span.description) span.description = scrubString(stripQuery(span.description));
      if (span.data) span.data = scrubData(span.data as Record<string, unknown>) as typeof span.data;
    }
    return event;
  } catch {
    return null;
  }
}
