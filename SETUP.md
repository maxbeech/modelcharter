# Configuration

The public product (marketing, AI Usage Policy generator, AI Tool Risk
Directory, compliance hubs, comparisons, glossary, blog) needs **no** environment
and runs with an empty `.env`. The account layer (signup, team dashboard, tool
register, policies, attestations, change alerts, billing) is gated on env and
degrades to an honest "setup pending" state until it is wired up.

## Database and auth: Supabase

Accounts and all tenant data live in **Supabase** (Postgres + Auth + Row Level
Security). Users are managed by Supabase Auth (email + password); every tenant
table is scoped to the caller's org by RLS, not by hand-written filters.

1. Create a project at https://supabase.com.
2. Apply the migrations in `supabase/migrations/` in order:
   `0001_init.sql` (orgs, members, tool register, policies, attestations, RLS,
   and the new-user trigger), `0002_change_tracking.sql` (fact snapshots,
   watchlist, alerts), `20260710111604_harden_handle_new_user.sql`, then
   `20261020120000_lock_billing_columns.sql` (only the server can write
   `orgs.plan` and `stripe_*`; sign-off links need a paid org). Run them in the SQL editor, or with the CLI:
   `supabase db push` (after `supabase link`).
3. In **Authentication -> Providers -> Email**, decide on email confirmation.
   With "Confirm email" off, signup logs the user straight in. With it on, the
   signup form shows a "check your email to confirm" notice (needs an email
   provider configured in Supabase).
4. Copy the keys from **Project Settings -> API** into the env vars below.

Env vars (set as Helm7 variables and, for local dev, `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable, safe
  in the browser; RLS is what protects the data).
- `SUPABASE_SERVICE_ROLE_KEY` (server only). Used by the Stripe webhook and the
  alerts cron, both of which run with no user session. Never expose it to a
  client.

The Supabase clients live in `lib/supabase/` (`server`, `client`, `admin`,
`middleware`). `middleware.ts` refreshes the session on every request.

## Change alerts (cron)

`app/api/cron/sync-alerts` snapshots every tool's watched facts daily, diffs them
against the last snapshot, and raises an alert for any team watching a tool whose
facts changed. It runs as a Helm7 cron service (`0 6 * * *`).

- `CRON_SECRET` is a Helm7 variable. The route **fails closed**: it returns 503 unless
  `CRON_SECRET` is set and the request carries `Authorization: Bearer <CRON_SECRET>`.
  The Helm7 cron service sends that header on scheduled runs.
- The first run just establishes the baseline snapshot (no alerts).

## Billing: Stripe

One product is sold: the **HIPAA AI Kit**, a one-time $99 payment (Checkout
`mode: "payment"`). Create a one-time price in Stripe and set
`NEXT_PUBLIC_STRIPE_PRICE_HIPAA_KIT`. The webhook at `/api/stripe/webhook` needs
`checkout.session.completed` (plus the `customer.subscription.*` events while
legacy subscribers remain). A kit purchase sets `orgs.plan = 'hipaa_kit'`.

Ownership on the shared Stripe account is decided by price id only. The
generated gate (`lib/gate.ts`) reads prices from a subscription, which a
one-off session doesn't have, so kit sessions are checked by their line items
in `lib/billing/kit.ts` before anything is granted.

Team ($49/mo) and Business ($149/mo) are legacy: no longer sold, still honoured.
Keep `NEXT_PUBLIC_STRIPE_PRICE_TEAM` / `_BUSINESS` set while anyone is subscribed.

Checkout returns to the signed-in dashboard with its session ID. The dashboard
checks the session belongs to that organisation, is funded and (for the kit) is
this product's price before granting access, covering delayed webhook delivery.
A failed entitlement write returns 5xx to Stripe for retry.

Buy intent survives signup: `/signup?plan=hipaa_kit` (and `/login?plan=`) lands
on `/dashboard?buy=hipaa_kit`, which sends `begin_checkout` and continues to
Checkout.

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in Supabase (+ optionally Stripe, CRON_SECRET)
npm run dev                  # http://localhost:3000
npm test                     # unit tests
# RLS/migration test against a disposable Postgres (skipped without RLS_TEST_PG):
# RLS_TEST_PG="-h /tmp/pgsock -p 54329 -U postgres" npx tsx test/rls.test.mts
npm run build                # production build
```

