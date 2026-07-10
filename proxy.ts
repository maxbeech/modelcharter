import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 proxy (formerly middleware). Keeps the Supabase session fresh on the
// account routes; the public marketing site skips it entirely.
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
