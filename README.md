# ModelCharter

## Observability

Sentry records production errors, logs, request failures and optional user feedback when `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` are configured. Known non-actionable noise (unknown Server Action requests from scanners or stale tabs) is filtered in `lib/sentry-filters.ts`. Every event, log and breadcrumb passes through `lib/scrub.ts` first (fail-closed), server code reports failures with `captureServerError` in `lib/observability.ts`, and the "Send feedback" button (`components/FeedbackButton.tsx`) files User Feedback into the same project.

The Sentry scrubber (`lib/scrub.ts`) redacts secrets of any length, backs up to a clean boundary when it truncates, and fails closed; its regression tests are in `test/scrub-hardening.test.mts`.

**Charter your AI at work.** AI governance for teams without a compliance
department: generate an AI usage policy, see which AI tools are safe to use, and
track that your team has read the rules.

- **Free, no signup:** [AI Usage Policy Generator](/ai-usage-policy-generator) ·
  [AI Tool Risk Directory](/tools) (60+ tools rated from their own policies) ·
  [AI vendor risk assessment](/ai-vendor-risk-assessment) ·
  [compliance hubs](/compliance) (HIPAA / GDPR / SOC 2 / ISO 27001 / no-training) ·
  per-tool answer pages ("Is X HIPAA compliant?"), comparisons, a glossary ·
  framework guides (EU AI Act, NIST AI RMF, ISO 42001, SOC 2) · blog.
- **Paid (Team/Business):** shared AI tool register, versioned policy, employee
  attestation tracking, and **change alerts** (watch a tool, get told when its
  data-handling facts change).

## Analytics

GA4 through `lib/openhelm-analytics.tsx` (a copy of the shared `openhelm-analytics` service; unset
`NEXT_PUBLIC_GA_MEASUREMENT_ID` means no script and no events). Journey events, failure reasons and
the `oh_user_ref` / `oh_plan` user properties are defined in `lib/analytics-events.ts` and
`lib/analytics-identity.ts`. To check a change, open GA DebugView on a build with the id set and walk
sign up, triage a tool, save a policy, create an attestation link and upgrade; each step should show
its event and no `*_failed` sibling.

## Stack

Next.js 16 (App Router, TS) + Tailwind 4 on Helm7. The public site is fully
static/ISR (no backend). The account layer runs on **Supabase** (Postgres + Auth
+ Row Level Security) with email+password auth via `@supabase/ssr`, and **Stripe**
for billing. A daily Helm7 **cron** (`/api/cron/sync-alerts`) snapshots the tool
facts and raises change alerts. See [SETUP.md](./SETUP.md).

Stripe remains the billing source of truth: the signed-in Checkout return verifies
the completed, funded session and repairs the organisation entitlement if a
webhook was delayed. Webhook failures return 5xx so Stripe can retry them.

Risk scoring (`lib/risk.ts`) is a transparent weighted average over only the
signals we could verify, rescaled to 0-100, with the unknowns reported as
coverage so a thinly-evidenced tool can never earn the best band.

Design uses a warm-paper palette with a deep pine brand and a traffic-signal
motif (stop / caution / go) that maps to the risk bands, with a Fraunces display
serif over Inter. Shared primitives live in `components/ui.tsx`,
`components/page.tsx` and `components/brand.tsx`; the interactive marketing
illustrations are in `components/console.tsx`, `components/mockups.tsx` and
`components/marketing.tsx`.

## Data

The AI Tool Risk Directory is `data/ai-tools.json`, with facts compiled from each
vendor's official privacy policy, DPA and trust centre, with source links and a
confidence flag. Unverifiable facts are marked `null` / "Unverified" rather than
guessed. Risk scoring is transparent and deterministic (`lib/risk.ts`).

## Search visibility

`lib/site.ts` is the canonical source for the public origin. The sitemap, robots
file, metadata and structured data all use `https://www.modelcharter.com`; Helm7
permanently redirects the apex host to it. Tool profiles and their focused
compliance answers are statically generated and revalidated weekly. Each answer
shows the vendor-backed evidence used for the decision, with unknowns labelled
unverified rather than filled with assumptions.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests (policy, risk, tools, seo, frameworks, site, registry, fact-signature, llms-txt, no-em-dash)
npm run build    # production build
```

_Guidance only, not legal advice. Verify vendor facts against their official
sources before relying on them._

## Editorial publishing

Blog posts are maintained in `lib/posts.ts`, the single registry that supplies
the blog index, static article routes and sitemap. The October 2026 campaign is
explicitly identified there and covered by `test/blog-publication.test.mts` so
publication dates, category mix, word count, metadata, FAQs, structured content
and credited featured images cannot silently regress.
