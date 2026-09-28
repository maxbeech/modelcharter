/**
 * Server-side Sentry noise filters.
 *
 * MODELCHARTER_WEB-2: "Failed to find Server Action. This request might be
 * from an older or newer deployment." raised on `POST /page` (the home page).
 *
 * The home page renders no Server Action: the actions (app/auth-actions.ts,
 * app/dashboard/actions.ts, app/attest/[token]/actions.ts) are only wired to
 * the login/signup, dashboard and attestation forms, each of which POSTs to its
 * own page URL. What landed here was six POSTs inside a few seconds to `/index`
 * (not a URL any ModelCharter link produces), from a single us-east-1
 * datacenter address with a spoofed browser UA, 0 users impacted. That is a
 * scanner replaying a garbage `Next-Action` header at the app, not a
 * first-party form and not real deployment skew, and Next answers it with this
 * exact message before any of our code runs. The same message is also what a
 * genuinely stale browser tab produces after a deploy; that case is not
 * actionable from code either (the fix is Vercel Skew Protection, a project
 * setting), so the message is dropped either way instead of sitting in the
 * backlog as an unactionable ghost.
 *
 * Wired into `ignoreErrors` in sentry.server.config.ts / sentry.edge.config.ts.
 */
export const IGNORED_ERROR_PATTERNS: RegExp[] = [/^Failed to find Server Action\. This request might be from an older or newer deployment\./];

/** Whether an error message matches a known, non-actionable noise pattern. */
export function isIgnoredError(message: string | undefined | null): boolean {
  if (!message) return false;
  return IGNORED_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}
