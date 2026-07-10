-- ModelCharter core schema on Supabase (Postgres + Auth + RLS).
-- Users live in auth.users (managed by Supabase Auth). Every tenant table is
-- scoped to the orgs the signed-in user belongs to, enforced by RLS rather than
-- by hand-written WHERE clauses. Idempotent where practical.

-- Security-definer helpers live in a private (unexposed) schema so they are not
-- reachable through the Data API.
create schema if not exists private;

-- pgcrypto for gen_random_bytes() (attestation tokens). gen_random_uuid() is
-- native to Postgres 13+ and needs no extension.
create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My team',
  plan text not null default 'free',              -- free | team | business
  stripe_customer_id text,
  stripe_subscription_id text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',             -- owner | admin | member
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create table if not exists public.tool_register (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  tool_slug text not null,
  name text not null,
  status text not null default 'review',          -- approved | restricted | review | prohibited
  notes text,
  updated_at timestamptz not null default now(),
  unique (org_id, tool_slug)
);

create table if not exists public.policies (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  version int not null default 1,
  content_md text not null,
  input_json jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.attestations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  policy_id uuid references public.policies(id) on delete set null,
  token text not null unique default encode(extensions.gen_random_bytes(12), 'hex'),
  name text,
  email text,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_members_user on public.org_members(user_id);
create index if not exists idx_register_org on public.tool_register(org_id);
create index if not exists idx_policies_org on public.policies(org_id);
create index if not exists idx_attest_org on public.attestations(org_id);
create index if not exists idx_attest_token on public.attestations(token);

-- ---------------------------------------------------------------------------
-- Helper: the org ids the current user belongs to. security definer so the
-- policies below can reference org_members without recursive RLS evaluation.
-- ---------------------------------------------------------------------------
create or replace function private.user_org_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select org_id from public.org_members where user_id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.tool_register enable row level security;
alter table public.policies enable row level security;
alter table public.attestations enable row level security;

-- orgs: members can read and update their org; a user may create an org they own.
drop policy if exists orgs_select on public.orgs;
create policy orgs_select on public.orgs for select to authenticated
  using (id in (select private.user_org_ids()));
drop policy if exists orgs_insert on public.orgs;
create policy orgs_insert on public.orgs for insert to authenticated
  with check (created_by = (select auth.uid()));
drop policy if exists orgs_update on public.orgs;
create policy orgs_update on public.orgs for update to authenticated
  using (id in (select private.user_org_ids()))
  with check (id in (select private.user_org_ids()));

-- org_members: a user can see rows for their own orgs and add themselves.
drop policy if exists members_select on public.org_members;
create policy members_select on public.org_members for select to authenticated
  using (user_id = (select auth.uid()) or org_id in (select private.user_org_ids()));
drop policy if exists members_insert on public.org_members;
create policy members_insert on public.org_members for insert to authenticated
  with check (user_id = (select auth.uid()));

-- tenant tables: full access scoped to the user's orgs (SELECT policy present so
-- UPDATE can locate the row).
drop policy if exists register_all on public.tool_register;
create policy register_all on public.tool_register for all to authenticated
  using (org_id in (select private.user_org_ids()))
  with check (org_id in (select private.user_org_ids()));

drop policy if exists policies_all on public.policies;
create policy policies_all on public.policies for all to authenticated
  using (org_id in (select private.user_org_ids()))
  with check (org_id in (select private.user_org_ids()));

drop policy if exists attestations_all on public.attestations;
create policy attestations_all on public.attestations for all to authenticated
  using (org_id in (select private.user_org_ids()))
  with check (org_id in (select private.user_org_ids()));
-- Note: the public attestation sign page reads/writes by unguessable token via
-- the service-role client (server only), so no anon policy is needed here.

-- ---------------------------------------------------------------------------
-- New-user trigger: give every new account a personal org it owns. The tool
-- register is seeded lazily from the app (the tool list lives in the codebase).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  team_name text;
  new_org_id uuid;
begin
  team_name := split_part(split_part(coalesce(new.email, ''), '@', 2), '.', 1);
  if team_name is null or team_name = '' then
    team_name := 'My team';
  end if;
  insert into public.orgs (name, created_by) values (initcap(team_name), new.id)
    returning id into new_org_id;
  insert into public.org_members (org_id, user_id, role) values (new_org_id, new.id, 'owner');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
