import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config";

// Request-scoped Supabase client for Server Components, Server Actions and route
// handlers. Reads/writes the auth cookies via next/headers. Always call
// supabase.auth.getUser() (not getSession) for authorization: getUser validates
// the JWT with the auth server, getSession trusts the unverified cookie.
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In a pure Server Component (no response to mutate) cookie writes throw;
        // that is fine because middleware refreshes the session on every request.
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          /* called from a Server Component: safe to ignore */
        }
      },
    },
  });
}
