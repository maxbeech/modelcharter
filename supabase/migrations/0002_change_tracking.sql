-- Fact-change tracking + alerts.
--
-- The registry's facts live in the codebase (data/ai-tools.json), so "a vendor
-- changed their policy" is detected by diffing the current catalog against the
-- last snapshot of watched fact values. The cron job (service role) owns the
-- snapshot table and writes alerts; teams read/dismiss their own alerts via RLS.

-- Append-only latest signature per tool. No RLS policies => only the service
-- role (which bypasses RLS) can read or write it. Never exposed to a browser.
create table if not exists public.tool_fact_snapshots (
  tool_slug text primary key,
  signature jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.tool_fact_snapshots enable row level security;

-- Which tools a team wants change alerts for.
create table if not exists public.tracked_tools (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  tool_slug text not null,
  created_at timestamptz not null default now(),
  unique (org_id, tool_slug)
);
create index if not exists idx_tracked_org on public.tracked_tools(org_id);
create index if not exists idx_tracked_slug on public.tracked_tools(tool_slug);
alter table public.tracked_tools enable row level security;

drop policy if exists tracked_all on public.tracked_tools;
create policy tracked_all on public.tracked_tools for all to authenticated
  using (org_id in (select private.user_org_ids()))
  with check (org_id in (select private.user_org_ids()));

-- Alerts raised for a team when a tracked tool's facts change.
create table if not exists public.tool_alerts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  tool_slug text not null,
  kind text not null default 'policy_changed',    -- policy_changed
  title text not null,
  detail text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_alerts_org on public.tool_alerts(org_id, read);
alter table public.tool_alerts enable row level security;

-- Teams can read and mark-read their own alerts. Inserts come from the cron
-- (service role), so there is deliberately no INSERT policy for authenticated.
drop policy if exists alerts_select on public.tool_alerts;
create policy alerts_select on public.tool_alerts for select to authenticated
  using (org_id in (select private.user_org_ids()));
drop policy if exists alerts_update on public.tool_alerts;
create policy alerts_update on public.tool_alerts for update to authenticated
  using (org_id in (select private.user_org_ids()))
  with check (org_id in (select private.user_org_ids()));
