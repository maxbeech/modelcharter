import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { confirmedPath } from "@/lib/auth-confirm";
import { captureServerError } from "@/lib/observability";

// Landing point for the confirmation email. Exchanges the link's code for a
// session, then sends the user into the app. Failures go to /login with a
// readable reason rather than silently dropping them on the homepage.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  // Only signup-style confirmations are accepted. Recovery and magic links
  // would sign a visitor into someone else's session if they opened a crafted URL.
  const rawType = searchParams.get("type");
  const type: EmailOtpType | null = rawType === "signup" || rawType === "email" ? rawType : null;
  const dest = confirmedPath(searchParams.get("next"));

  if (isSupabaseConfigured() && (code || (tokenHash && type))) {
    const supabase = await createServerSupabase();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ type: type!, token_hash: tokenHash! });
    if (!error) return NextResponse.redirect(`${origin}${dest}`);
    // PKCE codes only work in the browser that signed up; a used or expired
    // link is expected, anything else is worth knowing about.
    captureServerError(error, { scope: "auth", stage: "confirm", code: error.code ?? null, status: error.status ?? null });
  }
  return NextResponse.redirect(`${origin}/login?confirm=failed`);
}
