import * as Sentry from "@sentry/nextjs";
import { scrubBreadcrumb, scrubEvent, scrubLog, scrubTransaction } from "@/lib/scrub";

/**
 * The one place the options shared by every Sentry.init live (browser in
 * instrumentation-client.ts, server in sentry.server.config.ts, edge in
 * sentry.edge.config.ts), so scrubbing, sampling and log forwarding cannot
 * drift between runtimes.
 */
export function sharedSentryOptions() {
  return {
    tracesSampleRate: 0.2,
    environment: process.env.NODE_ENV,
    // No request bodies, headers or user identifiers by default.
    sendDefaultPii: false,
    beforeSend: scrubEvent,
    beforeSendTransaction: scrubTransaction,
    beforeBreadcrumb: scrubBreadcrumb,
    // Structured logs, plus every console call forwarded as a log line.
    enableLogs: true,
    beforeSendLog: scrubLog,
    integrations: [Sentry.consoleLoggingIntegration({ levels: ["log", "info", "warn", "error"] })],
  };
}
