import { readFileSync } from "node:fs";
import { safeNext, confirmedPath, confirmUrl } from "../lib/auth-confirm.ts";
import { eq, ok, done } from "./_assert.mts";

eq(safeNext("/dashboard"), "/dashboard", "relative paths pass");
eq(safeNext("//evil.com"), null, "protocol-relative is refused");
eq(safeNext("https://evil.com"), null, "absolute URLs are refused");
eq(safeNext("/\\evil.com"), null, "backslash tricks are refused");
eq(safeNext(null), null, "missing next is null");
eq(confirmedPath(null), "/dashboard?joined=sign_up", "default lands on the dashboard flagged as sign_up");
eq(confirmedPath("//x.com"), "/dashboard?joined=sign_up", "unsafe next falls back");
eq(confirmUrl(), "https://www.modelcharter.com/auth/confirm", "confirm URL is on the canonical site");

ok(readFileSync("lib/auth.ts", "utf8").includes("emailRedirectTo: confirmUrl()"), "signUp sets emailRedirectTo");
ok(readFileSync("proxy.ts", "utf8").includes("CONFIRM_PATH"), "proxy forwards stray homepage codes");
done("auth-confirm");
