import { createServerSupabase } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import { buildAnalyticsIdentity } from "./analytics-identity";
import type { AnalyticsIdentity } from "./analytics-events";

// Email + password auth on Supabase Auth. Session lives in the Supabase cookies
// (refreshed by middleware); authorization always uses getUser(), which
// validates the JWT with the auth server rather than trusting the raw cookie.

export interface SessionUser { id: string; email: string }

// Kept under its historical name so the dashboard/login/signup gates don't churn.
export { isSupabaseConfigured as isDbConfigured };

export function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  return null;
}
function normalizeEmail(e: string): string { return e.trim().toLowerCase(); }
function looksLikeEmail(e: string): boolean { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e); }

export async function getSession(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
}

export async function destroySession(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
}

// `reason` is a short code for analytics (`*_failed` events), never free text.
// `analytics` is the one-way identity of a genuinely new account, returned only
// when there is no session yet (email confirmation on), so the browser can send
// `sign_up` and identify the user before they have ever reached the dashboard.
export interface AuthResult { ok: boolean; error?: string; notice?: string; reason?: string; analytics?: AnalyticsIdentity }

export async function signup(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Accounts are not configured on this deployment yet.", reason: "not_configured" };
  const e = normalizeEmail(email);
  if (!looksLikeEmail(e)) return { ok: false, error: "Enter a valid email address.", reason: "invalid_email" };
  const pwErr = validatePassword(password);
  if (pwErr) return { ok: false, error: pwErr, reason: "weak_password" };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({ email: e, password });
  if (error) {
    const exists = /registered|already/i.test(error.message);
    const msg = exists ? "An account with that email already exists. Try logging in." : error.message;
    return { ok: false, error: msg, reason: exists ? "already_registered" : "auth_error" };
  }
  // With email confirmation enabled, signUp returns a user but no session.
  if (!data.session) {
    // For an address that is already registered Supabase answers with a user
    // that has no identities. The notice stays the same, but that is not a new
    // account, so it carries no identity and the browser sends no `sign_up`.
    const isNew = Boolean(data.user) && (data.user?.identities?.length ?? 0) > 0;
    return {
      ok: false,
      notice: "Account created. Check your email to confirm it, then log in.",
      analytics: isNew && data.user ? buildAnalyticsIdentity(data.user.id, "free") : undefined,
    };
  }
  return { ok: true };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Accounts are not configured on this deployment yet.", reason: "not_configured" };
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
  if (error) return { ok: false, error: "No account with that email, or wrong password.", reason: "invalid_credentials" };
  return { ok: true };
}
