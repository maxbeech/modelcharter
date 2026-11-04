import { SITE, afterAuthPath } from "./site";

// Where the email-confirmation link lands. Supabase appends `?code=` (PKCE) or
// `?token_hash=&type=` here; the route exchanges it for a session. Kept as one
// constant so signUp's emailRedirectTo and the proxy fallback can't drift.
export const CONFIRM_PATH = "/auth/confirm";
export const confirmUrl = (): string => `${SITE.url}${CONFIRM_PATH}`;

/** Only same-site relative paths are allowed as a post-confirm destination. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return null;
  return next;
}

/** Confirmed users land on the dashboard, flagged so `sign_up` fires once. */
export function confirmedPath(next: string | null | undefined): string {
  return safeNext(next) ?? afterAuthPath("sign_up", null);
}
