import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "@/lib/sentry-options";

/**
 * Browser error reporting. The feedback integration backs the "Send feedback"
 * control (dashboard header and site footer), so a report from a person lands
 * in the same Sentry project as the exceptions from the code.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const shared = sharedSentryOptions();

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  ...shared,
  // Requests go through our own tunnel route (next.config.ts), so they are
  // same-origin. This header is required, not cosmetic: when a feedback report
  // includes a screenshot the browser sends the envelope as a raw ArrayBuffer
  // with NO Content-Type, and the tunnel then receives an empty body and the
  // submit silently fails. See getsentry/sentry-javascript#16112.
  transportOptions: { headers: { "content-type": "application/x-sentry-envelope" } },
  integrations: [
    ...shared.integrations,
    Sentry.feedbackIntegration({
      colorScheme: "system",
      // Opened by our own control; no floating Sentry button over the app.
      autoInject: false,
      showBranding: false,
      formTitle: "Send feedback",
      submitButtonLabel: "Send feedback",
      messagePlaceholder: "A bug, an idea, anything on your mind.",
      successMessageText: "Thanks, that has gone straight to us.",
    }),
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
