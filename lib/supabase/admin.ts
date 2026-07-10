import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

// Service-role client: bypasses RLS. ONLY for trusted server-side code with no
// user session, the Stripe webhook and the alerts cron. Never import this into a
// client component or a route reachable by an unauthenticated browser without an
// independent secret check. Returns null when the service key is unset.
export function createAdminSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
