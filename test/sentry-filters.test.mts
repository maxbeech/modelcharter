import { readFileSync } from "node:fs";
import { IGNORED_ERROR_PATTERNS, isIgnoredError } from "../lib/sentry-filters.ts";
import { eq, ok, done } from "./_assert.mts";

const SKEW =
  "Failed to find Server Action. This request might be from an older or newer deployment.\nRead more: https://nextjs.org/docs/messages/failed-to-find-server-action";

// MODELCHARTER_WEB-2: Next's unknown Server Action error (scanner / deploy skew).
eq(isIgnoredError(SKEW), true, "filters the Next.js unknown Server Action error");
eq(
  isIgnoredError("Failed to find Server Action. This request might be from an older or newer deployment."),
  true,
  "filters the message without the docs line",
);

// Real errors are left alone, including ones that merely mention server actions.
eq(isIgnoredError("Failed to find Server Action"), false, "truncated message is not filtered");
eq(isIgnoredError("Server Action threw: attestation not found"), false, "app error mentioning Server Action is kept");
eq(isIgnoredError("TypeError: Cannot read properties of undefined"), false, "unrelated TypeError is kept");

// Missing input never throws.
eq(isIgnoredError(undefined), false, "undefined");
eq(isIgnoredError(null), false, "null");
eq(isIgnoredError(""), false, "empty string");

// The filter must actually be wired into the server-side SDK init.
for (const f of ["sentry.server.config.ts", "sentry.edge.config.ts"]) {
  const src = readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
  ok(src.includes("ignoreErrors: IGNORED_ERROR_PATTERNS"), `${f} passes ignoreErrors`);
}
ok(IGNORED_ERROR_PATTERNS.length > 0, "at least one pattern registered");

done("sentry-filters");
