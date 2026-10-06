import * as Sentry from "@sentry/nextjs";

/**
 * The one way server code reports a problem, so a failure becomes a Sentry
 * Issue instead of a console line nobody reads.
 *
 * Context is IDS ONLY: codes, ids, counts, enum values. Anything else (names,
 * emails, free text, request or response bodies) is replaced with "[omitted]"
 * here, so a careless caller cannot leak user content into an extra.
 */
const SAFE_STRING = /^[A-Za-z0-9_.:/-]{1,80}$/;

export function safeContext(context: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (typeof value === "number" || typeof value === "boolean" || value === null) out[key] = value;
    else if (typeof value === "string") out[key] = SAFE_STRING.test(value) ? value : "[omitted]";
    else if (Array.isArray(value) && value.length <= 20 && value.every((v) => typeof v === "number" || (typeof v === "string" && SAFE_STRING.test(v)))) out[key] = value;
    else out[key] = "[omitted]";
  }
  return out;
}

function enabled(): boolean {
  return Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
}

export function captureServerError(err: unknown, context: Record<string, unknown> = {}): void {
  const { scope: rawScope, ...rest } = context;
  const scope = typeof rawScope === "string" && SAFE_STRING.test(rawScope) ? rawScope : "server";
  const extras = safeContext(rest);
  try {
    if (enabled()) {
      Sentry.withScope((s) => {
        s.setTag("scope", scope);
        for (const [k, v] of Object.entries(extras)) s.setExtra(k, v);
        s.captureException(err instanceof Error ? err : new Error(String(err)));
      });
      return;
    }
  } catch {
    // Reporting an error must never become an error.
  }
  // No DSN (or the SDK threw): fail visibly, never silently.
  console.error(`[${scope}] not reported to Sentry:`, err instanceof Error ? err.message : String(err), extras);
}

/** A handled failure that is not an exception (an upstream error code, say). */
export function captureServerMessage(message: string, context: Record<string, unknown> = {}): void {
  const { scope: rawScope, ...rest } = context;
  const scope = typeof rawScope === "string" && SAFE_STRING.test(rawScope) ? rawScope : "server";
  const extras = safeContext(rest);
  try {
    if (enabled()) {
      Sentry.withScope((s) => {
        s.setTag("scope", scope);
        s.setLevel("warning");
        for (const [k, v] of Object.entries(extras)) s.setExtra(k, v);
        s.captureMessage(message);
      });
      return;
    }
  } catch {
    /* see above */
  }
  console.warn(`[${scope}] not reported to Sentry:`, message, extras);
}
