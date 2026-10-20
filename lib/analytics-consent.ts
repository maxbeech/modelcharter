/**
 * Analytics consent for the user properties (`oh_user_ref`, `oh_plan`,
 * `oh_is_test`). Events themselves keep their existing behaviour; only the
 * identifiers are gated, because a hashed user id is still personal data under
 * GDPR and PECR, and it must not reach GA without a recorded opt-in.
 *
 * The gate is a first-party cookie, `oh_analytics_consent=granted`, that a
 * consent control writes when the visitor agrees. ModelCharter does not ship
 * that control yet, so until it does the gate stays closed and no user property
 * is sent. That is deliberate: a missing consent banner must show up as a
 * measurement gap, not be papered over by sending identifiers anyway.
 *
 * Pure functions take the cookie header as an argument so they can be tested
 * without a browser; `currentCookieHeader()` is the one browser read.
 */

export const ANALYTICS_CONSENT_COOKIE = "oh_analytics_consent";
export const ANALYTICS_CONSENT_VALUE = "granted";

/** True only when the consent cookie is present and set to `granted`. */
export function analyticsConsentGranted(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((pair) => {
    const eq = pair.indexOf("=");
    if (eq < 0) return false;
    return pair.slice(0, eq).trim() === ANALYTICS_CONSENT_COOKIE &&
      pair.slice(eq + 1).trim() === ANALYTICS_CONSENT_VALUE;
  });
}

/**
 * True when the browser carries a Supabase auth cookie (`sb-<ref>-auth-token`,
 * optionally chunked as `.0`, `.1`...). The Supabase SSR client writes these
 * without `httpOnly`, so the browser can see them. Used to avoid labelling a
 * signed-in visitor `anonymous` on a static public page: the failure this
 * prevents is a paid user's plan being overwritten.
 */
export function hasSupabaseSessionCookie(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false;
  return /(^|;\s*)sb-[^=]+-auth-token/.test(cookieHeader);
}

/** The browser's cookie header, or "" on the server and in tests without one. */
export function currentCookieHeader(): string {
  return typeof document === "undefined" ? "" : document.cookie;
}
