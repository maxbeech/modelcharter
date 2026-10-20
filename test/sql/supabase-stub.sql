-- Just enough of Supabase for the migrations to run on a plain Postgres:
-- the roles, auth.users and auth.uid() reading the JWT subject like GoTrue does.
-- Roles are cluster-wide, so tolerate them from an earlier run.
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema auth;
create schema extensions;
create table auth.users (id uuid primary key, email text);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema public, auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated;
-- Supabase's default: API roles get table privileges, RLS does the scoping.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
