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
   and the new-user trigger) then `0002_change_tracking.sql` (fact snapshots,
   watchlist, alerts). Run them in the SQL editor, or with the CLI:
   `supabase db push` (after `supabase link`).
3. In **Authentication -> Providers -> Email**, decide on email confirmation.
   With "Confirm email" off, signup logs the user straight in. With it on, the
   signup form shows a "check your email to confirm" notice (needs an email
   provider configured in Supabase).
4. Copy the keys from **Project Settings -> API** into the env vars below.

Env vars (set in Vercel and, for local dev, `.env.local`):

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
facts changed. It is scheduled in `vercel.json` (`0 6 * * *`).

- Set `CRON_SECRET` in Vercel. The route **fails closed**: it returns 503 unless
  `CRON_SECRET` is set and the request carries `Authorization: Bearer <CRON_SECRET>`.
  Vercel injects that header on scheduled runs automatically.
- The first run just establishes the baseline snapshot (no alerts).

## Billing: Stripe

Two recurring prices (Team $49, Business $149) and a webhook at
`/api/stripe/webhook`. Env vars: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`NEXT_PUBLIC_STRIPE_PRICE_TEAM`, `NEXT_PUBLIC_STRIPE_PRICE_BUSINESS`. The webhook
updates `orgs.plan` via the service-role client. Each upgrade button disables
itself when its price is not configured, so it never dead-ends.

Checkout returns to the signed-in dashboard with its session ID. The dashboard
checks the session belongs to that organisation and is funded before reconciling
the plan from Stripe, covering delayed webhook delivery. Unfunded sessions never
grant access, and a failed entitlement write returns 5xx to Stripe for retry.

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in Supabase (+ optionally Stripe, CRON_SECRET)
npm run dev                  # http://localhost:3000
npm test                     # unit tests
npm run build                # production build
```

`vercel env pull` can populate `.env.local` from the Vercel project instead.
