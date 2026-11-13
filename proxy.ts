import { NextResponse, type NextRequest } from "next/server";
import { CONFIRM_PATH } from "@/lib/auth-confirm";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 proxy (formerly middleware). Keeps the Supabase session fresh on the
// account routes; the public marketing site skips it entirely.
export default async function proxy(request: NextRequest) {
  // Safety net: if Supabase falls back to the Site URL (redirect not on its
  // allow list), a confirmation code arrives on the homepage. Forward it.
  if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.has("code")) {
    const url = request.nextUrl.clone();
    url.pathname = CONFIRM_PATH;
    return NextResponse.redirect(url);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
    // Homepage only when it carries an auth code, so normal visits skip the proxy.
    { source: "/", has: [{ type: "query", key: "code" }] },
  ],
};
