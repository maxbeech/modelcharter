import { createServerSupabase } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

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

export async function signup(email: string, password: string): Promise<{ ok: boolean; error?: string; notice?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Accounts are not configured on this deployment yet." };
  const e = normalizeEmail(email);
  if (!looksLikeEmail(e)) return { ok: false, error: "Enter a valid email address." };
  const pwErr = validatePassword(password);
  if (pwErr) return { ok: false, error: pwErr };

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signUp({ email: e, password });
  if (error) {
    const msg = /registered|already/i.test(error.message)
      ? "An account with that email already exists. Try logging in."
      : error.message;
    return { ok: false, error: msg };
  }
  // With email confirmation enabled, signUp returns a user but no session.
  if (!data.session) return { ok: false, notice: "Account created. Check your email to confirm it, then log in." };
  return { ok: true };
}

export async function login(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Accounts are not configured on this deployment yet." };
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
  if (error) return { ok: false, error: "No account with that email, or wrong password." };
  return { ok: true };
}
