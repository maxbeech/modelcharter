# ModelCharter: why nobody buys Pro, and what to do about it

Plan date: 2026-10-20. The first step is to copy this file to `docs/monetisation_plan.md`.

## Context

You said nobody is converting to Pro and you think the offer isn't attractive enough. I checked the real numbers before getting into the offer, and I disagree with the framing. The offer is weak, but that isn't the main reason sales are zero.

**What the data shows (GA4 property 553366084, Search Console, Keyword Planner, codebase):**

- **Almost nobody visits.** There were about 273 users in 90 days. Organic search sent around 57 clicks from 22,472 impressions, at an average position of 36.5. Most "Direct" traffic is from the US and China with near-zero engagement, which looks like bots. At this volume, zero paid conversions is the expected result even for a great offer. Changing the offer alone can't fix it.
- **The funnel can't be measured.** GA only records automatic events (page_view, session_start). None of the journey events (sign_up, begin_checkout, purchase) show up. The analytics work in the uncommitted diff may be the reason. We also don't know how many people have signed up.
- **The funnel is broken.**
  - `/signup?plan=team` throws the chosen plan away and never starts checkout (`app/auth-actions.ts:16`).
  - Free signed-in users already get the register, versioned policy and alerts. Only attestations are paid, and only the UI enforces that: `actionCreateAttestation` has no server-side plan check.
- **Security hole, fix regardless.** The RLS policy `orgs_update` (`supabase/migrations/0001_init.sql:102-105`) appears to let any member set their own org's `plan` to `team` using the anon key.
- **The pricing page sells features that don't exist.** These include the PDF compliance report, member caps and invites, SSO, audit log, control mapping and priority support. That's a trust and legal problem.
- **"Change alerts" don't watch vendors.** They only fire when someone edits `data/ai-tools.json` by hand and redeploys. Selling them as monitoring would be misleading.
- **Demand sits in the wrong place for the current offer.** US monthly searches:

  | Theme | Searches |
  |---|---|
  | ai usage policy | 320 |
  | ai acceptable use policy | 260 |
  | ai policy template | 320 |
  | ai governance software | 390 |
  | ai policy generator | ~10 |
  | ai vendor risk assessment | ~20 |

  Healthcare questions are far bigger and low-competition:

  | Theme | Searches |
  |---|---|
  | hipaa compliant ai | 6,600 avg (spiked to 22–27k in Aug–Sep 2026) |
  | is chatgpt hipaa compliant | 880 |
  | is claude hipaa compliant | 720 (rising) |
  | is copilot hipaa compliant | 480 |
  | hipaa compliant ai tools | 390 |
  | hipaa compliant chatgpt | 390 |
  | is gemini hipaa compliant | 320 |
  | openai baa | 210 |
  | is otter ai hipaa compliant | 170 |
  | is grammarly hipaa compliant | 140 |
  | is notion hipaa compliant | 140 |

  The UK is about 3–5× smaller across the board.
- **Search Console is already ranking some pages.** Long-tail tool HIPAA pages sit at position 3–7. The big ones don't: `/compliance/hipaa` got 1,600 impressions at position 82, and `/tools/claude/hipaa` sits at 68.
- **Competitors** (full research is summarised in the doc):
  - Free AI policy generators are everywhere, mostly as lead-gen for IT or legal firms.
  - No competitor sells "AI policy software" to 10–200 person companies with any success.
  - Paid wedges in this space are discovery (Nudge Security, $750/mo), certifications a customer demands (Vanta, Drata) and per-seat training budgets (KnowBe4 at ~$1/seat).
  - The Digital Omnibus (Reg. 2026/1744) pushed EU high-risk deadlines to Dec 2027, so the urgency from the EU AI Act is mostly gone.
- **Your constraint:** low effort, SEO only, no sales.

**My conclusions on your four options:**

1. **"Make Pro better."** No. More features won't sell to an audience that isn't arriving. Generic SMB AI governance at $49/mo is a product that needs sales, and with no sales you can't get it to work.
2. **"A different product."** Partly. A recurring "register and attestations" SaaS is the wrong shape for inbound search. People searching "is ChatGPT HIPAA compliant" have a one-off question and a one-off need. They want to know if it's OK and to have something in writing.
3. **"Change persona."** Yes. Target small US healthcare and allied-health practices: therapists, dentists, chiropractors, small clinics, 1–50 staff. They have a concrete legal risk (HIPAA, BAAs), they search in volume, the competition is weak, and the site already has 60 tool HIPAA pages plus a HIPAA hub to build on. MSPs were the other candidate, but they need outreach, which rules them out under your constraint.
4. **"Don't launch."** Not yet. The site costs about £1/month on Helm7 and the content is built. Run one cheap, time-boxed test with a clear kill rule (below) rather than killing it now or spending more on generic Pro.

## Recommended approach

### Phase 0: Hygiene (do this whatever happens next)
1. **Fix the plan RLS hole.** Restrict `orgs_update` so `plan` and `stripe_*` can only be written by the service role. Use a column-level check or move billing columns into a separate service-only table. Apply via the Supabase MCP (per CLAUDE.md), and add a test asserting that an anon client can't change `plan`.
2. **Gate on the server.** Add a server-side entitlement check in `actionCreateAttestation` and `createAttestationLink` (`lib/workspace.ts:105`) using `isPaidPlan` from `lib/site.ts`.
3. **Make the pricing page honest.** Delete unbuilt features from `PLANS` (`lib/site.ts:41-93`). That file is the single source of truth, and the pricing page and checkout both read from it.
4. **Fix the signup-to-checkout hand-off.** Carry `plan` through signup into `/api/stripe/checkout` after the account is created.
5. **Commit the analytics work and confirm events fire.** Sign up as a test user and confirm `sign_up` and `begin_checkout` appear in GA DebugView. Count real signups in Supabase (excluding `app_metadata.is_test`) and record the baseline in the doc.

### Phase 1: Reposition to "AI for small healthcare practices"
Keep the brand and the general directory. Make healthcare the lead story and the thing people pay for.

**The offer: a one-off HIPAA AI Kit for $99, replacing Team and Business as the main paid item.**
- **Practice AI policy.** HIPAA-tailored, built by the existing generator (`components/PolicyGenerator.tsx`) with a healthcare preset: PHI rules and a BAA requirement per tool.
- **Approved-tools list.** Pulled from the directory facts (`data/ai-tools.json`), showing BAA availability and which plan tier carries the BAA, e.g. ChatGPT Enterprise vs Plus.
- **Staff sign-off.** Reuses the existing attestation flow (`app/attest/[token]`, `lib/workspace.ts`).
- **Evidence page.** A printable `/dashboard/evidence` page (print CSS, same "Save as PDF" pattern as the generator) covering policy version, tool decisions and who signed when. This is what a practice shows an auditor, an insurer or a patient who asks.
- **Billing.** One-off payment via Stripe Checkout `mode: "payment"`, which sets an entitlement like `kit_hipaa` on the org. Extend `lib/billing/entitlements.ts` and the webhook. Don't add another plan column.
- **Existing subscriptions.** Keep the subscription prices in Stripe, unlisted, so nothing breaks. Remove Team and Business from the pricing page. Check for active subscribers first, and keep the plans if there are any.
- **No recurring "monitoring" tier yet.** Only add one if vendor facts are actually re-checked on a schedule, which is a later, separate piece of work.

**The SEO side.** Put the effort where the volume is. Use ISR with weekly revalidation, the existing patterns and sitemap.
- **Rebuild `/compliance/hipaa` into the canonical "HIPAA-compliant AI tools" page.** Make it a clear yes/no/only-on-plan-X table drawn from the directory data, with the kit CTA.
- **Strengthen the high-volume tool pages:** ChatGPT, Claude, Copilot, Gemini, Otter, Grammarly, Notion. Each page should give a direct answer up top, say which plan gives a BAA, cite the source and date, and suggest safer alternatives.
- **Add an "OpenAI / ChatGPT BAA" explainer**, since it gets ~210+70 searches/mo at low competition.
- **Add a healthcare-preset entry point to the generator**, e.g. `/ai-usage-policy-generator?preset=healthcare` or a `/compliance/healthcare` CTA.
- **Re-verify the healthcare facts.** Run a fact-freshness pass on the BAA facts for the top tools before the pages are promoted, since `data/ai-tools.json` was generated on 2026-07-07. Unknown facts stay "Unverified", per the existing rule.
- **Optional later revenue:** affiliate links to HIPAA-ready AI tools such as AI scribes, clearly disclosed. Only do this after checking that real programmes exist, and keep it out of the first build.

### Phase 2: Decide on 2027-01-31 (about 14 weeks)
Make the call from the baseline recorded in Phase 0:
- **Fewer than 300 organic clicks/month and no kit sales:** park it. Freeze development, leave the static site up, remove paid CTAs, cancel the cron.
- **Traffic arrives but no sales:** keep it as a content and affiliate site and drop billing.
- **Any kit sales:** consider a recurring "keep it current" tier backed by real vendor re-checks and email alerts.

## Critical files
- **Plans and copy:** `lib/site.ts` (`PLANS`, `isPaidPlan`), `app/pricing/page.tsx`, `components/home.tsx`, `app/signup/page.tsx`, `app/auth-actions.ts`
- **Billing:** `app/api/stripe/checkout/route.ts`, `app/api/stripe/webhook/route.ts`, `lib/billing/entitlements.ts`, `lib/stripe-events.ts`
- **Gating:** `app/dashboard/actions.ts`, `lib/workspace.ts`, `app/dashboard/attestations/page.tsx`
- **Database and RLS:** Supabase `orgs_update` (via MCP), migration file kept in sync
- **SEO:** `app/compliance/[framework]`, `lib/registry-frameworks.ts`, `app/tools/[slug]/[question]`, `data/ai-tools.json`, `app/sitemap.ts`, `lib/posts.ts`
- **New:** `app/dashboard/evidence/page.tsx`, healthcare preset in the policy generator, `docs/monetisation_plan.md`
- **Also update:** `README.md`, `CHANGELOG.md`

## Verification
- **Unit tests** (`npm test`):
  - RLS test: anon/member can't change `plan` or entitlements.
  - Entitlement tests for one-off purchase events.
  - The attestation server gate.
  - `PLANS` contains no unbuilt features (a test pinning the feature list to built routes).
  - The healthcare preset produces BAA/PHI clauses.
  - The existing seo, sitemap and no-em-dash tests still pass.
- **Build:** `npm run build`. The ISR pages build and the new pages appear in the sitemap.
- **E2E:** a cheap-model subagent walks the journey in the browser pane on localhost:
  1. Land on `/compliance/hipaa`.
  2. Open the healthcare generator.
  3. Sign up with the test account from `.env.local` (create and save one if missing).
  4. Buy the kit with Stripe test card 4242.
  5. Create an attestation link, sign it, and open the evidence page and print preview.
  6. Confirm GA DebugView shows each journey event.
  7. Fix whatever it finds.
- **Manual (for you):**
  - Confirm live Stripe one-off price creation.
  - Confirm the GA events in production.
  - Note the Search Console baseline date for the 2027-01-31 review.

## Status (updated 2026-10-20)

**Built and tested:**
- Phase 0
- The Phase 1 kit: billing, dashboard, evidence pack and healthcare preset
- Repositioning of the homepage, pricing page and `/hipaa-ai-kit`

**Testing:**
- **Unit tests:** `npm test`, including the new `kit.test.mts`.
- **Database test:** `rls.test.mts` against a throwaway Postgres. It fails without the new migration.
- **Browser run:** a full end-to-end pass against a local Supabase stack. A self-upgrade attempt through the REST API returned 403 / 42501.

**Still to do by hand:**
1. **Apply the migration in production Supabase.** Paste `supabase/migrations/20261020120000_lock_billing_columns.sql` into the SQL editor. Until then the plan self-upgrade hole stays open in production.
2. **Create the Stripe price.** Make a one-time $99 price for "HIPAA AI Kit" and set `NEXT_PUBLIC_STRIPE_PRICE_HIPAA_KIT` on Helm7. Until then every buy button says checkout isn't switched on.
3. **Count signups.** Count real signups in Supabase, excluding `app_metadata.is_test`, for the baseline below.
4. **Check GA in production.** Confirm `sign_up` → `begin_checkout` → `purchase` in GA DebugView after the first test purchase. Use a live-mode price with a 100% coupon, or a test-mode deployment.

**SEO content, done 2026-10-20:**
- the HIPAA hub table
- the seven top tool HIPAA pages
- the "OpenAI BAA" post
- a recheck of the BAA facts

Notion AI is now Unverified.

**Baseline for the 2027-01-31 decision:**

| Metric | Value |
|---|---|
| GA users, 90 days to 2026-10-20 | 273 |
| Search Console clicks, 2026-07-20 to 2026-10-18 | 57 |
| Search Console impressions, same period | 22,472 |
| Average position | 36.5 |
| `/compliance/hipaa` | 1,600 impressions at position 82 |
| Kit sales | 0 |

**Known gaps outside this change:**
- The marketing header doesn't know you're signed in.
- The mobile nav has no menu button.
- Change alerts only fire when `data/ai-tools.json` is edited, so they're not real vendor monitoring.
