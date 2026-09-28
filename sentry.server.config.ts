import * as Sentry from "@sentry/nextjs";
import { IGNORED_ERROR_PATTERNS } from "./lib/sentry-filters";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: 0.2,
  enableLogs: true,
  // See lib/sentry-filters.ts: Next's unknown-Server-Action error is scanner /
  // deploy-skew noise, not an application bug.
  ignoreErrors: IGNORED_ERROR_PATTERNS,
});
