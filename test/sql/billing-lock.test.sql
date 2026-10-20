-- Run by test/rls.test.mts against a throwaway database. Each check raises on
-- failure, naming what was attempted and what was expected.
\set ON_ERROR_STOP on
insert into auth.users values ('00000000-0000-0000-0000-00000000000a', 'owner@clinic.test'), ('00000000-0000-0000-0000-00000000000b', 'other@else.test');
grant usage on schema private to authenticated;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);

do $$
declare org uuid; n int;
begin
  select o.id into org from public.orgs o where o.created_by = auth.uid();
  if org is null then raise exception 'setup: signup trigger did not create an org'; end if;

  -- 1. A member cannot grant themselves a paid plan.
  begin
    update public.orgs set plan = 'hipaa_kit' where id = org;
    raise exception 'FAIL: member set orgs.plan = hipaa_kit (expected permission denied)';
  exception when insufficient_privilege then null; end;

  -- 2. Nor write Stripe ids.
  begin
    update public.orgs set stripe_customer_id = 'cus_x' where id = org;
    raise exception 'FAIL: member wrote stripe_customer_id (expected permission denied)';
  exception when insufficient_privilege then null; end;

  -- 3. Nor create a new org that starts paid.
  begin
    insert into public.orgs (name, created_by, plan) values ('Sneaky', auth.uid(), 'team');
    raise exception 'FAIL: member inserted an org with plan = team (expected permission denied)';
  exception when insufficient_privilege then null; end;

  -- 4. Renaming still works.
  update public.orgs set name = 'Riverside Dental' where id = org;
  if (select name from public.orgs where id = org) <> 'Riverside Dental' then raise exception 'FAIL: rename did not stick'; end if;

  -- 5. A free org cannot create sign-off links, even with the anon key.
  begin
    insert into public.attestations (org_id) values (org);
    raise exception 'FAIL: free org created an attestation (expected RLS violation)';
  exception when insufficient_privilege then null; end;

  -- 6. The ensureOrg fallback still works: a user may create an org and join it.
  insert into public.orgs (name, created_by) values ('Second', auth.uid());
  insert into public.org_members (org_id, user_id) select id, auth.uid() from public.orgs where name = 'Second';
end $$;

-- 7. Another user cannot join that org, even knowing its id.
reset role;
select set_config('test.target', (select id::text from public.orgs where name = 'Second'), false);
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000b', false);
do $$
begin
  begin
    insert into public.org_members (org_id, user_id) values (current_setting('test.target')::uuid, auth.uid());
    raise exception 'FAIL: another user joined an org by id (expected RLS violation)';
  exception when insufficient_privilege then null; end;
  if exists (select 1 from public.orgs where id = current_setting('test.target')::uuid) then
    raise exception 'FAIL: another user can read an org they are not in';
  end if;
end $$;
reset role;

-- 8. The server (service role) grants the kit, and then sign-off links work.
update public.orgs set plan = 'hipaa_kit' where created_by = '00000000-0000-0000-0000-00000000000a' and name = 'Riverside Dental';
set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-00000000000a', false);
insert into public.attestations (org_id) select id from public.orgs where name = 'Riverside Dental';
reset role;
select 'billing-lock: all checks passed';
