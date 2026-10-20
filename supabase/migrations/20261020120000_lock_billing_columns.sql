-- Billing state is written by the server only.
--
-- Before this, orgs_update let any member update every column of their own
-- org, so a signed-in user holding the public anon key could set
-- orgs.plan = 'hipaa_kit' (or 'team') and unlock paid features without paying.
-- RLS policies pick rows, not columns, so the fix is column privileges: members
-- may still rename their org, and only the service role (Stripe webhook and
-- checkout reconcile, which bypass these grants) can touch plan or stripe_*.
--
-- Idempotent: safe to run more than once.

revoke insert, update on public.orgs from anon, authenticated;
grant insert (name, created_by) on public.orgs to authenticated;
grant update (name) on public.orgs to authenticated;

-- A creator can always see the org they created. Without this the ensureOrg
-- fallback (insert ... returning) failed, because the row was not yet visible
-- through membership.
drop policy if exists orgs_select on public.orgs;
create policy orgs_select on public.orgs for select to authenticated
  using (id in (select private.user_org_ids()) or created_by = (select auth.uid()));

-- A user may only add themselves to an org they created (the fallback in
-- lib/workspace.ts ensureOrg). Previously any user could join any org whose id
-- they knew, and so inherit its paid plan.
drop policy if exists members_insert on public.org_members;
create policy members_insert on public.org_members for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and org_id in (select id from public.orgs where created_by = (select auth.uid()))
  );

-- Staff sign-off links are a paid feature. The server action checks the plan;
-- this makes the database agree, so the anon key can't create them either.
create or replace function private.org_is_paid(target uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.orgs
    where id = target and plan in ('hipaa_kit', 'team', 'business')
  )
$$;
revoke execute on function private.org_is_paid(uuid) from public, anon;
grant execute on function private.org_is_paid(uuid) to authenticated;

drop policy if exists attestations_all on public.attestations;
drop policy if exists attestations_select on public.attestations;
drop policy if exists attestations_insert on public.attestations;
drop policy if exists attestations_update on public.attestations;
drop policy if exists attestations_delete on public.attestations;
create policy attestations_select on public.attestations for select to authenticated
  using (org_id in (select private.user_org_ids()));
create policy attestations_insert on public.attestations for insert to authenticated
  with check (org_id in (select private.user_org_ids()) and private.org_is_paid(org_id));
create policy attestations_update on public.attestations for update to authenticated
  using (org_id in (select private.user_org_ids()))
  with check (org_id in (select private.user_org_ids()));
create policy attestations_delete on public.attestations for delete to authenticated
  using (org_id in (select private.user_org_ids()));
