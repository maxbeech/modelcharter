import * as Sentry from "@sentry/nextjs";
import { IGNORED_ERROR_PATTERNS } from "./lib/sentry-filters";
import { sharedSentryOptions } from "./lib/sentry-options";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
  ...sharedSentryOptions(),
  // See lib/sentry-filters.ts: Next's unknown-Server-Action error is scanner /
  // deploy-skew noise, not an application bug.
  ignoreErrors: IGNORED_ERROR_PATTERNS,
});
