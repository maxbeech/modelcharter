-- handle_new_user is only meant to run as the auth.users insert trigger.
-- Postgres does not check EXECUTE privilege for internally-fired triggers, so
-- revoking direct callers closes the public.rpc/handle_new_user endpoint
-- without affecting signup.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
