import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { readFileSync } from "node:fs";
import { FeedbackButton } from "../components/FeedbackButton.tsx";
import { eq, ok, done } from "./_assert.mts";

const link = renderToStaticMarkup(createElement(FeedbackButton));
ok(link.includes("<button") && link.includes("Send feedback"), "link variant renders a Send feedback button");
const pill = renderToStaticMarkup(createElement(FeedbackButton, { variant: "pill", user: { email: "a@b.com" } }));
ok(pill.includes("Send feedback") && pill.includes("<svg"), "pill variant renders with icon");

// It must be reachable from both the signed-in shell and the marketing footer.
const read = (f: string) => readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
ok(read("app/dashboard/layout.tsx").includes("<FeedbackButton"), "dashboard header has the control");
ok(read("app/layout.tsx").includes("<FeedbackButton"), "site footer has the control");
ok(read("components/FeedbackButton.tsx").includes("feedback.createForm()"), "opens the Sentry feedback form");
ok(read("instrumentation-client.ts").includes("autoInject: false"), "no auto-injected Sentry button");

// The swallow sites report through the central helper.
for (const f of ["app/api/stripe/webhook/route.ts", "app/api/stripe/checkout/route.ts", "app/api/stripe/portal/route.ts", "app/api/cron/sync-alerts/route.ts", "lib/billing/entitlements.ts", "lib/workspace.ts"]) {
  ok(read(f).includes("captureServerError("), `${f} reports failures to Sentry`);
  eq(/console\.error\(/.test(read(f)), false, `${f} has no bare console.error`);
}
done("feedback-button");
