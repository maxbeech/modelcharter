// Central place for the Supabase env + a single "is the account layer wired
// up?" check. The public product (marketing, policy generator, tool directory)
// needs none of this and works with an empty env; accounts/dashboard/billing are
// gated on isSupabaseConfigured() and degrade to an honest setup-pending state.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
