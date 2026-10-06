# Changelog

## Unreleased (2026-10-06): Sentry standard

Errors, logs and user feedback now go to the `modelcharter_web` Sentry project.

- **Scrubbing:** one shared scrubber (`lib/scrub.ts`) covers events, logs, breadcrumbs and
  transactions. It redacts emails, phone numbers, tokens, API keys and secret fields, strips
  query strings, caps strings at 10k characters before matching, uses linear-time patterns and
  drops the item if scrubbing ever throws. Feedback keeps the name and email people give us.
- **Logs:** console output is forwarded as Sentry logs from the browser, server and edge.
- **Errors as Issues:** `lib/observability.ts` (`captureServerError`, ids and codes only) is now
  called from the Stripe webhook, checkout, billing portal, checkout reconciliation, the alerts
  cron and the workspace writes, which used to log to the console and carry on. The webhook no
  longer echoes the raw signature error back to the caller.
- **Feedback:** a "Send feedback" button in the dashboard header (name and email prefilled) and
  in the site footer, opening Sentry's feedback form through a randomised tunnel route.
- Tests: `test/scrub.test.mts`, `test/feedback-button.test.mts`.

## Unreleased (2026-09-30): user journeys for OpenHelm

Refreshed `lib/openhelm-analytics*` from the shared service (adds `identify()` and
fixes the dataLayer shape: gtag.js ignores plain arrays, so commands are pushed as
`arguments`) and added the GA4 events OpenHelm reads. Nothing is sent unless
`NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. All names live in `lib/analytics-events.ts`.

- **Acquisition:** `first_visit` (automatic), `sign_up`, `purchase`.
- **Set up governance:** `tool_triaged`, `policy_saved`, `attestation_link_created`.
- **Upgrade:** `begin_checkout`, `purchase`, `checkout_cancelled`.
- **Free tool:** `policy_exported` (copy, download, print) on the policy generator.
- **Return use:** `login`.
- **Failures:** `sign_up_failed`, `login_failed`, `tool_triage_failed`, `policy_save_failed`,
  `attestation_link_failed`, `checkout_failed`, `purchase_confirmation_failed`,
  `policy_export_failed`, each with a short `reason` code (never free text).
- **Who and which plan:** every event carries `oh_user_ref` (first 16 hex of SHA-256 of the
  Supabase user id, hashed on the server) and `oh_plan` (`free` or `paid`). `paid` means the
  workspace is on Team or Business (`orgs.plan`), which includes the 14-day trial.
- **`purchase`** is sent from the dashboard after the Checkout return has been verified with Stripe
  for this workspace, not on the redirect alone. Its value is what Checkout charged (0 during the
  trial, with `trial: true`). ModelCharter had no server-side `purchase` event, so none was moved.
- The Checkout route now redirects to `/pricing?checkout=failed&reason=...` instead of answering
  503 JSON when it cannot start a session, and Stripe's cancel URL is `/pricing?checkout=cancelled`.
  After a confirmed return the dashboard redirects to `/dashboard?upgraded=1&confirmed=<session>`.
- Dashboard server actions for the tool register, policy save and attestation links now return a
  result (`ActionResult`) instead of nothing, so failures can be reported.

## Unreleased (2026-09-30): hosting moves from Vercel to Helm7

- Hosting is Helm7 (self-hosted, Supabase unchanged). `vercel.json` is gone; the
  daily alerts schedule (`0 6 * * *`) is now a Helm7 cron service that calls
  `/api/cron/sync-alerts` from inside the web service with
  `Authorization: Bearer $CRON_SECRET`.
- `npm start` honours `$PORT`. `automaticVercelMonitors` dropped from the Sentry
  build config (it registers Vercel cron monitors, which no longer exist).
- The alerts cron compares its bearer token in constant time
  (`lib/cron-auth.ts`) and stays fail-closed: 503 with no `CRON_SECRET`, 401 on a
  wrong token.
- Privacy and Security pages name Helm7 as the host instead of Vercel.
- `test/no-vercel.test.mts` keeps Vercel packages, scripts, `vercel.json`,
  `maxDuration` and any mention of Vercel out of application code.
- The Skew Protection follow-up below no longer applies.

## Unreleased (2026-09-28): Sentry backlog, unknown Server Action noise

Fixes MODELCHARTER_WEB-2 (`Failed to find Server Action` on `POST /page`).
Not an application bug: the home page renders no Server Action (the actions in
`app/auth-actions.ts`, `app/dashboard/actions.ts` and `app/attest/[token]/actions.ts`
are only wired to the login/signup, dashboard and attestation
forms, each of which POSTs to its own page URL). The 6 events were one
2-second burst to `/index` (not a URL any ModelCharter link produces) from a single
Ashburn/us-east-1 datacenter address with a spoofed browser UA, 0 users. That is
a scanner replaying a garbage `Next-Action` id; Next rejects it with this exact
message before any app code runs. The same message is also what a genuinely
stale browser tab produces after a deploy, so it is now dropped via
`ignoreErrors` (`lib/sentry-filters.ts`, wired into `sentry.server.config.ts`
and `sentry.edge.config.ts`) instead of sitting in the backlog. Trade-off: real
skew is no longer visible in Sentry either. **Manual follow-up**: enable Vercel
Skew Protection for this project (Settings, Advanced, Skew Protection; needs a
Pro/Enterprise plan and a redeploy) to cover the genuine-skew case; Next.js 16
needs no `next.config` change for it.

## 2026-08-27: Production observability

- Added Sentry error, log, App Router request-failure and user-feedback monitoring.

## 2026-08-03: GEO audit fixes (WebSite schema, AI-crawler robots rules, llms.txt pricing)

Machine-readability audit for AI assistants/answer engines (GEO), following
the 2026-07-10 general SEO audit (90/100, no quick-win gaps). Found and
fixed four surface-level gaps a keyword/meta-tag audit would not catch:

- **JSON-LD.** Added a `WebSite` node (`lib/seo.ts` `websiteLd()`, rendered
  site-wide in `app/layout.tsx` next to the existing `Organization` node).
  `SoftwareApplication`, `FAQPage`, `Dataset`, `Article` and `BreadcrumbList`
  were already present and validated as well-formed JSON on every page type
  checked.
- **robots.txt.** `GPTBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`,
  `Claude-SearchBot`, `PerplexityBot`, `Perplexity-User`, `Google-Extended`,
  `CCBot`, `Applebot-Extended` and `Amazonbot` are now named explicitly with
  the same allow rule as `*`, so AI-crawler access is deliberate rather than
  only implicit, and can't be silently narrowed by a future edit to the
  wildcard group.
- **llms.txt.** Added a `## Plans` section linking `/pricing` and listing
  the Free/Team/Business tiers from the existing `PLANS` source of truth;
  it previously described only the free tools.
- **Freshness.** `SITE.updated` (drives `sitemap.xml` `lastmod` and
  llms.txt's `Updated:` line) was bumped from 2026-06-26 to 2026-07-27; it
  had gone stale by over a month across two substantial blog content pushes
  (2026-07-19, 2026-07-27) that never touched it.
- **No public API/MCP server found** to audit as an "agent usability"
  surface; the product is a web dashboard + static marketing/content site.

Content coverage against `docs/seo_geo_content_plan.md`'s "Zero-Click & GEO
Champions" table was checked and is essentially complete (matching blog
posts exist for nist-ai-rmf, eu-ai-act, hipaa/gdpr, chatgpt/copilot privacy,
etc.), so no new content was added.

## Unreleased - 2026-08-26

- Subscription Checkout now returns its session ID to the signed-in dashboard.
  The return path verifies the organisation, Stripe-funded state, and live
  subscription before repairing a delayed webhook entitlement update.
- The webhook accepts only funded Checkout sessions, maps subscription status
  to Team/Business/Free correctly, and returns 5xx if an entitlement write
  fails so Stripe retries instead of silently losing a paid account.

## 2026-07-19: 15 new blog posts across Academy, News and Reviews

Added 15 fully-written, publication-ready posts on top of the existing 44,
targeting keywords from `docs/seo_geo_content_plan.md` not yet covered:
`ai policy`, `iso iec 23894`, `ai risk mitigation`, `ai and data protection`,
`responsible ai practices`, `ai trust risk and security management`,
`eu ai act risk categories`, `eu ai policy`, `ai ethics and governance`,
`ai and personal data`, `claude ai business`, `best ai marketing tools`,
`ai risk management software`, `ai usage policy`, `nist ai rmf`.

- **Format/category diversity.** 9 Academy posts (skyscraper, deep-dive,
  how-to, listicle, data study, case study), 3 News posts newsjacking the
  EU AI Act's 2 August 2026 high-risk deadline, the ICO's 2026 AI/ADM
  guidance work, and the ethics-governance regulatory convergence, and 3
  Reviews posts (Claude for Business, AI marketing tools, AI risk
  management software) - the first Reviews/News content on the site.
  `Post.category` (`"Academy" | "News" | "Reviews"`) added to the data
  model for this.
- **Length and depth.** Each post is 1,200+ words of body copy (checked
  programmatically), with a TL;DR, a sourced data table, an expert quote
  from an official body (NIST, ISO, ICO, Gartner, European Commission,
  Anthropic), 4-5 FAQs, and 3-6 internal links plus 2-5 external citations
  to primary sources (nist.gov, iso.org, ico.org.uk,
  digital-strategy.ec.europa.eu, anthropic.com).
- **Research.** Grounded in 2026 developments: the EU AI Act's Omnibus
  deferral and 2 August 2026 core deadline, the ICO's AI/ADM Code of
  Practice consultation and Recruitment Rewired findings, Anthropic's
  commercial data-training/retention terms, and the NIST AI RMF Playbook.
- **Images.** All 15 sourced live via the Unsplash MCP with photographer
  attribution; `images.unsplash.com` added to `next.config.ts` remote
  patterns alongside the existing Pexels domain.
- **Verification.** Full test suite, `tsc --noEmit`, `eslint` on changed
  files, and `next build` all green; confirmed all 15 new slugs render,
  appear on `/blog`, and are present in `sitemap.xml`.

## 2026-07-12: Blog content overhaul: full-spec rewrite of all 44 posts

Brought every existing blog post up to the publication-ready spec (length,
images, FAQs, tables, citations, attestation-grade sourcing) instead of
publishing new ones.

- **Data model.** `lib/posts.ts`'s `Post`/`PostSection` types gained `author`,
  `tldr`, `table`, `quote` and `faqs` fields. `PostSection.p` now supports
  inline `[text](url)` markdown links, parsed into real `<Link>`/`<a>`
  elements by a new `renderInline` helper in `app/blog/[slug]/page.tsx`.
- **Rendering.** The blog post page now renders a "Key takeaways" TL;DR box,
  a data table, a pull-quote, and an FAQ section (reusing the existing
  `FaqSection` component) with `FAQPage` JSON-LD alongside the existing
  `Article`/`BreadcrumbList` schema.
- **Images.** All 44 posts now have a featured image (11 were missing);
  sourced via the Pexels MCP integration with photographer attribution,
  matching the existing 33.
- **Content.** All 44 posts rewritten to 1,200-2,500 words (from an average
  of ~340) with TL;DRs, one data table and one sourced quote each, 3-5 FAQs,
  3-6 real internal links and 2-5 external citations per post (a shared,
  pre-verified citation kit: NIST AI RMF, EU AI Act, GDPR, HHS/HIPAA, ISO
  42001, AICPA SOC 2, and OpenAI/Microsoft/Anthropic/Google privacy pages).
  Author byline standardised to "ModelCharter Team". Keyword/date/slug
  preserved from the originals; titles and descriptions lightly tightened.
- **Style guardrail.** Found and fixed an em/en-dash regression the rewrite
  introduced (`test/no-em-dash.test.mts` guards against this as an
  AI-writing tell); all dashes normalised to plain hyphens across
  `lib/posts.ts`, plus a duplicate-dash bug in the new quote-attribution
  markup.
- **Verification.** Full test suite, lint and `next build` all green; spot-
  checked rendered HTML for TL;DR/table/quote/FAQ/schema/image presence;
  confirmed all 44 posts appear in `sitemap.xml`.

## 2026-07-07 (later): Supabase re-platform, weighted scoring, change alerts

Completed the work deferred from the Vetlark merge, on **Supabase** (the account
layer moved off Neon).

- **Neon to Supabase (full).** Replaced the custom Neon Postgres + bcrypt/jose
  JWT auth with Supabase Auth + Postgres + Row Level Security. New `@supabase/ssr`
  clients (`lib/supabase/{server,client,admin,middleware}`), root `middleware.ts`
  for session refresh, and SQL migrations under `supabase/migrations/` with RLS on
  every table, a security-definer org-membership helper in a private schema, and a
  `handle_new_user` trigger that gives each account a personal org. `lib/workspace`,
  the dashboard, the Stripe webhook and the public attestation page were rewritten
  onto Supabase (the webhook + attest + cron use the service-role client). Removed
  `@neondatabase/serverless`, `bcryptjs`, `jose` and `db/`, `scripts/migrate.mjs`.
- **Weighted-coverage risk model.** `lib/risk.ts` is now a weighted average over
  only the verified signals, rescaled to 0-100, with a `coverage` metric. Unknown
  facts lower confidence instead of silently counting as risk, and a tool with
  thin evidence (or that trains on your data by default) can never be rated Low.
- **Fact-change detection + alerts.** `lib/fact-signature.ts` diffs the current
  catalog against a stored snapshot of watched fact values. A daily cron
  (`/api/cron/sync-alerts`, fail-closed on `CRON_SECRET`, scheduled in
  `vercel.json`) raises an alert for any team watching a tool whose facts changed.
  New Supabase tables (`tool_fact_snapshots`, `tracked_tools`, `tool_alerts`), a
  "Watch" toggle on the tool register, and a change-alerts panel on the dashboard.
- **Tests.** New `test/fact-signature.test.mts`; `risk` tests rewritten for the
  coverage model. Full suite green; build passes.

Note: the code, migrations and RLS are complete and build green with an empty env
(the account layer degrades to a setup-pending state). Applying the migrations and
verifying auth end-to-end needs a live Supabase project (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`).

## 2026-07-07: Merge Vetlark (catalog, registry pages, tools, content)

Folded the genuinely additive parts of the retired Vetlark prototype (the same
product, built independently by another team) into ModelCharter, adapted to the
Neon/static stack. Nothing Supabase-specific was ported. All additions are
public, static and no-DB.

- **Directory expanded 22 to 60 tools.** Merged 38 net-new AI tools from Vetlark's
  catalog into `data/ai-tools.json`, mapped faithfully to our schema with sources
  preserved. Four unsourced "pending verification" stubs were deliberately dropped
  to keep the honesty contract. Added two categories (customer support, sales).
- **Registry answer pages.** `/tools/{slug}/{hipaa|gdpr|soc2|iso27001|training}`,
  the head-term "Is X HIPAA compliant?" / "Does X train on your data?" pages,
  answered from the same sourced facts (about 300 pages). Linked from each tool
  profile. `lib/registry-questions.ts`.
- **Compliance hubs.** `/compliance` and `/compliance/{hipaa|gdpr|soc-2|iso-27001|no-training}`
  plus industry hubs (healthcare, legal, finance, enterprise), each listing the
  tools that pass, computed from the facts. `lib/registry-frameworks.ts`.
- **Comparisons.** `/compare/{a}-vs-{b}` side-by-side pages; popular pairs are
  pre-rendered, any valid pair renders on demand. `lib/compare.ts`.
- **Free AI vendor risk assessment tool** at `/ai-vendor-risk-assessment`: pick a
  tool and your data types for an explainable approve / conditional / reject
  verdict, with CSV export. Pure engine in `lib/risk-assessment.ts` + `lib/csv.ts`.
- **Glossary.** `/glossary` and `/glossary/{term}`: 10 definitional pages (HIPAA
  BAA, SOC 2, GDPR DPA, subprocessors, model training, shadow AI and more).
- **3 new blog posts** ported and rewritten (consumer vs business tiers, how to vet
  an AI tool, shadow AI). Cannibalising posts (duplicating the new registry pages)
  were intentionally NOT ported.
- **Wiring.** Nav, footer, sitemap and `llms.txt` updated for every new surface.
  New tests in `test/registry.test.mts`. Build now emits ~496 static pages.

Deliberately deferred (recommended next): adopt Vetlark's weighted-coverage
scoring model, and its fact-signature change-detection + alerting (both need a
Neon migration and dashboard work).

## 2026-06-26: Rebrand to ModelCharter

Full rebrand from Greenlightly to ModelCharter across all source files, metadata,
legal copy, tests, package configuration and deployment config. Domain updated to
modelcharter.com; all @greenlightly.com email addresses updated to @modelcharter.com.
Hero tagline updated to "Charter your AI at work." Auth session cookie renamed from
gl_session to mc_session (existing sessions will require re-login).

## 2026-06-19 (later): Premium redesign, interactive illustrations, bug fixes

- **New visual identity.** Moved off the default emerald-on-white look to a warm
  paper background, a deep pine brand scale, a Fraunces display serif paired with
  Inter, and a traffic-signal motif (stop / caution / go) that maps directly to
  the risk bands. New signal logo mark, header, footer and shared button system.
- **Interactive, abstract product illustrations.** The home hero now shows a live
  "tool register" console (real tool names and risk bands) that cycles on its own,
  pauses on hover and lets you tap a tool to change its signal. New reusable app
  mockups for the policy document, the risk directory (with a radial risk gauge)
  and attestations, all fed by real data so they never drift from the app.
- **UI mockups across the marketing site.** Every "how it works" step now shows the
  surface it describes, framed in an app window. Pricing, directory, frameworks,
  blog and the rest were rebuilt around shared page primitives.
- **Removed the AI-design tells.** Stripped every em and en dash from user-facing
  copy and rewrote the phrasing in a plainer founder voice. Added a test that fails
  the build if an em or en dash reappears in any source string.
- **Bug fixes.** Stripe Business upgrades now provision the correct plan (session
  metadata was missing, so the webhook defaulted everyone to Team); session cookies
  are only `Secure` in production (they silently broke local-dev login); the Business
  upgrade button disables itself when no price is configured; the personal-org
  creation race no longer throws on a brand-new account's first load; attestation
  links require a saved policy; and every workspace read now verifies org membership
  in-query so a tenant can never read another tenant's data.

## 2026-06-19: Real product: live signup, dashboard & billing

- **Accounts are live.** Replaced the env-gated stub with real email+password
  auth (bcryptjs + jose JWT) on **Neon Postgres** (provisioned via Vercel
  Marketplace). Signup → workspace works end-to-end, no external provider.
- **Stripe billing live (test mode):** real Checkout for Team/Business, webhook
  updates the plan, customer billing portal, and paid-feature gating
  (attestations are Team+).
- **Trust & legal pages:** Privacy, Terms, Security and Contact (a compliance
  product needs them); linked from the footer and signup.
- **Directory search/filter:** search by tool/vendor + filter by category and
  risk band, with empty states.
- **Marketing:** real stats band (computed from the dataset), honest
  positioning vs enterprise tools.

## 2026-06-18 — Initial launch

First public release of ModelCharter — AI governance for teams without a
compliance department.

### Public (live, no backend)
- **AI Usage Policy Generator** — tailored, downloadable (Markdown / PDF), no signup.
- **AI Tool Risk Directory** — 22 popular AI tools rated for default at-work use,
  with data-handling facts sourced from each vendor's own policies (unverifiable
  facts shown as "Unverified", never guessed) and a transparent risk score.
- Programmatic per-tool pages ("Is X safe for work?").
- Framework guides: EU AI Act, NIST AI RMF, ISO 42001, SOC 2.
- SEO blog (5 launch posts) and GEO artifacts (JSON-LD, `llms.txt`, sitemap).

### Account / paid (env-gated — see SETUP.md)
- Supabase magic-link auth + RLS multi-tenant workspace.
- AI tool register (approve / restrict / review / prohibited).
- Versioned company AI policy + employee attestation links with a public sign page.
- Stripe Team ($49/mo) and Business ($149/mo) plans with checkout + webhook.

### Engineering
- Next.js 16 (App Router, TS) + Tailwind 4 on Vercel; public site fully static/ISR.
- 456 unit assertions across policy generation, risk scoring, dataset integrity,
  SEO builders and frameworks.
